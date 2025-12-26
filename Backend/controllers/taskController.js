const Task = require("../models/Task");
const User = require("../models/User");
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper function to handle file uploads
const handleFileUpload = (file) => {
  if (!file) return null;
  
  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;
  const filePath = path.join('uploads', 'tasks', fileName);
  
  // In a real app, you'd save to cloud storage (S3, etc.)
  fs.renameSync(file.path, path.join('public', filePath));
  
  return {
    url: `/api/${filePath}`,
    name: file.originalname,
    type: file.mimetype,
    size: file.size
  };
};

const STATUS_LABELS = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const normalizePriority = (value = "medium") => {
  if (!value) return "medium";
  const normalized = value.toString().toLowerCase();
  if (["low", "medium", "high"].includes(normalized)) {
    return normalized;
  }
  return "medium";
};

const normalizeStatus = (value = "pending") => {
  if (!value) return "pending";
  const normalized = value.toString().toLowerCase();
  if (["pending", "to do", "todo"].includes(normalized)) return "pending";
  if (["in progress", "in-progress", "in_progress"].includes(normalized)) return "in-progress";
  if (["completed", "done"].includes(normalized)) return "completed";
  return "pending";
};

const formatStatusLabel = (status = "pending") => STATUS_LABELS[status] || "Pending";
const formatPriorityLabel = (priority = "medium") => PRIORITY_LABELS[priority] || "Medium";

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      attachments = [],
      checklist = [],
    } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: "Title, description and due date are required." });
    }

    let assignee = null;
    if (assignedTo) {
      // Handle both string and array formats
      const userId = Array.isArray(assignedTo) ? assignedTo[0] : assignedTo;
      assignee = await User.findById(userId);
      if (!assignee) {
        return res.status(404).json({ message: "Assigned user not found." });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      priority: normalizePriority(priority),
      status: normalizeStatus(status),
      dueDate,
      assignedTo: assignee ? assignee._id : undefined,
      createdBy: req.user?._id || assignee?._id, // Fallback to assigned user if no auth user
      attachments,
      todoChecks: (checklist || [])
        .filter((item) => item && item.text && item.text.trim().length)
        .map((item) => ({
          text: item.text.trim(),
          completed: !!item.completed,
        })),
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Unable to create task", error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const filter = {};
    // Only filter by assignedTo if the user is not an admin
    if (req.user && req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .lean();

    res.json(
      tasks.map((task) => ({
        ...task,
        statusLabel: formatStatusLabel(task.status),
        priorityLabel: formatPriorityLabel(task.priority),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch tasks", error: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const [statusCounts, priorityCounts, recentTasks] = await Promise.all([
      Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Task.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title status priority createdAt")
        .lean(),
    ]);

    const statusMap = statusCounts.reduce(
      (acc, item) => ({ ...acc, [item._id || "pending"]: item.count }),
      {}
    );
    const priorityMap = priorityCounts.reduce(
      (acc, item) => ({ ...acc, [item._id || "medium"]: item.count }),
      {}
    );

    const charts = {
      taskDistribution: {
        Pending: statusMap.pending || 0,
        InProgress: statusMap["in-progress"] || 0,
        Completed: statusMap.completed || 0,
      },
      taskPriorityDistribution: {
        High: priorityMap.high || 0,
        Medium: priorityMap.medium || 0,
        Low: priorityMap.low || 0,
      },
    };

    const formattedRecentTasks = recentTasks.map((task) => ({
      id: task._id,
      title: task.title,
      status: formatStatusLabel(task.status),
      priority: formatPriorityLabel(task.priority),
      createdAt: task.createdAt,
    }));

    res.json({
      charts,
      recentTasks: formattedRecentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch dashboard data", error: error.message });
  }
};

const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get task counts by status
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      recentTasks
    ] = await Promise.all([
      // Total tasks assigned to user
      Task.countDocuments({ assignedTo: userId }),
      
      // Completed tasks
      Task.countDocuments({ 
        assignedTo: userId, 
        status: { $in: ['completed', 'Completed'] } 
      }),
      
      // Pending tasks
      Task.countDocuments({ 
        assignedTo: userId, 
        status: { $in: ['pending', 'Pending', 'pending', 'to do', 'todo'] } 
      }),
      
      // In Progress tasks
      Task.countDocuments({ 
        assignedTo: userId, 
        status: { $in: ['in-progress', 'in progress', 'in_progress', 'In Progress'] } 
      }),
      
      // Recent tasks (last 5)
      Task.find({ assignedTo: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo', 'name email')
        .lean()
    ]);

    // Format the response
    const dashboardData = {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      recentTasks: recentTasks.map(task => ({
        _id: task._id,
        title: task.title,
        description: task.description,
        status: formatStatusLabel(task.status),
        priority: formatPriorityLabel(task.priority),
        dueDate: task.dueDate,
        assignedTo: task.assignedTo ? task.assignedTo.name : 'Unassigned'
      }))
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard data', 
      error: error.message 
    });
  }
};

// Get all tasks with filtering and pagination
const getAllTasks = async (req, res, next) => {
  try {
    const { status, assignedTo, sortBy, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by assigned user - only allow admins to see all tasks
    if (req.user && req.user.role !== 'admin') {
      // For non-admin users, only show tasks assigned to them
      query.assignedTo = req.user._id;
    } else if (assignedTo && req.user && req.user.role === 'admin') {
      // Allow admins to filter by specific user
      query.assignedTo = assignedTo;
    }

    // Sorting
    const sort = {};
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      sort[field] = order === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest first
    }
    
    // Pagination - use lean() to avoid Mongoose document serialization issues
    const tasks = await Task.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean();

    const count = await Task.countDocuments(query);

    res.json({
      success: true,
      count: tasks.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      tasks
    });
  } catch (error) {
    console.error('Error in getAllTasks:', error);
    next(error);
  }
};

// Get single task by ID
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate task ID
    if (!id || id === 'undefined') {
      console.error('Invalid task ID:', id);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid task ID' 
      });
    }

    // Validate MongoDB ID format if needed
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid task ID format' 
      });
    }

    console.log('Fetching task with ID:', id);
    
    const task = await Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email')
      .populate('attachments.uploadedBy', 'name email');

    if (!task) {
      console.error('Task not found with ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    console.log('Task found:', task._id);
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error in getTaskById:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid task ID format' 
      });
    }
    
    next(error);
  }
};

// Update task
const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, assignedTo } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Update fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;

    const updatedTask = await task.save();
    
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// Delete task
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.remove();
    
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Update task status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status || task.status;
    
    // Set completedAt if status is completed
    if (status === 'completed') {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    const updatedTask = await task.save();
    
    res.json({ success: true, data: updatedTask });
  } catch (error) {
    next(error);
  }
};

// Add comment to task
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const files = req.files || [];
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = {
      user: req.user.id,
      text,
      attachments: files.map(file => ({
        url: `/uploads/${file.filename}`,
        name: file.originalname,
        type: file.mimetype,
        size: file.size
      }))
    };

    task.comments.unshift(comment);
    await task.save();
    
    // Populate the user details in the response
    await task.populate('comments.user', 'name email');
    
    res.status(201).json({ 
      success: true, 
      data: task.comments[0] 
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment
const deleteComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Find the comment index
    const commentIndex = task.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check if user is the comment author or admin
    if (task.comments[commentIndex].user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this comment' 
      });
    }

    // Remove comment
    task.comments.splice(commentIndex, 1);
    await task.save();
    
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Upload attachment to task
const uploadAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const attachment = {
      url: `/uploads/tasks/${req.file.filename}`,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id
    };

    task.attachments.push(attachment);
    await task.save();
    
    res.status(201).json({ success: true, data: attachment });
  } catch (error) {
    next(error);
  }
};

// Delete attachment
const deleteAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Find the attachment index
    const attachmentIndex = task.attachments.findIndex(
      attachment => attachment._id.toString() === req.params.attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    // Check if user is the uploader or admin
    if (task.attachments[attachmentIndex].uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this attachment' 
      });
    }

    // Remove attachment (in a real app, you'd also delete the file from storage)
    task.attachments.splice(attachmentIndex, 1);
    await task.save();
    
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getDashboardData,
  getUserDashboardData,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  deleteComment,
  uploadAttachment,
  deleteAttachment,
  normalizePriority,
  normalizeStatus,
  formatStatusLabel,
  formatPriorityLabel,
};

const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const taskController = require('../controllers/taskController');
const upload = require('../middleware/upload');
const Task = require('../models/Task');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Dashboard data routes - must come before parameterized routes
router.get('/dashboard-data', taskController.getDashboardData);
router.get('/user-dashboard-data', taskController.getUserDashboardData);

// Task routes
router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

// Task status
router.put('/:id/status', taskController.updateTaskStatus);

// Comments
router.post('/:id/comments', upload.array('files'), taskController.addComment);
router.delete('/:id/comments/:commentId', taskController.deleteComment);

// Attachments
router.post(
  '/:id/attachments',
  upload.single('file'),
  taskController.uploadAttachment
);
router.delete('/:id/attachments/:attachmentId', taskController.deleteAttachment);

// Debug route (temporary) - must come before parameterized routes
router.get('/debug/all-tasks', async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean();
    
    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Temporary route to create task for Mohit without auth (for testing)
router.post('/debug/create-for-mohit', async (req, res) => {
  try {
    const taskController = require('../controllers/taskController');
    // Mock user object for Mohit
    req.user = { _id: '69272c93cd1c4e111b677d78', role: 'member' };
    return taskController.createTask(req, res);
  } catch (error) {
    console.error('Error creating task for Mohit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Parameterized routes - must come after all static routes
router
  .route('/:id')
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .delete(authorize('admin'), taskController.deleteTask);

module.exports = router;

const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const ErrorResponse = require("../utils/errorResponse");

// @desc     Get all users with pagination, search and filtering
// @route    GET /api/users
// @access   Private (Admin)
const getUsers = async (req, res, next) => {
    try {
        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude from filtering
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);
        
        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        
        // Finding resource
        let query = User.find(JSON.parse(queryStr)).select('-password');

        // Search
        if (req.query.search) {
            const search = new RegExp(req.query.search, 'i');
            query = query.or([
                { name: search },
                { email: search },
                { role: search }
            ]);
        }

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await User.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const users = await query;

        // Add task counts to each user
        const usersWithTasks = await Promise.all(
            users.map(async (user) => {
                try {
                    const pendingTasks = await Task.countDocuments({ 
                        assignedTo: user._id, 
                        status: { $in: ['pending', 'Pending', 'PENDING'] }
                    });
                    const inProgressTasks = await Task.countDocuments({ 
                        assignedTo: user._id,
                        status: { $in: ['in-progress', 'In Progress', 'in_progress', 'In-Progress'] }
                    });
                    const completedTasks = await Task.countDocuments({ 
                        assignedTo: user._id, 
                        status: { $in: ['completed', 'Completed', 'COMPLETED'] }
                    });

                    return {
                        ...user._doc,
                        pendingTasks,
                        inProgressTasks,
                        completedTasks,
                    };
                } catch (error) {
                    console.error(`Error fetching tasks for user ${user._id}:`, error);
                    return {
                        ...user._doc,
                        pendingTasks: 0,
                        inProgressTasks: 0,
                        completedTasks: 0,
                        error: 'Error loading task counts'
                    };
                }
            })
        );

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: usersWithTasks.length,
            total,
            pagination,
            data: usersWithTasks
        });
    } catch (err) {
        console.error('Error in getUsers:', err);
        next(err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to load users',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// @desc     Get single user by ID
// @route    GET /api/users/:id
// @access   Private
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        // Get user's task statistics
        const pendingTasks = await Task.countDocuments({ 
            assignedTo: user._id, 
            status: { $in: ['pending', 'Pending', 'PENDING'] }
        });
        
        const inProgressTasks = await Task.countDocuments({ 
            assignedTo: user._id,
            status: { $in: ['in-progress', 'In Progress', 'in_progress', 'In-Progress'] }
        });
        
        const completedTasks = await Task.countDocuments({ 
            assignedTo: user._id, 
            status: { $in: ['completed', 'Completed', 'COMPLETED'] }
        });

        const userWithTasks = {
            ...user._doc,
            taskStats: {
                pending: pendingTasks,
                inProgress: inProgressTasks,
                completed: completedTasks,
                total: pendingTasks + inProgressTasks + completedTasks
            }
        };

        res.status(200).json({
            success: true,
            data: userWithTasks
        });
    } catch (err) {
        next(err);
    }
};

// @desc     Update user role or status (Admin only)
// @route    PUT /api/users/:id
// @access   Private (Admin)
const updateUser = async (req, res, next) => {
    try {
        // Only allow updating role and isActive for security
        const { role, isActive } = req.body;
        
        const updateFields = {};
        if (role) updateFields.role = role;
        if (typeof isActive === 'boolean') updateFields.isActive = isActive;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc     Delete a user (Admin only)
// @route    DELETE /api/users/:id
// @access   Private (Admin)
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        // Prevent deleting own account
        if (user._id.toString() === req.user.id) {
            return next(new ErrorResponse('You cannot delete your own account', 400));
        }

        await user.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc     Create a new user (Admin only)
// @route    POST /api/users
// @access   Private (Admin)
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role = 'member' } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return next(new ErrorResponse('Please provide name, email and password', 400));
        }

        // Check if user already exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return next(new ErrorResponse('User already exists with this email', 400));
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role.toLowerCase()
        });

        // Remove password from output
        user.password = undefined;

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc     Get non-admin users for task assignment
// @route    GET /api/users/for-assignment
// @access   Private
const getUsersForAssignment = async (req, res, next) => {
    try {
        console.log('Fetching users for assignment...');
        
        // Find only active, non-admin users and exclude sensitive fields
        // Note: isActive is filtered out by default due to pre-find middleware
        const users = await User.find({ 
            role: 'member'
        }).select('name email profileImageUrl');

        console.log('Found users for assignment:', users.length);
        console.log('Users:', users);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error in getUsersForAssignment:', error);
        next(error);
    }
};

module.exports = { 
    getUsers, 
    getUserById, 
    createUser,
    updateUser,
    deleteUser,
    getUsersForAssignment
};
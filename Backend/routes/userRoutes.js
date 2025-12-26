const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const { 
    getUsers, 
    getUsersForAssignment,
    getUserById, 
    createUser,
    updateUser,
    deleteUser 
} = require("../controllers/userController");

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Get non-admin users for task assignment (must be before the "/:id" route)
router.get('/for-assignment', (req, res, next) => {
    console.log('getUsersForAssignment handler called');
    return getUsersForAssignment(req, res, next);
});

// User Management Routes
router.route("/")
    .get(adminOnly, getUsers)  // Get all users with pagination (Admin only)
    .post(adminOnly, createUser); // Create new user (Admin only)

router.route("/:id")
    .get(getUserById)        // Get specific user
    .put(adminOnly, updateUser) // Update user role/status (Admin only)
    .delete(adminOnly, deleteUser); // Delete user (Admin only)

module.exports = router;
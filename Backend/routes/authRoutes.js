const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, updatePassword } = require("../controllers/authController");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

///Auth Routes will be here
router.post("/register", registerUser);  //Register a new user
router.post("/login", loginUser);        //Login user
router.get("/profile", protect, getUserProfile);     //Get user profile
router.put("/profile", protect, updateUserProfile);  //Update user profile
router.put("/update-password", protect, updatePassword);  //Update user password

router.post("/upload-image", upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/profiles/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

module.exports = router;
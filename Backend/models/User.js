const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    username: { 
      type: String, 
      unique: true,
      sparse: true, // Allow multiple documents without this field
      default: null
    },
    email: { 
      type: String, 
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: { 
      type: String, 
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password in queries by default
    },
    role: { 
      type: String, 
      enum: {
        values: ['admin', 'member'],
        message: 'Role is either: admin or member'
      },
      default: 'member',
      lowercase: true
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false
    },
    lastLogin: {
      type: Date
    },
    profileImageUrl: { 
      type: String, 
      default: null 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Query middleware to exclude inactive users by default
userSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Virtual for getting user's full name
userSchema.virtual('fullName').get(function() {
  return this.name ? this.name.trim() : '';
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
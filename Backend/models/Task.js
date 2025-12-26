const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  attachments: [{
    url: String,
    name: String,
    type: String,
    size: Number
  }]
}, { timestamps: true });

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    dueDate: { type: Date, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [{
      url: String,
      name: String,
      type: String,
      size: Number,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    comments: [commentSchema],
    todoChecks: [todoSchema],
    progress: { type: Number, default: 0 },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
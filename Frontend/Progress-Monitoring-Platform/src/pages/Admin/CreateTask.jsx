import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PRIORITY_DATA, STATUS_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useUserAuth } from "../../hooks/useUserAuth";
import SelectUsers from "../../components/Inputs/SelectUsers";
import { FiPaperclip, FiX, FiFile, FiImage } from "react-icons/fi";

const mapStatusToApi = (status) => {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return "completed";
  if (normalized === "in progress") return "in-progress";
  return "pending";
};

const mapPriorityToApi = (priority) => priority.toLowerCase();

const CreateTask = () => {
  useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskId, setTaskId] = useState(null);

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    priority: PRIORITY_DATA[1].value,
    status: STATUS_DATA[0].value,
    dueDate: "",
    assignedTo: "",
    checklist: [{ id: Date.now(), text: "", completed: false }],
  });

  const [users, setUsers] = useState(() => []);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axiosInstance.get(API_PATHS.USERS.GET_USERS_FOR_ASSIGNMENT);
        setUsers(response.data || []);
      } catch (error) {
        console.error("Unable to load users", error);
        setFeedback({
          type: "error",
          message: "Unable to load users. You can still create an unassigned task.",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    // Check if we're in edit mode
    if (location.state?.taskId) {
      setIsEditMode(true);
      setTaskId(location.state.taskId);
      // If we have task data in location state, use it
      if (location.state.taskData) {
        const { title, description, priority, status, dueDate, assignedTo, checklist } = location.state.taskData;
        setFormValues({
          title: title || "",
          description: description || "",
          priority: priority || PRIORITY_DATA[1].value,
          status: status || STATUS_DATA[0].value,
          dueDate: dueDate || "",
          assignedTo: assignedTo || "",
          checklist: checklist?.length ? checklist : [{ id: Date.now(), text: "", completed: false }]
        });
      } else if (location.state.taskId) {
        // If we only have taskId, fetch the task data
        const fetchTask = async () => {
          try {
            const response = await axiosInstance.get(`${API_PATHS.TASKS.GET_TASK_BY_ID.replace(':id', location.state.taskId)}`);
            const task = response.data;
            setFormValues({
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: task.status,
              dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
              assignedTo: task.assignedTo?._id || "",
              checklist: task.checklist?.length ? task.checklist : [{ id: Date.now(), text: "", completed: false }]
            });
          } catch (error) {
            console.error("Error fetching task:", error);
            setFeedback({
              type: "error",
              message: "Failed to load task data. Please try again."
            });
          }
        };
        fetchTask();
      }
    }

    fetchUsers();
  }, [location]);

  const updateFormValue = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleChecklistChange = (index, value) => {
    setFormValues((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item, idx) =>
        idx === index ? { ...item, text: value } : item
      ),
    }));
  };

  const toggleChecklistCompleted = (index) => {
    setFormValues((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item, idx) =>
        idx === index ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const addChecklistItem = () => {
    setFormValues((prev) => ({
      ...prev,
      checklist: [...prev.checklist, { id: Date.now(), text: "", completed: false }],
    }));
  };

  const removeChecklistItem = (index) => {
    setFormValues((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, idx) => idx !== index),
    }));
  };

  const resetForm = () => {
    setFormValues({
      title: "",
      description: "",
      priority: PRIORITY_DATA[1].value,
      status: STATUS_DATA[0].value,
      dueDate: "",
      assignedTo: "",
      checklist: [{ id: Date.now(), text: "", completed: false }],
    });
    setFeedback({ type: "success", message: "Task created successfully." });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!formValues.title.trim() || !formValues.description.trim() || !formValues.dueDate) {
      setFeedback({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        priority: mapPriorityToApi(formValues.priority),
        status: mapStatusToApi(formValues.status),
        dueDate: formValues.dueDate,
        assignedTo: formValues.assignedTo || undefined,
        checklist: formValues.checklist
          .filter((item) => item.text.trim().length)
          .map((item) => ({
            ...item,
            text: item.text.trim(),
            completed: item.completed || false
          })),
      };

      if (isEditMode && taskId) {
        // Update existing task
        await axiosInstance.put(`${API_PATHS.TASKS.UPDATE_TASK}/${taskId}`, payload);
        setFeedback({ type: "success", message: "Task updated successfully!" });
        setTimeout(() => {
          navigate("/admin/tasks", { replace: true });
        }, 1000);
      } else {
        // Create new task
        await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, payload);
        resetForm();
        navigate("/admin/tasks", { replace: true });
      }
    } catch (error) {
      console.error("Error saving task:", error);
      const message =
        error?.response?.data?.message ||
        `Unable to ${isEditMode ? 'update' : 'create'} task. Please try again later.`;
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      setSubmitting(true);
      await axiosInstance.delete(`${API_PATHS.TASKS.DELETE_TASK}/${taskId}`);
      navigate("/admin/tasks", { replace: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      setFeedback({
        type: "error",
        message: error?.response?.data?.message || "Failed to delete task. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Attachment handling functions
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFeedback({
          type: "error",
          message: `File "${file.name}" is too large. Maximum size is 10MB.`
        });
        return false;
      }
      return true;
    });

    const newAttachments = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(att => att.id !== id);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FiImage className="w-4 h-4" />;
    return <FiFile className="w-4 h-4" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="card">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h2>
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Task'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Configure the task details, assign an owner and set checkpoints.
          </p>

          {feedback.message && (
            <div
              className={`mb-4 rounded-md px-4 py-2 text-sm ${
                feedback.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formValues.title}
                  onChange={updateFormValue}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Launch marketing campaign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formValues.dueDate}
                  onChange={updateFormValue}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                name="description"
                value={formValues.description}
                onChange={updateFormValue}
                rows={4}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Describe the task, goals and requirements."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority *</label>
                <select
                  name="priority"
                  value={formValues.priority}
                  onChange={updateFormValue}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {PRIORITY_DATA.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  name="status"
                  value={formValues.status}
                  onChange={updateFormValue}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {STATUS_DATA.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <SelectUsers
                  name="assignedTo"
                  value={formValues.assignedTo}
                  onChange={updateFormValue}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  disabled={loadingUsers}
                  users={users}
                >
                  <option value="">Unassigned</option>
                  {loadingUsers ? (
                    <option disabled>Loading users...</option>
                  ) : Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))
                  ) : (
                    <option disabled>No users available</option>
                  )}
                </SelectUsers>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Checklist</label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={addChecklistItem}
                >
                  + Add item
                </button>
              </div>

              <div className="space-y-3">
                {formValues.checklist.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistCompleted(index)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleChecklistChange(index, e.target.value)}
                      className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Checklist item"
                    />
                    {formValues.checklist.length > 1 && (
                      <button
                        type="button"
                        className="text-sm text-red-500 hover:underline"
                        onClick={() => removeChecklistItem(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Attachments</label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiPaperclip className="w-4 h-4" />
                  Add Files
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-gray-500">
                          {getFileIcon(attachment.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                        {attachment.preview && (
                          <div className="w-10 h-10 rounded overflow-hidden border border-gray-200">
                            <img
                              src={attachment.preview}
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {attachments.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FiPaperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    No files attached yet
                  </p>
                  <p className="text-xs text-gray-500">
                    Click "Add Files" to attach documents, images, or other files
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Maximum file size: 10MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
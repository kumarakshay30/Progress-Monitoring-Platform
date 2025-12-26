# 📊 Progress Monitoring Platform

A comprehensive task and progress tracking system designed to help teams and individuals manage their work efficiently. Built with modern web technologies, this platform offers real-time task management, progress tracking, and team collaboration features.

![Project Preview](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## ✨ Features

- **User Authentication & Authorization**
  - Secure login/signup with JWT
  - Role-based access control (Admin, Manager, User)
  - Password reset functionality

- **Task Management**
  - Create, assign, and track tasks
  - Set priorities and due dates
  - Task categorization and filtering
  - Progress tracking with visual indicators

- **Team Collaboration**
  - Assign tasks to team members
  - Real-time updates and notifications
  - Comment and update task status

- **Dashboard & Reporting**
  - Visual progress tracking
  - Task completion statistics
  - Performance metrics

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: React Icons (Feather Icons)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **API Documentation**: Swagger/OpenAPI

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/progress-monitoring-platform.git
   cd progress-monitoring-platform
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend/Progress-Monitoring-Platform
   npm install
   cp .env.example .env
   # Edit .env with your API endpoint
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📚 API Documentation

API documentation is available at `/api-docs` when the backend server is running. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ by Akshay Kumar | [![GitHub](https://img.shields.io/github/followers/kumarakshay30?style=social)](https://github.com/kumarakshay30)
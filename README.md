# Task Manager 🗂️

A full-stack real-time task management application built with React, Node.js, MongoDB, and Socket.io.

🌐 **Live Demo**: [https://task-manager-6-do87.onrender.com](https://task-manager-6-do87.onrender.com)

---

## Features

- ✅ User authentication (Register / Login)
- ✅ Create, update, and delete tasks
- ✅ Real-time updates with Socket.io
- ✅ Secure JWT-based sessions
- ✅ RESTful API backend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.io |
| Auth | JWT, bcryptjs |
| Deployment | Render |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [Git](https://git-scm.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)

---

## Installation

### 1. Clone the repository


git clone https://github.com/ved-1234/Task_Manager.git
cd Task_Manager/my-react-app



### 2. Set up the Backend


cd Backend
npm install


Create a `.env` file inside the `Backend` folder:

env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173


> **How to get MONGO_URI:**
> 1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
> 2. Create a free cluster
> 3. Click **Connect** → **Connect your application**
> 4. Copy the connection string and replace `<password>` with your DB password

Start the backend server:

npm start
# or for development with auto-reload:
npm run dev


Backend runs on: `http://localhost:5000`



### 3. Set up the Frontend

Open a new terminal:


cd my-react-app   # (from repo root: cd Task_Manager/my-react-app)
npm install


Create a `.env` file inside `my-react-app`:

env
VITE_API_URL=http://localhost:5000


Start the frontend:


npm run dev


Frontend runs on: `http://localhost:5173`

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Click **Register** to create a new account
3. Log in with your credentials
4. Start creating and managing tasks!
5. Open the app in two browser tabs to see **real-time updates** in action

---

## Project Structure

```
Task_Manager/
└── my-react-app/
    ├── Backend/               # Node.js + Express API
    │   ├── controllers/       # Route logic
    │   ├── middleware/        # Auth middleware
    │   ├── models/            # Mongoose schemas
    │   ├── routes/            # API routes
    │   ├── utils/             # Helper functions
    │   ├── server.js          # Entry point
    │   └── package.json
    │
    ├── src/                   # React frontend
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── api.jsx            # API calls
    │   ├── App.jsx
    │   └── AuthContext.jsx
    │
    ├── dist/                  # Production build (auto-generated)
    └── package.json
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks for logged-in user |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

---

## Deployment

### Backend (Render Web Service)

| Setting | Value |
|---|---|
| Root Directory | `my-react-app/Backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

**Environment Variables to add in Render:**

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
FRONTEND_URL=https://your-frontend-url.onrender.com
```

---

### Frontend (Render Static Site)

| Setting | Value |
|---|---|
| Root Directory | `my-react-app` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

**Environment Variables to add in Render:**


VITE_API_URL=https://your-backend-url.onrender.com


---

## Environment Variables Reference

### Backend `.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWT tokens | `mysecretkey123` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

### Frontend `.env`

| Variable | Description | Example |
|---|---|---|
| VITE_API_URL | Backend API base URL | http://localhost:5000 |

---

## Contributing

1. Fork the repository
2. Create a new branch: git checkout -b feature/your-feature
3. Make your changes and commit: git commit -m "Add your feature"
4. Push to your branch: git push origin feature/your-feature
5. Open a Pull Request

---



---

## Author

**ved-1234** — [GitHub](https://github.com/ved-1234)

# ⚽ Soccer School Management System

A fullstack web application for a small soccer school.  
It manages players, teams, matches, and player statistics — helping scouts and coaches easily view player info and performance data.

Built with **React + Tailwind CSS** on the frontend and **Node.js + Express + MySQL** on the backend.  
Hosted on **Netlify (frontend)** and **Railway (backend)**.

---

## 🚀 Features

- View and manage player profiles (name, position, height, weight, strong foot, team)
- Display player statistics (matches, goals, assists, minutes, rating)
- Record match results with opponent and location info
- Simple API with CRUD routes for all entities
- Responsive and clean UI built with Tailwind CSS

---

## 🧱 Tech Stack

### Frontend
- **React** (Vite)
- **Tailwind CSS**
- **Axios** (for API calls)
- **Netlify** (hosting)

### Backend
- **Node.js** + **Express**
- **MySQL** (via Railway)
- **dotenv** for environment variables
- **CORS** + **body-parser**

---

## 📂 Project Structure

soccer-school/
│
├── backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── services/
│ │ ├── config/
│ │ └── server.ts
│ ├── schema.sql
│ ├── package.json
│ └── .env (ignored)
│
├── frontend/
│ ├── src/
│ ├── public/
│ ├── package.json
│ └── vite.config.js
│
├── README.md
└── package.json



---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/simopoza/soccer-school.git
cd soccer-school

2. Setup the Backend

cd backend
npm install


Create a .env file:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=soccer_school


Create the database using schema.sql:

mysql -u root -p soccer_school < schema.sql

Start the backend:

cd ../frontend
npm install
npm run dev

🗄️ Database Setup

The database schema used for local development is located in
backend/schema.sql
.
It defines tables for players, teams, matches, and stats.

⚠️ For security reasons, detailed schema diagrams and relationships are not included here.

🔒 API Documentation

The backend API documentation is kept private for security.
If you’re a collaborator or tester, please contact the author to request access.


🧑‍💻 Author

Mohammed Annahri
Fullstack Developer (React, Node.js, MySQL)


🏗️ License

This project is open-source under the MIT License.


---

This version:
- 🚫 **Doesn’t expose your endpoints**
- ✅ Still looks professional and clear
- 🔒 Encourages secure, private documentation (e.g., in Postman or Swagger)

---

Would you like me to show you how to **document your API privately** in Postman (and share only a secure link if needed)?  
It’s a great way to keep control over your endpoints while having nice docs.



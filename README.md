# ⚽ Soccer Academy Management & Player Showcase Platform

A comprehensive fullstack web application designed for soccer academies to manage their operations and showcase player talent. The platform enables coaches, scouts, and administrators to efficiently manage players, teams, matches, and statistics while providing detailed player performance analytics.

Built with modern technologies: **React + Chakra UI** on the frontend and **Node.js + Express + MySQL** on the backend, featuring robust authentication, role-based access control, and internationalization support.

---

## ✨ Features

### Core Functionality
- **User Management**: Multi-role authentication system (Admin, Agent, Player) with JWT-based secure sessions
- **Player Profiles**: Comprehensive player management with personal details, physical attributes, positions, and team assignments
- **Team Management**: Organize players into age-appropriate teams with complete team rosters
- **Match Recording**: Track match results including date, opponent, location, match type, and scores
- **Performance Statistics**: Detailed player statistics per match (goals, assists, minutes played, performance ratings)
- **Rate Limiting**: Built-in API rate limiting to prevent abuse
- **API Documentation**: Interactive Swagger/OpenAPI documentation for all endpoints

### Technical Features
- **Secure Authentication**: Password hashing with bcrypt, JWT tokens with httpOnly cookies
- **Input Validation**: Comprehensive request validation using express-validator
- **Internationalization**: Multi-language support (English, Arabic) using i18next
- **Responsive Design**: Mobile-first UI built with Chakra UI components
- **Testing Suite**: Complete test coverage with Jest and Supertest
- **RESTful API**: Clean, well-structured API following REST principles

---

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **Vite 7.2.4** - Lightning-fast build tool
- **Chakra UI 2.8.0** - Accessible component library
- **React Router DOM 7.10.1** - Client-side routing
- **Axios 1.13.2** - HTTP client
- **React Hook Form 7.68.0** - Form management
- **Yup 1.7.1** - Schema validation
- **i18next 25.7.1** - Internationalization
- **Framer Motion 7.10.3** - Animation library

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web framework
- **MySQL 2** - Relational database via mysql2 driver
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **bcryptjs 3.0.3** - Password hashing
- **Express Validator 7.3.1** - Request validation
- **Express Rate Limit 8.2.1** - Rate limiting
- **CORS 2.8.5** - Cross-origin resource sharing
- **Swagger (swagger-jsdoc 6.2.8 + swagger-ui-express 5.0.1)** - API documentation

### Development Tools
- **Jest 30.2.0** - Testing framework
- **Supertest 7.1.4** - API testing
- **Nodemon 3.1.10** - Development auto-reload
- **ESLint 9.39.1** - Code linting

---

## 📂 Project Structure

```
SAMPSP/
├── backend/
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── matchesController.js
│   │   ├── playersController.js
│   │   ├── statsController.js
│   │   ├── teamsController.js
│   │   └── userController.js
│   ├── routes/              # API route definitions
│   │   ├── apiRoutes.js
│   │   ├── auth.js
│   │   ├── matches.js
│   │   ├── players.js
│   │   ├── stats.js
│   │   ├── teams.js
│   │   └── user.js
│   ├── middlewares/         # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── validate.js
│   ├── validators/          # Request validation schemas
│   │   ├── authValidator.js
│   │   ├── matchesValidator.js
│   │   ├── playersValidator.js
│   │   ├── statsValidator.js
│   │   ├── teamsValidator.js
│   │   └── userValidator.js
│   ├── helpers/             # Utility functions
│   │   ├── calculateRating.js
│   │   ├── generateToken.js
│   │   ├── hashPassword.js
│   │   └── validateForeignKeys.js
│   ├── tests/               # Test suites
│   │   ├── auth.test.js
│   │   ├── matches.test.js
│   │   ├── players.test.js
│   │   ├── stats.test.js
│   │   ├── teams.test.js
│   │   └── users.test.js
│   ├── db.js                # Database connection
│   ├── indexes.js           # Database indexes
│   ├── index.js             # Server entry point
│   ├── schema.sql           # Database schema
│   ├── package.json
│   ├── jest.config.js
│   └── jest.setup.js
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── AuthCard.jsx
│   │   │   ├── InputField.jsx
│   │   │   └── SelectField.jsx
│   │   ├── pages/           # Page components
│   │   │   └── RegisterPage.jsx
│   │   ├── routes/          # Route configuration
│   │   │   └── AppRoutes.jsx
│   │   ├── services/        # API services
│   │   │   ├── authService.js
│   │   │   └── axiosInstance.js
│   │   ├── utils/           # Utility functions
│   │   │   └── validationSchemas.js
│   │   ├── locales/         # Translation files
│   │   │   ├── en/
│   │   │   │   └── registration-page-translation.json
│   │   │   └── ar/
│   │   │       └── registration-page-translation.json
│   │   ├── App.jsx          # Root component
│   │   ├── main.jsx         # Entry point
│   │   └── i18n.js          # i18n configuration
│   ├── public/              # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── package.json             # Root package file
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version **18.x or higher** (recommended: 18.17.0 or 20.x LTS)
  - Check version: `node --version`
  - Download from: https://nodejs.org/
- **npm**: Version **9.x or higher** (comes with Node.js)
  - Check version: `npm --version`
- **MySQL**: Version **8.0 or higher**
  - Check version: `mysql --version`
  - Download from: https://dev.mysql.com/downloads/mysql/
- **Git**: For cloning the repository
  - Check version: `git --version`

### Installation Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/simopoza/Soccer-Academy-Management-Player-Showcase-Platform.git
cd Soccer-Academy-Management-Player-Showcase-Platform
```

#### 2. Setup the Backend

```bash
cd backend
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add the following configuration (adjust values for your environment):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=soccer_school
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration (Frontend URL)
FRONTEND_URL=http://localhost:5173
```

**Important Security Notes:**
- Replace `your_mysql_password` with your actual MySQL password
- Generate a strong, random `JWT_SECRET` (use a password generator)
- Never commit the `.env` file to version control

#### 4. Setup the Database

Start your MySQL server, then create and populate the database:

```bash
# Login to MySQL
mysql -u root -p

# Create the database (or use the schema.sql file)
CREATE DATABASE soccer_school;
exit;

# Import the schema
mysql -u root -p soccer_school < schema.sql
```

Alternatively, you can run the schema manually:

```bash
mysql -u root -p < schema.sql
```

#### 5. Start the Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The backend server should now be running at `http://localhost:5000`

To verify the API is working, visit: `http://localhost:5000/api-docs` (Swagger documentation)

#### 6. Setup the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
```

#### 7. Configure Frontend Environment (Optional)

If your backend runs on a different port or domain, create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

#### 8. Start the Frontend Development Server

```bash
npm run dev
```

The frontend application should now be running at `http://localhost:5173`

#### 9. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

---

## 🧪 Running Tests

The backend includes a comprehensive test suite covering all API endpoints.

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## 📊 Database Schema

The application uses MySQL with the following main tables:

- **Users**: Authentication and user roles (admin, agent, player)
- **Players**: Player profiles with personal and physical attributes
- **Teams**: Team organization with age limits
- **Matches**: Match records with results and details
- **Stats**: Individual player statistics per match

### Key Relationships:
- Players belong to Users (1:1) and Teams (N:1)
- Matches belong to Teams (N:1)
- Stats link Players and Matches (N:M junction table)

For the complete schema, see `backend/schema.sql`

---

## 🔐 API Documentation

Interactive API documentation is available via Swagger UI when the backend is running:

**URL**: http://localhost:5000/api-docs

The API includes the following resource endpoints:
- `/api/auth` - Authentication (register, login, logout)
- `/api/users` - User management
- `/api/players` - Player operations
- `/api/teams` - Team management
- `/api/matches` - Match recording
- `/api/stats` - Performance statistics

All protected routes require JWT authentication via httpOnly cookies.

---

## 🛡 Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs before storage
- **JWT Authentication**: Secure token-based authentication with httpOnly cookies
- **Role-Based Access Control**: Different permissions for admin, agent, and player roles
- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS to allow only trusted origins
- **SQL Injection Prevention**: Prepared statements via mysql2

---

## 🌍 Internationalization

The application supports multiple languages:
- English (en)
- Arabic (ar)

Language files are located in `frontend/src/locales/`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open-source under the MIT License.

---

## 👨‍💻 Author

**Mohammed Annahri**  
Full-Stack Developer

GitHub: [@simopoza](https://github.com/simopoza)

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: `Cannot connect to MySQL database`
- **Solution**: Ensure MySQL is running and credentials in `.env` are correct
- Check if the database exists: `SHOW DATABASES;` in MySQL
- Verify MySQL is listening on port 3306: `netstat -an | grep 3306`

**Problem**: `Port 5000 already in use`
- **Solution**: Change the `PORT` in backend `.env` or kill the process using port 5000
- Find process: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)

**Problem**: `JWT token errors or authentication failures`
- **Solution**: Clear browser cookies and ensure `JWT_SECRET` is set in `.env`
- Check that cookies are enabled in your browser

**Problem**: `CORS errors when calling API`
- **Solution**: Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `backend/index.js`

**Problem**: `Module not found` errors
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure you're using Node.js 18.x or higher

**Problem**: Frontend not loading or showing blank page
- **Solution**: Check browser console for errors
- Ensure backend is running and accessible
- Clear browser cache and reload

---

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Chakra UI Components](https://chakra-ui.com/docs/components)
- [JWT Best Practices](https://jwt.io/introduction)

---

**Happy Coding! ⚽🚀**

# Physical Training App

## Overview
The Physical Training App is a full-stack application designed for a physical training exercise day at Kadena AB. Participants can run to different zones, scan objects or barcodes to earn points, and track their progress through a user-friendly interface. The application includes an admin page for managing locations and monitoring team performance.

## Project Structure
```
physical-training-app
├── backend
│   ├── app.js
│   ├── db.js
│   ├── Dockerfile
│   ├── index.js
│   ├── middleware.js
│   ├── package.json
│   ├── routes
│   │   ├── auth.route.js
│   │   ├── game.route.js
│   │   ├── locations.route.js
│   │   └── team.route.js
│   └── db
│       ├── Dockerfile
│       └── init
│           ├── init.sql
│           └── locations.json
├── frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── public
│   │   └── index.html
│   └── src
│       ├── App.js
│       ├── index.js
│       ├── assets
│       │   └── cyber-shisa.jpeg
│       ├── authentication
│       │   ├── Logout.js
│       │   ├── SignUp.js
│       │   └── TeamAuth.js
│       ├── components
│       │   ├── AdminPage.js
│       │   ├── Game.js
│       │   ├── LocationPage.js
│       │   ├── LocationPassword.js
│       │   ├── Map.js
│       │   ├── Modal.js
│       │   ├── MyTeamsPage.js
│       │   ├── NavBar.js
│       │   └── TeamsPage.js
│       └── styles
│           ├── App.css
│           ├── common.css
│           ├── Game.css
│           ├── LocationPage.css
│           ├── Map.css
│           ├── Modal.css
│           ├── NavBar.css
│           ├── SignUp.css
│           ├── TableStyles.css
│           └── Teams.css
├── docker-compose.txt
├── docker-compose.yaml
└── README.md
```

## Backend
The backend is built using Node.js and Express. It handles API requests, manages database interactions, and implements authentication.

### Setup Instructions
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the necessary environment variables (e.g., database connection strings, JWT secrets).
4. Start the server:
   ```
   npm start
   ```

### API Endpoints
- **GET /api/locations**: Retrieve all locations.
- **POST /api/scans**: Process a scan request (protected).
- **Team Routes**: Manage team-related operations.
- **Auth Routes**: Manage authentication-related operations.

## Frontend
The frontend is built using React. It provides a dynamic user interface for participants and administrators.

### Setup Instructions
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the application:
   ```
   npm start
   ```

## Usage
Participants can log in, view the map with key points, and track their points earned by scanning barcodes. Administrators can manage locations and monitor team performance through the admin page.

## License
This project is licensed under the MIT License.
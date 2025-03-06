# Physical Training App

## Overview
The Physical Training App is a full-stack application designed for a physical training exercise day at Kadena AB. Participants can run to different zones, scan objects or barcodes to earn points, and track their progress through a user-friendly interface. The application includes an admin page for managing locations and monitoring team performance.

## Project Structure
```
physical-training-app
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── db.js
│   │   ├── routes
│   │   │   ├── team.route.js
│   │   │   ├── location.route.js
│   │   │   └── scan.route.js
│   │   └── controllers
│   │       ├── team.controller.js
│   │       ├── location.controller.js
│   │       └── scan.controller.js
│   ├── package.json
│   ├── .env
│   └── README.md
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── components
│   │   │   ├── Map.js
│   │   │   ├── TeamDashboard.js
│   │   │   ├── AdminPage.js
│   │   │   └── Login.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles
│   │       └── App.css
│   ├── package.json
│   └── README.md
├── README.md
└── .gitignore
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

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
# Physical Training App

## Overview
The Physical Training App is a full-stack application designed for a physical training exercise day at Kadena AB. Participants can run to different zones, scan objects or barcodes to earn points, and track their progress through a user-friendly interface. The application includes an admin page for managing locations and monitoring team performance.

## Features
- Interactive map with key points on Kadena AB.
- Barcode scanning functionality to earn points.
- Team management with names and member details.
- Admin interface to track locations and total points for teams.
- User authentication for secure access.

## Technologies Used
- **Frontend**: React, JavaScript, CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)

## Setup Instructions

### Backend
1. Navigate to the `backend` directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your environment variables:
   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the backend server:
   ```
   npm start
   ```

### Frontend
1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend application:
   ```
   npm start
   ```

## Usage
- Access the application in your web browser at `http://localhost:3001`.
- Participants can log in, view the map, and start scanning barcodes to earn points.
- Admins can log in to manage locations and view team performance.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.
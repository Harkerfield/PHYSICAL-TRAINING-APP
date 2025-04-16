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
│   ├── db
│   │   ├── Dockerfile
│   │   └── init
│   │       ├── init.sql
│   │       └── locations.json
│   └── routes
│       ├── auth.route.js
│       ├── game.route.js
│       ├── locations.route.js
│       └── team.route.js
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
│       │   ├── TeamAuth.js
│       │   └── PrivacyNotification
│       │       ├── PrivacyNotification.css
│       │       └── PrivacyNotification.js
│       │       └── SignUp
│       │           ├── SignUp.css
│       │           └── SignUp.js
│       ├── components
│       │   ├── AdminPage.js
│       │   ├── LocationPassword.js
│       │   ├── Game
│       │   │   ├── Game.css
│       │   │   └── Game.js
│       │   ├── LocationsPage
│       │   │   ├── LocationsPage.css
│       │   │   └── LocationsPage.js
│       │   ├── Map
│       │   │   ├── Map.css
│       │   │   └── Map.js
│       │   ├── Media
│       │   │   ├── Media.css
│       │   │   └── Media.js
│       │   ├── Modal
│       │   │   ├── Modal.css
│       │   │   └── Modal.js
│       │   ├── MyTeamsPage
│       │   │   ├── MyTeamsPage.css
│       │   │   └── MyTeamsPage.js
│       │   ├── NavBar
│       │   │   ├── NavBar.css
│       │   │   └── NavBar.js
│       │   ├── PopOver
│       │   │   ├── PopOver.css
│       │   │   └── PopOver.js
│       │   ├── TeamScores
│       │   │   ├── TeamScores.css
│       │   │   └── TeamsScores.js
│       └── styles
│           ├── App.css
│           ├── Button.css
│           ├── common.css
│           ├── TableStyles.css
├── docker-compose.txt
├── docker-compose.yaml
└── README.md
```

## Backend
The backend is built using Node.js and Express. It handles API requests, manages database interactions, and implements authentication.

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
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   SESSION_SECRET=your_secret_key
   DATABASE_URL=your_database_connection_string
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

### Docker Setup (Optional)
1. Ensure Docker is installed and running on your system.
2. Navigate to the root directory of the project.
3. Use the following command to start the application using Docker Compose:
   ```
   docker-compose up --build
   ```

### Proxmox Setup for Docker

Proxmox is a powerful open-source virtualization platform that can be used to run Docker containers. Below are the steps to set up Proxmox and configure it for Docker:

#### Step 1: Install Proxmox
1. Download the Proxmox ISO from the [official website](https://www.proxmox.com/en/downloads).
2. Create a bootable USB drive using tools like Rufus or Etcher.
3. Boot your server from the USB drive and follow the installation instructions.
4. After installation, access the Proxmox web interface using the IP address of your server.

#### Step 2: Create a Virtual Machine for Docker
1. Log in to the Proxmox web interface.
2. Click on **Create VM** and follow the wizard to create a new virtual machine.
3. Allocate sufficient resources (CPU, RAM, and storage) for the VM.
4. Attach an ISO image of your preferred Linux distribution (e.g., Ubuntu Server).
5. Start the VM and install the Linux operating system.

#### Step 3: Install Docker on the Virtual Machine
1. SSH into the virtual machine or use the Proxmox console.
2. Update the package manager:
   ```
   sudo apt update && sudo apt upgrade -y
   ```
3. Install Docker:
   ```
   sudo apt install docker.io -y
   ```
4. Enable and start the Docker service:
   ```
   sudo systemctl enable docker
   sudo systemctl start docker
   ```
5. Verify the Docker installation:
   ```
   docker --version
   ```

#### Step 4: Run Docker Containers
1. Use the `docker run` command to start containers. For example:
   ```
   docker run -d -p 80:80 nginx
   ```
2. Use `docker-compose` for multi-container setups. Install it with:
   ```
   sudo apt install docker-compose -y
   ```
3. Navigate to your project directory and run:
   ```
   docker-compose up --build
   ```

#### Step 5: Manage Docker on Proxmox
- Use the Proxmox web interface to monitor the VM's resource usage.
- Use Docker commands within the VM to manage containers.

By following these steps, you can effectively set up Proxmox to run Docker containers for your projects.

### API Endpoints

#### Authentication
- **POST /auth/register-team**: Register a new team.
- **POST /auth/login-team**: Log in a team and return a JWT token.
- **POST /auth/logout**: Log out a team.

#### Locations
- **POST /locations**: Create a new location (admin only).
- **GET /locations**: Retrieve all locations.
- **GET /locations/:id**: Retrieve a specific location by ID.
- **PUT /locations/:id**: Update a location by ID (admin only).
- **DELETE /locations/:id**: Delete a location by ID (admin only).

#### Teams
- **GET /teams**: Retrieve all teams with their current points.
- **GET /teams/:id**: Retrieve a specific team by ID.
- **GET /teams/total-points**: Retrieve total points for each team.
- **POST /teams/add-team-member**: Add a team member (authenticated).
- **PUT /teams/team-members/:id**: Update a team member (authenticated).
- **DELETE /teams/team-members/:id**: Delete a team member (authenticated).

#### Game
- **PUT /gameTransactions/update-points**: Update team points (authenticated).
- **POST /gameTransactions/submit-location**: Submit a location password (authenticated).
- **POST /gameTransactions/add-points**: Add custom points (admin only).
- **PUT /gameTransactions/update-location**: Update team location (authenticated).
- **POST /gameTransactions/upload**: Upload a file and update team points (authenticated).
- **GET /gameTransactions/points-transactions**: Retrieve all point transactions (authenticated).
- **POST /gameTransactions/set-countdown**: Set a countdown timer (admin only).
- **GET /gameTransactions/countdown**: Retrieve the countdown timer.
- **GET /gameTransactions/random-events**: Retrieve random events (authenticated).
- **GET /gameTransactions/random-event-frequency**: Retrieve the random event frequency (authenticated).
- **PUT /gameTransactions/random-event-frequency**: Update the random event frequency (admin only).
- **POST /gameTransactions/update-location**: Update team location (authenticated).
- **POST /gameTransactions/upload-media**: Upload media (authenticated).
- **GET /gameTransactions/all-media**: Retrieve all uploaded media (admin only).

## Frontend
The frontend is built using React. It provides a dynamic user interface for participants and administrators.

## Usage

### Participants
1. **Log In**: Teams can log in using their team name and PIN code.
2. **View Map**: Access the map to see key locations and their point values.
3. **Submit Location Passwords**: Enter passwords at specific locations to earn points.
4. **Track Progress**: View the team's total points and progress in real-time.

### Administrators
1. **Manage Locations**: Add, update, or delete locations with point values and coordinates.
2. **Monitor Teams**: View all teams, their members, and total points.
3. **Set Countdown Timer**: Configure a countdown timer for the event.
4. **Review Media**: Access and review all uploaded media from teams.
5. **Adjust Points**: Add or deduct points for teams as needed.

## Nginx
The Nginx server is used as a reverse proxy to route requests to the appropriate services (frontend or backend) and to serve the frontend application as a single-page application (SPA).

### Configuration
The Nginx configuration is defined in the `nginx/default.conf` file. Key features include:

- **Frontend Routing**: Requests to `/` are proxied to the frontend service.
- **Backend API Routing**: Requests to `/api` and other backend routes are proxied to the backend service.
- **SPA Support**: Unmatched routes are served with the `index.html` file to enable frontend routing.

### Docker Integration
The Nginx server is containerized using the `nginx/Dockerfile`. It copies the `default.conf` file into the container for configuration.

### Usage
1. Ensure the `nginx/default.conf` file is correctly configured for your environment.
2. Build and run the Nginx container using Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Access the application via the Nginx server on port 80.

## License
This project is licensed under the MIT License.



https://github.com/AntonioMaccarini/dockerize-react-node-postgres-nginx-application/tree/master


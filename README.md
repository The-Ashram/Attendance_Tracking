# Attendance_Tracking System

This is a backend project for an **Attendance Tracking System** built with **Node.js**, **TypeScript**, and **Drizzle ORM**. The system tracks user attendance data and manages authentication using **JWT**. The project follows **Clean Architecture** principles for scalability and maintainability.

## Table of Contents
- [Attendance\_Tracking System](#attendance_tracking-system)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Project Structure](#project-structure)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Usage](#usage)
    - [Available Scripts](#available-scripts)
  - [API Documentation](#api-documentation)
    - [Endpoints](#endpoints)
  - [Contribution Guidelines](#contribution-guidelines)
  - [Contributors](#contributors)

## Features
- User authentication with **JWT**.
- Attendance tracking for users.
- RESTful API for managing attendance records.
- Data validation using **Zod**.
- Database management using **Drizzle ORM** with PostgreSQL.
- Environment variable management with **dotenv**.

## Technologies Used
- **Node.js**: Server-side JavaScript runtime.
- **TypeScript**: Type-safe JavaScript for improved code reliability.
- **Express**: Fast, unopinionated, minimalist web framework for Node.js.
- **Drizzle ORM**: SQL-based ORM for database interaction.
- **Zod**: TypeScript-first schema declaration and validation library.
- **PostgreSQL**: Relational database system.
- **AWS SDK**: For interacting with AWS services (like S3).
- **bcrypt**: For hashing passwords.
- **JWT (jsonwebtoken)**: For handling authentication tokens.
- **CSV Writer**: For exporting attendance data to CSV format.
- **Nodemon**: For development, auto-restart on file changes.
- **Drizzle-Kit**: For database migrations and schema generation.

## Project Structure
```bash
├── src/
│   ├── config/                     # Configuration files (database, environment)
│   ├── db/
│   │   ├── migrations/             # Database migrations
│   │   ├── queries/                # Database queries
│   │   └── schema/                 # Database schema definitions
|   ├── modules/                    # Modules containing business logic
|   |   ├── handlers/               # Handlers for API endpoints
|   |   ├── interfaces/             # Interfaces for API endpoints
│   |   └── routes/                 # Routes for API endpoints
│   └── utils/                      # Utility functions (error handling, logging, router wrappers)
├── index.ts                        # Entry point for the application
├── package.json                    # Project dependencies and scripts
└── README.md                       # Project documentation
```

## Installation 
### Prerequisites 
* **Node.js** (version 16 or higher) 
* **PostgreSQL** installed and running 
### Steps 
1. **Clone the repository**:
```bash
git clone https://github.com/ashramtracking/ashram_tracking_system.git
cd ashram_tracking_system
```
2. **Install dependencies**:
```bash
npm install
```
3. **Create a .env file** in the project root and add your environment variables (e.g., database URL, JWT secret):
```bash
POSTGRES_HOST=your_database_host
POSTGRES_DB=your_database_name

POSTGRES_USER=your_database_user
POSTGRES_PASS=your_database_password

SERVER_HOSTNAME=your_server_hostname
SERVER_PORT=your_server_port

PORT=your_backend_port
```
4. **Start the server**:
```bash
npm run dev
```
5. **Start querying the database** with api calls using Postman or another API client. Follow the api documentation for more information.

## Usage
### Available Scripts
* `npm run dev`: Starts the server in development mode
* `npm run start`: Starts the server in production mode
* `npm run db:generate`: Generates the database schema
* `npm run db:delete`: Drops the database schema
* `npm run db:push`: Pushes the database schema
* `npm run db:deploy`: Deploys the database schema

## API Documentation
### Endpoints
Base URL: `http://localhost:<PORT>/api/`
* **GET** `users/`: Retrieves all users
* **GET** `users/:id`: Retrieves a specific user
* **GET** `attendance/`: Retrieves all attendances
* **GET** `attendance/:id`: Retrieves a specific attendance for a user where id is user_id
* **GET** `attendance/?date=YYYY-MM-DD`: Retrieves all attendances for a specific date
* **GET** `attendance/?from=YYYY-MM-DD&to=YYYY-MM-DD`: Retrieves all attendances between two dates
* **GET** `attendance/export?from=YYYY-MM-DD&to=YYYY-MM-DD`: Exports all attendances between two dates
* **PUT** `users/:id`: Updates a specific user
* **PUT** `attendance/:id`: Updates a specific attendance where id is attendance_id
* **POST** `auth/login`: Logs in a user and returns jwt tokens 
* **POST** `auth/refresh`: Refreshes jwt access token using refresh token
* **POST** `auth/validate`: Validates jwt both access and refresh tokens
* **POST** `auth/register`: Registers a new user and returns jwt tokens 
* **POST** `attendance/`: Creates a new attendance
* **DELETE** `users/`: Deletes all users
* **DELETE** `users/:id`: Deletes a specific user
* **DELETE** `attendance/`: Deletes all attendances
* **DELETE** `attendance/:id`: Deletes a specific attendance where id is attendance_id

## Contribution Guidelines
1. Fork the repository and create a new branch for your contribution.
```bash
git checkout -b feature/<YourFeatureName>
```
2. Commit your changes to the new branch.
```bash
git commit -m "<YourCommitMessage>"
```
3. Push your changes to the remote repository.
```bash
git push origin feature/<YourFeatureName>
```
4. Open a pull request for your feature.
```bash
gh pr create --title "<YourPullRequestTitle>" --body "<YourPullRequestBody>"
```

## Contributors
- [Aung Phone Naing](https://github.com/Aung-Phone-Naing)
- [Wai Chong](https://github.com/Whysochong)


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
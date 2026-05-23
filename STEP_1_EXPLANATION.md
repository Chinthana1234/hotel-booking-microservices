# Step 1: API Gateway and User Service Setup

In this step, we have initialized the fundamental blocks of our Microservices Architecture for the Hotel Booking System.

## Architecture

1.  **API Gateway (Port 5000)**:
    *   This is the single entry point for all frontend/client requests. The frontend does not talk to individual services directly.
    *   It uses Express and Axios to intercept and route requests starting with `/api/users/*` over to the User Service.
2.  **User Service (Port 5001)**:
    *   An independent microservice responsible for handling user registration, authentication (login), and fetching user profiles securely.
    *   It connects to its own isolated MongoDB database (`hotel_user_service`).

## API Endpoints

Through the API Gateway (`http://localhost:5000`), the following endpoints are now available. These pass straight through to the User Service.

### 1. Register User (`POST /api/users/register`)
*   **Purpose**: Creates a new user in the database.
*   **Request Body (JSON)**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123"
    }
    ```
*   **Response (JSON)**: Returns user ID, name, email, and a generated JWT Token.

### 2. Login User (`POST /api/users/login`)
*   **Purpose**: Authenticates an existing user and returns a token.
*   **Request Body (JSON)**:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
*   **Response (JSON)**: Returns user info and JWT Token.

### 3. Get User Profile (`GET /api/users/profile`)
*   **Purpose**: Fetches the currently logged-in user's profile.
*   **Headers Required**:
    ```
    Authorization: Bearer <your_jwt_token_here>
    ```
*   **Response (JSON)**: Returns basic user profile info.

## Code Quality & Best Practices
*   **Separation of Concerns**: User service uses the standard MVC pattern (Models, Routes, Controllers) and Middleware for structured code.
*   **Security**: User passwords are encrypted using `bcryptjs` before hitting the database. We use JSON Web Tokens (JWT) for authentication via an `authMiddleware`.
*   **Independent Configuration**: Each service has its own `package.json` and `.env` ensuring they are loosely coupled and independently scalable.

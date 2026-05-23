# Step 2: Room Service Setup

In this step, we built the **Room Service** to manage all operations regarding hotel rooms (listing, adding, and updating availability).

## Architecture
1. **Room Service (Port 5002)**:
   * A completely standalone microservice dedicated only to room data.
   * Connects to its own separate MongoDB database (`hotel_room_service`).
   * Operates completely independently of the User Service and API Gateway. (We will connect it to the Gateway in Step 5).

## API Endpoints (`http://localhost:5002`)

### 1. Get All Rooms (`GET /api/rooms`)
*   **Purpose**: Retrieves a list of all hotel rooms.
*   **Response (JSON)**: Array of room objects.

### 2. Get Single Room (`GET /api/rooms/:id`)
*   **Purpose**: Retrieves details for a specific room by its MongoDB `_id`.

### 3. Create a Room (`POST /api/rooms`)
*   **Purpose**: Adds a new room to the database.
*   **Request Body (JSON)**:
    ```json
    {
      "roomNumber": "101",
      "type": "Suite",
      "pricePerNight": 150.00,
      "description": "A nice room with a city view"
    }
    ```

### 4. Update Availability (`PUT /api/rooms/:id/availability`)
*   **Purpose**: Marks a room as available or unavailable. The Booking Service (Step 3) will call this endpoint when a user books a room.
*   **Request Body (JSON)**:
    ```json
    {
      "isAvailable": false
    }
    ```

## Microservices Rule Addressed
By giving the Room Service its own database and port, we adhere strictly to the rule: "Each service has an independent MongoDB database. No shared database between services."

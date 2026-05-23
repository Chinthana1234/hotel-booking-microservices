# Step 3: Booking Service Setup

In this step, we built the **Booking Service** to manage room reservations. This step demonstrates the critical concept of **Inter-Service Communication** in a microservices architecture.

## Architecture
1. **Booking Service (Port 5003)**:
   * A standalone microservice dedicated only to reservation data.
   * Connects to its own separate MongoDB database (`hotel_booking_service`).
   * **Crucial Rule:** It communicates directly with the **Room Service** via HTTP REST (using Axios) to check if a room is available and to update the availability once booked.

## API Endpoints (`http://localhost:5003`)

### 1. Create a Booking (`POST /api/bookings`)
*   **Purpose**: Creates a new booking if the room is available.
*   **Internal Flow**:
    1. Uses Axios to `GET` the room from Room Service.
    2. If `room.isAvailable` is false, it rejects the booking.
    3. If available, saves the booking to its own database.
    4. Uses Axios to send a `PUT` request to Room Service, changing `isAvailable` to `false`.
*   **Request Body (JSON)**:
    ```json
    {
      "userId": "64abcdef123...",
      "roomId": "64xyz987...",
      "checkInDate": "2026-06-01",
      "checkOutDate": "2026-06-05",
      "totalPrice": 600.00
    }
    ```

### 2. Get User Bookings (`GET /api/bookings/user/:userId`)
*   **Purpose**: Retrieves all bookings for a specific user ID.

### 3. Cancel a Booking (`DELETE /api/bookings/:id`)
*   **Purpose**: Cancels a booking.
*   **Internal Flow**:
    1. Finds the booking in its database.
    2. Sends a `PUT` request to Room Service to change `isAvailable` back to `true`.
    3. Marks the booking `status` as "Cancelled".

## Microservices Rule Addressed
By keeping databases separate but allowing the services to communicate over HTTP using Axios, we adhere to the rule: "Services communicate via HTTP REST."

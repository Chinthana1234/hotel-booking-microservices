# Step 9: Reviews & Ratings Microservice

In this step, we demonstrated the immense flexibility of a microservices architecture by building and integrating a completely new **6th microservice**—the Review Service—without disrupting any of our existing backend code.

## Architecture & Flow

### 1. The Independent Review Service
We created a new standalone Node.js server inside the `review-service` folder.
* **Separation of Concerns**: This service has its own dedicated MongoDB collection (`hotel_review_service`) and runs independently on Port `5005`. It only cares about saving and retrieving reviews.
* **Security**: We reused our standard JWT authentication pattern. When a user submits a review, the Review Service independently verifies their token to ensure they are logged in.

### 2. Zero-Downtime Gateway Integration
To integrate this new service, we didn't have to touch the User, Room, Booking, or Payment services. 
* We simply added one new proxy rule to the **API Gateway**: `app.use('/api/reviews', createProxy(..., '/api/reviews'))`. 
* The API Gateway now seamlessly routes any review-related traffic to Port 5005.

### 3. Frontend UI Composition
The React frontend acts as a "composition layer," merging data from multiple independent microservices to create a cohesive user interface:
* **Rooms Page**: When the user loads the Rooms page, the frontend fetches the list of rooms from the **Room Service**. Then, in parallel, it queries the **Review Service** to fetch the average rating for *each* room. It mathematically calculates the star rating (★) and displays it on the room cards dynamically.
* **My Bookings Page**: We added an inline form to past bookings. When a user submits a review, the frontend sends a `POST` request to `/api/reviews` (routed via the Gateway), instantly recording the rating.

## Microservices Best Practices Addressed
* **Extensibility**: We proved that adding new business capabilities (like a rating system) can be done by spinning up new services, rather than bloating existing monoliths.
* **Data Independence**: The reviews are stored in their own database, completely separate from the room data or user data. This prevents the Room Service database from becoming overloaded with heavy review text queries.

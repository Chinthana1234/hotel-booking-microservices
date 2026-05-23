# Complete Setup Guide: Hotel Booking Microservices

This guide explains how to set up and run this project from absolute scratch, starting right after you `git clone` the repository. It also explains how the code works under the hood.

---

## 🛠️ Step 1: Clone the Repository

First, clone the repository to your local machine and open the folder:

```bash
git clone https://github.com/Chinthana1234/hotel-booking-microservices.git
cd hotel-booking-microservices
```

---

## 🛠️ Step 2: Set up Environment Variables (.env)

Because `.env` files contain sensitive information (like database passwords and secret keys), they are **not** uploaded to GitHub. You must create them manually on your computer for each service.

**1. API Gateway `.env`:**
Create a file named `.env` inside the `api-gateway` folder and paste this:
```env
PORT=5000
USER_SERVICE_URL=http://localhost:5001
```

**2. User Service `.env`:**
Create a file named `.env` inside the `user-service` folder and paste this:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/hotel_user_service
JWT_SECRET=supersecretkey123
```

**3. Room Service `.env`:**
Create a file named `.env` inside the `room-service` folder and paste this:
```env
PORT=5002
MONGO_URI=mongodb://localhost:27017/hotel_room_service
```

**4. Booking Service `.env`:**
Create a file named `.env` inside the `booking-service` folder and paste this:
```env
PORT=5003
MONGO_URI=mongodb://localhost:27017/hotel_booking_service
ROOM_SERVICE_URL=http://localhost:5002
```

---

## 🛠️ Step 3: Install Dependencies

You need to install the Node.js packages (`node_modules`) for every single service because they are independent. Open your terminal and run these commands:

```bash
# 1. Install API Gateway dependencies
cd api-gateway
npm install
cd ..

# 2. Install User Service dependencies
cd user-service
npm install
cd ..

# 3. Install Room Service dependencies
cd room-service
npm install
cd ..

# 4. Install Booking Service dependencies
cd booking-service
npm install
cd ..
```

---

## 🚀 Step 4: How to Run the Application

You must open **FOUR separate terminal windows** and run the following commands in each to start the whole system:

### Terminal 1 (Start User Service)
```bash
cd user-service
node server.js
```

### Terminal 2 (Start Room Service)
```bash
cd room-service
node server.js
```

### Terminal 3 (Start Booking Service)
```bash
cd booking-service
node server.js
```

### Terminal 4 (Start API Gateway)
```bash
cd api-gateway
node server.js
```

---

## 🧠 Step-by-Step Code Explanation

This section explains how the code we have written so far actually works.

### 1. The API Gateway (`api-gateway/server.js`)
In a microservices architecture, the frontend (React app) shouldn't memorize the ports of 5 different backend services. Instead, the frontend only talks to the **API Gateway** on Port 5000.
* When a user wants to register, the frontend sends a request to `http://localhost:5000/api/users/register`.
* The API Gateway receives this, realizes it starts with `/api/users`, and uses **Axios** to quietly forward the request to the User Service on Port 5001.

### 2. The User Service (`user-service/`)
This is an independent application that uses the **MVC (Model-View-Controller)** pattern.
* **Database (`config/db.js`)**: Connects to an entirely isolated MongoDB database called `hotel_user_service`.
* **Model (`models/User.js`)**: Defines what a User looks like in the database. `bcryptjs` encrypts passwords.
* **Controller (`controllers/userController.js`)**: Holds business logic. Generates a **JSON Web Token (JWT)** on login.
* **Middleware (`middleware/authMiddleware.js`)**: Protects private routes by checking for valid JWTs.

### 3. The Room Service (`room-service/`)
* **Database**: Connects to its own `hotel_room_service`.
* **Model (`models/Room.js`)**: Defines a hotel room, including `roomNumber`, `pricePerNight`, and `isAvailable`.
* **Controller**: Exposes endpoints to get rooms and update `isAvailable`.

### 4. The Booking Service (`booking-service/`)
This service demonstrates **Inter-Service Communication**.
* When a user creates a booking, the Booking Service does NOT talk to the Room Service database directly (that breaks microservices rules). 
* Instead, it uses **Axios** to send an HTTP GET request to the Room Service to ask, "Is room X available?".
* If yes, it saves the booking in `hotel_booking_service` DB.
* Then it sends an HTTP PUT request to Room Service to update `isAvailable` to `false`.

---

## 📂 Current Folder Structure

```text
hotel-booking-microservices/
├── api-gateway/            # Routes all incoming frontend requests (Port: 5000)
├── booking-service/        # Manages reservations & logic (Port: 5003)
├── room-service/           # Manages hotel rooms & availability (Port: 5002)
├── user-service/           # Manages user accounts & authentication (Port: 5001)
├── HOW_TO_RUN.md           # Setup guide
├── STEP_1_EXPLANATION.md   # Explanation for User Service
├── STEP_2_EXPLANATION.md   # Explanation for Room Service
└── STEP_3_EXPLANATION.md   # Explanation for Booking Service
```

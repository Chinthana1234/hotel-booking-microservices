# 🏨 Luxury Hotel Booking Microservices

A modern, production-grade microservices architecture for a luxury hotel reservation and booking platform. Built with Node.js/Express, ASP.NET Core, React (Vite), MongoDB, and Docker.

---

## 🏛️ System Architecture

```text
                               ┌───────────────────────────┐
                               │  Frontend (React + Vite)  │
                               │        Port: 5173         │
                               └─────────────┬─────────────┘
                                             │ HTTP / REST
                                             ▼
                               ┌───────────────────────────┐
                               │        API Gateway        │
                               │        Port: 5000         │
                               └─────────────┬─────────────┘
                                             │
      ┌──────────────┬──────────────┬────────┴──────┬──────────────┬──────────────┬──────────────┐
      │              │              │               │              │              │              │
      ▼              ▼              ▼               ▼              ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│   User    │  │   Room    │  │  Booking  │   │  Payment  │  │  Payment  │  │  Review   │  │   Admin   │
│  Service  │  │  Service  │  │  Service  │   │  (Node)   │  │ (.NET C#) │  │  Service  │  │  Service  │
│ Port:5001 │  │ Port:5002 │  │ Port:5003 │   │ Port:5004 │  │ Port:5007 │  │ Port:5005 │  │ Port:5006 │
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │              │              │               │              │              │              │
      ▼              ▼              ▼               ▼              ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│ MongoDB:  │  │ MongoDB:  │  │ MongoDB:  │   │ MongoDB:  │  │ MongoDB:  │  │ MongoDB:  │  │ MongoDB:  │
│hotel_users│  │hotel_rooms│  │  hotel_   │   │  hotel_   │  │  hotel_   │  │  hotel_   │  │  hotel_   │
│           │  │           │  │ bookings  │   │ payments  │  │ payments  │  │ reviews   │  │   admin   │
└───────────┘  └───────────┘  └───────────┘   └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

---

## 📦 Microservices Breakdown

| Service | Technology | Port | Description |
|---|---|---|---|
| **API Gateway** | Express / Node.js | `5000` | Single entry point; proxies requests to downstream microservices |
| **User Service** | Express / MongoDB / JWT | `5001` | User registration, authentication, profile management, and JWT issuance |
| **Room Service** | Express / MongoDB | `5002` | Hotel room catalog, room types, pricing, and availability states |
| **Booking Service** | Express / MongoDB | `5003` | Reservation lifecycle management and inter-service availability checks |
| **Payment Service (Node)** | Express / PayPal SDK | `5004` | Payment processing, transaction history, and PayPal checkout integration |
| **Payment Service (.NET)** | ASP.NET Core 8 / C# | `5007` | Enterprise-grade alternative payment microservice with Swagger documentation |
| **Review Service** | Express / MongoDB | `5005` | Guest ratings, customer reviews, and feedback management |
| **Admin Service** | Express / MongoDB | `5006` | Administrative metrics, booking overviews, and management APIs |
| **Frontend** | React / Vite / CSS | `5173` | Responsive luxury hotel guest experience with interactive booking flow |

---

## 🚀 Quick Start with Docker Compose

Ensure [Docker](https://www.docker.com/) and Docker Compose are installed and running.

```bash
# Clone the repository
git clone https://github.com/Chinthana1234/hotel-booking-microservices.git
cd hotel-booking-microservices

# Build and start all services
docker-compose up --build
```

Access the frontend application at: **`http://localhost:5173`**  
Access the API Gateway at: **`http://localhost:5000`**

---

## 🛠️ Local Development Setup

To run services locally without Docker, ensure MongoDB is running on `localhost:27017`.

### 1. Install Dependencies
```bash
# Backend services
cd api-gateway && npm install && cd ..
cd user-service && npm install && cd ..
cd room-service && npm install && cd ..
cd booking-service && npm install && cd ..
cd payment-service && npm install && cd ..
cd review-service && npm install && cd ..
cd admin-service && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Configure Environment Files (`.env`)
Create `.env` in each service directory (e.g., specifying `PORT`, `MONGO_URI`, and `JWT_SECRET`).

### 3. Run Services
In separate terminal tabs:
```bash
# API Gateway
cd api-gateway && npm run dev

# Microservices
cd user-service && npm run dev
cd room-service && npm run dev
cd booking-service && npm run dev
cd payment-service && npm run dev
cd review-service && npm run dev
cd admin-service && npm run dev

# Frontend
cd frontend && npm run dev
```

For the .NET Payment Service:
```bash
cd payment-service-dotnet
dotnet run
```

---

## 💳 Payment Options Supported
- **PayPal Checkout**: Sandbox and live checkout flow via PayPal SDK integration.
- **Credit / Debit Cards**: Secure checkout UI with client-side card validation.
- **Dual Microservice Backends**: Choice between lightweight Node.js/Express or enterprise ASP.NET Core 8 Web API.

---

## 📄 License
MIT License.

import os
import asyncio
import httpx
import jwt
import datetime
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Admin Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey123")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:5001")
ROOM_SERVICE_URL = os.getenv("ROOM_SERVICE_URL", "http://localhost:5002")
BOOKING_SERVICE_URL = os.getenv("BOOKING_SERVICE_URL", "http://localhost:5003")
PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:5004")

async def verify_admin(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if not payload.get("isAdmin"):
            raise HTTPException(status_code=403, detail="Admin permissions required")
        return auth_header
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

@app.get("/api/admin/dashboard")
async def get_dashboard(auth_header: str = Depends(verify_admin)):
    headers = {"Authorization": auth_header}
    async with httpx.AsyncClient() as client:
        try:
            # Fetch users, bookings, payments, and rooms in parallel
            responses = await asyncio.gather(
                client.get(f"{USER_SERVICE_URL}/api/users", headers=headers, timeout=5.0),
                client.get(f"{BOOKING_SERVICE_URL}/api/bookings/admin/all", headers=headers, timeout=5.0),
                client.get(f"{PAYMENT_SERVICE_URL}/api/payments/admin/all", headers=headers, timeout=5.0),
                client.get(f"{ROOM_SERVICE_URL}/api/rooms", headers=headers, timeout=5.0),
                return_exceptions=True
            )
            
            users_res, bookings_res, payments_res, rooms_res = responses
            
            # Handle possible connection/service failures gracefully
            total_users = 0
            if not isinstance(users_res, Exception) and users_res.status_code == 200:
                total_users = len(users_res.json())
                
            bookings = []
            if not isinstance(bookings_res, Exception) and bookings_res.status_code == 200:
                bookings = bookings_res.json()
                
            payments = []
            if not isinstance(payments_res, Exception) and payments_res.status_code == 200:
                payments = payments_res.json()
                
            rooms = []
            if not isinstance(rooms_res, Exception) and rooms_res.status_code == 200:
                rooms = rooms_res.json()
            
            total_bookings = len(bookings)
            total_rooms = len(rooms)
            total_revenue = sum(float(p.get("amount", 0)) for p in payments if p.get("status") == "Completed")
            
            # Occupancy calculations
            today = datetime.date.today()
            occupied_count = 0
            for b in bookings:
                if b.get("status") != "Cancelled":
                    try:
                        # parse ISO dates
                        check_in = datetime.datetime.fromisoformat(b.get("checkInDate").replace("Z", "+00:00")).date()
                        check_out = datetime.datetime.fromisoformat(b.get("checkOutDate").replace("Z", "+00:00")).date()
                        if check_in <= today <= check_out:
                            occupied_count += 1
                    except Exception:
                        pass
            
            occupancy_rate = round((occupied_count / total_rooms) * 100, 1) if total_rooms > 0 else 0.0
            
            return {
                "totalUsers": total_users,
                "totalBookings": total_bookings,
                "totalRooms": total_rooms,
                "totalRevenue": total_revenue,
                "occupancyRate": occupancy_rate,
                "recentBookings": bookings[:5],
                "recentPayments": payments[:5]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Aggregation error: {str(e)}")

@app.get("/api/admin/users")
async def get_users(auth_header: str = Depends(verify_admin)):
    headers = {"Authorization": auth_header}
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{USER_SERVICE_URL}/api/users", headers=headers)
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=res.text)
            return res.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"User Service connection failed: {str(e)}")

@app.put("/api/admin/users/{user_id}/promote")
async def promote_user(user_id: str, auth_header: str = Depends(verify_admin)):
    headers = {"Authorization": auth_header}
    async with httpx.AsyncClient() as client:
        try:
            res = await client.put(f"{USER_SERVICE_URL}/api/users/{user_id}/promote", headers=headers)
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=res.text)
            return res.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"User Service connection failed: {str(e)}")

@app.get("/api/admin/bookings")
async def get_bookings(auth_header: str = Depends(verify_admin)):
    headers = {"Authorization": auth_header}
    async with httpx.AsyncClient() as client:
        try:
            # Get all bookings
            bookings_res = await client.get(f"{BOOKING_SERVICE_URL}/api/bookings/admin/all", headers=headers)
            if bookings_res.status_code != 200:
                raise HTTPException(status_code=bookings_res.status_code, detail=bookings_res.text)
            bookings = bookings_res.json()
            
            # Get all users to attach user emails to bookings
            users_res = await client.get(f"{USER_SERVICE_URL}/api/users", headers=headers)
            users_map = {}
            if users_res.status_code == 200:
                for u in users_res.json():
                    users_map[u.get("_id")] = u
                    
            # Attach user details
            for b in bookings:
                u_id = b.get("userId")
                if u_id in users_map:
                    b["userEmail"] = users_map[u_id].get("email")
                    b["userName"] = users_map[u_id].get("name")
                else:
                    b["userEmail"] = "Unknown User"
                    b["userName"] = "Unknown"
            
            return bookings
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Booking Service connection failed: {str(e)}")

@app.delete("/api/admin/bookings/{booking_id}")
async def delete_booking(booking_id: str, auth_header: str = Depends(verify_admin)):
    headers = {"Authorization": auth_header}
    async with httpx.AsyncClient() as client:
        try:
            res = await client.delete(f"{BOOKING_SERVICE_URL}/api/bookings/{booking_id}", headers=headers)
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=res.text)
            return res.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Booking Service connection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5006))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

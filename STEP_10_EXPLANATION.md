# Step 10: Dockerization of Microservices

In this step, we containerized the entire application, which is the industry standard for deploying and managing microservices architectures. We transformed a tedious, multi-terminal development process into a simple, one-command deployment.

## Architecture & Flow

### 1. The Dockerfiles (The Blueprints)
We created a `Dockerfile` for every individual microservice and the React frontend.
* **Base Image**: We used `node:18-alpine` as the starting point. Alpine is a minimalist Linux distribution, ensuring our final Docker containers are as small and fast as possible.
* **Isolation**: Each container independently copies its own `package.json`, runs `npm install`, and starts its own server process. The containers share nothing except the network we explicitly define for them.

### 2. Docker Compose (The Orchestrator)
We introduced a `docker-compose.yml` file at the root of the project to manage all 7 containers simultaneously.
* **Internal Networking**: By default, Docker Compose places all defined services onto the same internal virtual network.
* **Service Discovery**: Inside the Docker network, containers can communicate using their service names instead of IP addresses. We updated the API Gateway's environment variables to route traffic to `http://user-service:5001`, `http://room-service:5002`, etc.
* **Port Mapping**: We mapped the internal container ports to your computer's `localhost` ports (e.g., `"5173:5173"`) so you can still access the frontend from your web browser just like before.

### 3. Build Optimization
* **.dockerignore**: We created `.dockerignore` files to prevent the massive, local `node_modules` folders from being copied into the containers. This forces Docker to run a clean `npm install` inside the Linux container, ensuring native modules compile correctly for the target OS and speeding up the build process.

## Microservices Best Practices Addressed
* **Reproducibility**: Docker guarantees that the code will run exactly the same way on a developer's Windows laptop as it will on an AWS Linux server.
* **Ease of Onboarding**: A new developer joining your team no longer needs to manually configure Node.js versions or open 6 terminals. They simply clone the repository and run `docker-compose up`.

#!/bin/bash

# 1. Pull latest changes
echo "git pull..."
git pull

# 2. Build the Docker Image
echo "Building Docker Image..."
docker build -f packages/dashboard/Dockerfile --build-arg VITE_AGENT_URL="http://192.168.68.82:4000" -t xeneon-dashboard .

# 3. Stop & Remove old container
echo "Stopping old container..."
docker rm -f xeneon-dashboard

# 4. Run the new container
echo "Starting new container..."
docker run -d -p 3001:80 --restart always --name xeneon-dashboard xeneon-dashboard

echo "Done! Dashboard running on port 3001."

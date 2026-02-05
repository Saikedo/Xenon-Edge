# Build Stage
FROM node:18-alpine as builder
WORKDIR /app

# Copy root config
COPY package.json package-lock.json ./

# Copy packages
COPY packages/dashboard ./packages/dashboard
COPY packages/agent/package.json ./packages/agent/package.json

# Install dependencies from ROOT using lockfile (faster, reliable)
RUN npm ci

# Build dashboard
WORKDIR /app/packages/dashboard
ARG VITE_AGENT_URL
ENV VITE_AGENT_URL=$VITE_AGENT_URL
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine
COPY --from=builder /app/packages/dashboard/dist /usr/share/nginx/html
# Copy custom Nginx config and Certs
COPY packages/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
COPY packages/dashboard/certs /etc/nginx/certs
EXPOSE 80 443 9443
CMD ["nginx", "-g", "daemon off;"]

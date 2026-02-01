# Build Stage
FROM node:18-alpine as builder
WORKDIR /app
# We need to copy the whole monorepo context or at least the dashboard package correctly
# Assuming build context is root of monorepo
COPY package.json .
COPY packages/dashboard ./packages/dashboard
WORKDIR /app/packages/dashboard
RUN npm install
RUN npm run build

# Production Stage (Nginx)
FROM nginx:alpine
COPY --from=builder /app/packages/dashboard/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

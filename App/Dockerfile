# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root-level dependencies if needed (e.g., CodeGen)
# The App/package.json references ../CodeGen/ui
COPY CodeGen/ui /app/CodeGen/ui

# Copy App folder
COPY App/package*.json ./App/
WORKDIR /app/App
RUN npm install

# Pass environment variables at build time (Vite)
ARG VITE_SERVER
ENV VITE_SERVER=$VITE_SERVER

# Copy source code
COPY App/ .

# Build the app (assuming production build)
RUN npm run build

# Final stage - serve with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY App/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
COPY --from=builder /app/App/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

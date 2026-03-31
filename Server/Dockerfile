# Build stage
FROM golang:1.23.4-alpine AS builder

WORKDIR /app

# Copy dependency files from root
COPY go.mod go.sum ./
RUN go mod download

# Copy all source code (needed because Server depends on other subprojects)
COPY . .

# Build the server binary
RUN go build -o main ./Server/main.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Expose ports based on .env
EXPOSE 8082 8083 50051

# Run the server
CMD ["./main"]

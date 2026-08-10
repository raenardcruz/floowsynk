# Build stage
FROM golang:1.23.4-alpine AS builder

WORKDIR /app

# Copy dependency files from root
COPY go.mod go.sum ./
RUN go mod download

# Copy all source code (needed because Server depends on other subprojects)
COPY . .

# Build the server binary
RUN go build -o main ./Server

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary and connector templates from builder
COPY --from=builder /app/main .
COPY --from=builder /app/Server/connectors ./connectors
COPY --from=builder /app/Server/connectors ./Server/connectors

# Expose ports based on .env
EXPOSE 8090 8091 50051

# Run the server
CMD ["./main"]

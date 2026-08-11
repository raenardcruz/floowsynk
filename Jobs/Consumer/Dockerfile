# Build stage
FROM golang:1.23.4-alpine AS builder

WORKDIR /app

# Copy dependency files from root
COPY go.mod go.sum ./
RUN go mod download

# Copy all source code
COPY . .

# Build the consumer binary
RUN go build -o consumer ./Jobs/Consumer

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/consumer .

# Run the consumer
CMD ["./consumer"]

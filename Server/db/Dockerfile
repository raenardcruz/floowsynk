# Use the official PostgreSQL image
FROM postgres:latest

# Set environment variables
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=flowsync
ENV POSTGRES_DB=flowsync

# Expose the PostgreSQL port
EXPOSE 5432

# Run PostgreSQL when the container starts
CMD ["postgres"]
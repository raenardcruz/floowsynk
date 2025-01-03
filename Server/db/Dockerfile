# Use the official PostgreSQL image
FROM postgres:17.2-alpine

# Set environment variables used only on Local
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=floowsynk
ENV POSTGRES_DB=floowsynk

# Expose the PostgreSQL port
EXPOSE 5432

# Run PostgreSQL when the container starts
CMD ["postgres"]
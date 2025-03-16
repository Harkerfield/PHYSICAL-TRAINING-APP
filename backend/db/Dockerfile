FROM postgres:latest

# Install PostGIS and gettext
RUN apt-get update && \
    apt-get install -y postgis postgresql-13-postgis-3 gettext

# Copy initialization scripts
COPY init /docker-entrypoint-initdb.d/
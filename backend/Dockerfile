# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean the node_modules directory
RUN rm -rf node_modules

# Install dependencies and rebuild bcrypt from source
RUN npm install && npm rebuild bcrypt --build-from-source

# Copy the rest of the application code
COPY . .

# Add wait-for-it script
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

# Expose the port the app runs on
EXPOSE ${SERVER_PORT}

# Start the application
CMD ["/bin/sh", "-c", "sleep 10 && /usr/src/app/wait-for-it.sh db:${POSTGRES_PORT} -- npm run start"]
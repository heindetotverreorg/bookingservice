# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /

# Copy the rest of the application code to the working directory
COPY . .

# Install dependencies
RUN npm install

# Expose the port that the application listens on
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]

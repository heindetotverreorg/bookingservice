# Use an official Node.js runtime as the base image
FROM node:18

RUN apt update -y && apt upgrade -y && useradd -m docker
RUN cd /home/docker && mkdir bookingservice && cd bookingservice

# Copy the rest of the application code to the working directory
COPY . .

# Install dependencies
RUN npm install

# Expose the port that the application listens on
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]

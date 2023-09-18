# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy all project files to the working directory
COPY . .

# Build the React app
RUN npm run build

# Expose the port your app will run on (default for React is 3000)
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]

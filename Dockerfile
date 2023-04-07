# Use the official Node.js image as the base image
FROM node:19

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml into the container
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application files into the container
COPY . .

# Build the application
RUN pnpm build

# Expose the port the application will run on
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]

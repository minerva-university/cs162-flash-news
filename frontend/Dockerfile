FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set build-time arguments
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:5001/api}

# Install dependencies first (for better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Update config.js with the environment variable and add logging
RUN echo "export const DB_HOST = '${REACT_APP_API_URL}';" > src/controllers/config.js && \
    echo "export const HEADERS_WITH_JWT = (token) => ({ \
        'Content-Type': 'application/json', \
        'Authorization': token ? \`Bearer \${token}\` : '' \
    });" >> src/controllers/config.js && \
    echo "console.log('DB_HOST:', DB_HOST);" >> src/controllers/config.js

# Build the application
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"] 
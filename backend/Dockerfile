FROM python:3.9-slim

# Set the working directory
WORKDIR /app 

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

# Set environment variables 
# Python Unbuffered is for the print statements and logs. May not be necessary
ENV FLASK_APP=app
ENV PYTHONUNBUFFERED=1  

# Expose the port that the app will run on
EXPOSE 5000

# Run gunicorn server
CMD ["/wait-for-db.sh", "gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--log-level", "debug", "app:create_app()"]
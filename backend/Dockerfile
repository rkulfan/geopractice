# Use official Python base image
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app

# Copy only requirements first (better cache)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project files
COPY . .

# Expose port your app will run on
EXPOSE 8000

# Default command to run your Django app
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000", "--log-level", "debug"]
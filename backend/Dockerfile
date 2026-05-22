FROM python:3.11-slim

WORKDIR /workspace

# Install basic system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies first to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Start Uvicorn reload server (suitable for dev/container execution)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

import multiprocessing

bind = "0.0.0.0:10000"  # Match Render's port
workers = 2  # Reduced number of workers
worker_class = "sync"
threads = 4  # Added thread configuration
worker_connections = 1000
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Worker configurations
worker_tmp_dir = "/dev/shm"  # Use memory for temp files
forwarded_allow_ips = "*"  # Trust X-Forwarded-* headers

# Resource management
worker_memory_limit = "512M"  # Limit memory per worker

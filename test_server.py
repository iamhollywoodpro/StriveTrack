#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys

class MyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.join(os.getcwd(), 'public'), **kwargs)
    
    def log_message(self, format, *args):
        sys.stdout.write(f"{self.log_date_time_string()} - {format%args}\n")
        sys.stdout.flush()

if __name__ == "__main__":
    server = HTTPServer(('0.0.0.0', 3000), MyHandler)
    print("Test server running on port 3000, serving from /public directory")
    sys.stdout.flush()
    server.serve_forever()
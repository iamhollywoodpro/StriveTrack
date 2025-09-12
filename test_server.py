#!/usr/bin/env python3
"""
Simple HTTP server for testing StriveTrack cloud functionality
"""
import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = "public"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        sys.stdout.write(f"{self.log_date_time_string()} - {format%args}\n")
        sys.stdout.flush()

    def end_headers(self):
        # Add CORS headers for testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

if __name__ == "__main__":
    os.chdir('/home/user/webapp')
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 StriveTrack test server running at http://localhost:{PORT}")
        print(f"📁 Serving files from: {os.path.abspath(DIRECTORY)}")
        print("🔍 Testing cloud storage functionality...")
        print("📱 Access test page: http://localhost:3000/test-cloud.html")
        print("🌐 Main app: http://localhost:3000/index-cloud.html")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Shutting down server...")
            sys.exit(0)
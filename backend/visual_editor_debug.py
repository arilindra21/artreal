"""
Simple debug logger for visual editor that writes to a file
"""
import os
import sys
from datetime import datetime

LOG_FILE = os.path.join(os.path.dirname(__file__), 'visual_editor.log')

def log(message):
    """Write message to both stdout and log file"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_message = f"[{timestamp}] {message}\n"

    # Write to file
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(full_message)
    except Exception as e:
        print(f"Error writing to log file: {e}")

    # Write to stdout
    try:
        sys.stdout.write(full_message)
        sys.stdout.flush()
    except Exception as e:
        print(f"Error writing to stdout: {e}")

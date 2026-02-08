"""
Quick conversion script for the ArtReal demo video.
Converts the specific video to GIF with optimized settings.
"""

import os
import sys
from pathlib import Path

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Your video path (update this to your video location)
INPUT_VIDEO = r"path\to\your\demo\video.mp4"

# Output settings
OUTPUT_DIR = r"docs\videos"
OUTPUT_FILENAME = "demo.gif"

# Conversion settings (adjust these as needed)
SETTINGS = {
    'fps': 10,        # Frames per second (8-15 recommended for demos)
    'width': 900,     # Width in pixels (800-1200 recommended)
    'quality': 85,    # Quality 1-100
}

def convert_video():
    """Convert the demo video to GIF."""
    import subprocess

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)

    print("=" * 60)
    print("ArtReal Demo Video Converter")
    print("=" * 60)
    print(f"\nInput:  {INPUT_VIDEO}")
    print(f"Output: {output_path}")
    print(f"\nSettings:")
    print(f"  FPS:     {SETTINGS['fps']}")
    print(f"  Width:   {SETTINGS['width']}px")
    print(f"  Quality: {SETTINGS['quality']}%")
    print("\n" + "=" * 60)

    # Check if input exists
    if not os.path.exists(INPUT_VIDEO):
        print(f"\n Error: Input video not found!")
        print(f"   {INPUT_VIDEO}")
        print(f"\n   Please update INPUT_VIDEO in this script to point to your video file.")
        sys.exit(1)

    # Check if ffmpeg is available
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("\n Error: ffmpeg not found!")
        print("\nPlease install ffmpeg:")
        print("  Windows: choco install ffmpeg")
        print("  Or download from: https://ffmpeg.org/download.html")
        sys.exit(1)

    # Generate palette
    palette_path = os.path.join(OUTPUT_DIR, "temp_palette.png")
    print("\n Step 1: Generating color palette...")

    palette_cmd = [
        'ffmpeg',
        '-i', INPUT_VIDEO,
        '-vf', f'fps={SETTINGS["fps"]},scale={SETTINGS["width"]}:-1:flags=lanczos,palettegen=stats_mode=diff:max_colors=256',
        '-y',
        palette_path
    ]

    try:
        subprocess.run(palette_cmd, check=True, capture_output=True, text=True)
        print("   Palette generated")
    except subprocess.CalledProcessError as e:
        print(f"   Error: {e.stderr}")
        sys.exit(1)

    # Create GIF
    print("\n Step 2: Creating GIF (this may take a minute)...")

    gif_cmd = [
        'ffmpeg',
        '-i', INPUT_VIDEO,
        '-i', palette_path,
        '-lavfi', f'fps={SETTINGS["fps"]},scale={SETTINGS["width"]}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
        '-y',
        output_path
    ]

    try:
        result = subprocess.run(gif_cmd, check=True, capture_output=True, text=True)
        print("   GIF created successfully")
    except subprocess.CalledProcessError as e:
        print(f"   Error: {e.stderr}")
        # Clean up
        if os.path.exists(palette_path):
            os.remove(palette_path)
        sys.exit(1)

    # Clean up palette
    if os.path.exists(palette_path):
        os.remove(palette_path)

    # Show results
    input_size = os.path.getsize(INPUT_VIDEO) / (1024 * 1024)  # MB
    output_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
    reduction = ((input_size - output_size) / input_size * 100)

    print("\n" + "=" * 60)
    print(" Conversion Complete!")
    print("=" * 60)
    print(f"\n File Sizes:")
    print(f"   Input:     {input_size:.2f} MB")
    print(f"   Output:    {output_size:.2f} MB")
    print(f"   Reduction: {reduction:.1f}%")
    print(f"\n Saved to:")
    print(f"   {output_path}")
    print("\n Next steps:")
    print(f"   1. View the GIF to check quality")
    print(f"   2. If file is too large (>5MB), reduce fps or width")
    print(f"   3. If quality is poor, increase fps or quality setting")
    print(f"   4. Update README.md with the GIF path")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    try:
        convert_video()
    except KeyboardInterrupt:
        print("\n\n Conversion cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n Unexpected error: {e}")
        sys.exit(1)

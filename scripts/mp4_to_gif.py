"""
MP4 to GIF Converter
Converts MP4 videos to optimized GIF files for documentation and demos.
"""

import os
import sys
from pathlib import Path

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def convert_mp4_to_gif(input_path, output_path=None, fps=10, scale=800, quality=80):
    """
    Convert MP4 video to GIF using ffmpeg.

    Args:
        input_path (str): Path to input MP4 file
        output_path (str, optional): Path to output GIF file. If None, uses same name as input
        fps (int): Frames per second (lower = smaller file, default: 10)
        scale (int): Width in pixels, height is calculated proportionally (default: 800)
        quality (int): Quality 1-100, higher is better but larger file (default: 80)

    Returns:
        str: Path to created GIF file
    """
    try:
        import subprocess
    except ImportError:
        print("Error: subprocess module not available")
        sys.exit(1)

    # Validate input file
    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)

    # Determine output path
    if output_path is None:
        input_file = Path(input_path)
        output_path = input_file.with_suffix('.gif')

    output_path = str(output_path)

    print(f"Converting: {input_path}")
    print(f"Output: {output_path}")
    print(f"Settings: {fps} fps, {scale}px width, {quality}% quality")
    print()

    # Build ffmpeg command with optimized palette generation
    # Step 1: Generate palette for better color quality
    palette_path = "palette.png"

    palette_cmd = [
        'ffmpeg',
        '-i', input_path,
        '-vf', f'fps={fps},scale={scale}:-1:flags=lanczos,palettegen=stats_mode=diff',
        '-y',  # Overwrite palette if exists
        palette_path
    ]

    print("Step 1: Generating color palette...")
    try:
        subprocess.run(palette_cmd, check=True, capture_output=True, text=True)
        print("✓ Palette generated")
    except subprocess.CalledProcessError as e:
        print(f"Error generating palette: {e.stderr}")
        sys.exit(1)

    # Step 2: Create GIF using the palette
    gif_cmd = [
        'ffmpeg',
        '-i', input_path,
        '-i', palette_path,
        '-lavfi', f'fps={fps},scale={scale}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
        '-y',  # Overwrite output if exists
        output_path
    ]

    print("\nStep 2: Creating GIF...")
    try:
        result = subprocess.run(gif_cmd, check=True, capture_output=True, text=True)
        print("✓ GIF created successfully")
    except subprocess.CalledProcessError as e:
        print(f"Error creating GIF: {e.stderr}")
        # Clean up palette
        if os.path.exists(palette_path):
            os.remove(palette_path)
        sys.exit(1)

    # Clean up palette file
    if os.path.exists(palette_path):
        os.remove(palette_path)

    # Show file sizes
    input_size = os.path.getsize(input_path) / (1024 * 1024)  # MB
    output_size = os.path.getsize(output_path) / (1024 * 1024)  # MB

    print(f"\n✓ Conversion complete!")
    print(f"  Input size:  {input_size:.2f} MB")
    print(f"  Output size: {output_size:.2f} MB")
    print(f"  Reduction:   {((input_size - output_size) / input_size * 100):.1f}%")
    print(f"\nSaved to: {output_path}")

    return output_path


def main():
    """Main function to handle command line usage."""

    # Check if ffmpeg is available
    try:
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("Error: ffmpeg not found. Please install ffmpeg first.")
            print("Windows: choco install ffmpeg")
            print("Mac: brew install ffmpeg")
            print("Linux: sudo apt install ffmpeg")
            sys.exit(1)
    except FileNotFoundError:
        print("Error: ffmpeg not found. Please install ffmpeg first.")
        print("\nInstallation:")
        print("  Windows: choco install ffmpeg")
        print("  Mac:     brew install ffmpeg")
        print("  Linux:   sudo apt install ffmpeg")
        print("\nOr download from: https://ffmpeg.org/download.html")
        sys.exit(1)

    # Parse command line arguments
    if len(sys.argv) < 2:
        print("MP4 to GIF Converter")
        print("=" * 50)
        print("\nUsage:")
        print("  python mp4_to_gif.py <input.mp4> [output.gif] [fps] [width] [quality]")
        print("\nArguments:")
        print("  input.mp4    : Path to input MP4 file (required)")
        print("  output.gif   : Path to output GIF file (optional, default: same as input)")
        print("  fps          : Frames per second (optional, default: 10)")
        print("  width        : Width in pixels (optional, default: 800)")
        print("  quality      : Quality 1-100 (optional, default: 80)")
        print("\nExamples:")
        print('  python mp4_to_gif.py "video.mp4"')
        print('  python mp4_to_gif.py "video.mp4" "output.gif"')
        print('  python mp4_to_gif.py "video.mp4" "output.gif" 15 1000 90')
        print("\nPresets:")
        print("  Small file:  fps=8,  width=600,  quality=70")
        print("  Balanced:    fps=10, width=800,  quality=80 (default)")
        print("  High quality: fps=15, width=1200, quality=90")
        sys.exit(1)

    # Get arguments
    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    fps = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    scale = int(sys.argv[4]) if len(sys.argv) > 4 else 800
    quality = int(sys.argv[5]) if len(sys.argv) > 5 else 80

    # Convert
    convert_mp4_to_gif(input_path, output_path, fps, scale, quality)


if __name__ == "__main__":
    main()

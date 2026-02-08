# Utility Scripts

Helper scripts for ArtReal development and documentation.

## Video Conversion Scripts

Scripts to convert MP4 videos to optimized GIF files for documentation and demos.

### Prerequisites

**Windows**
```bash
# Install ffmpeg using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

**Mac**
```bash
brew install ffmpeg
```

**Linux**
```bash
sudo apt install ffmpeg
```

## Scripts

### 1. `convert_demo_video.py` - Quick Demo Converter
**Purpose:** Converts demo videos to GIF with pre-configured settings.

**Usage:**
```bash
# Windows (easiest)
convert_demo.bat

# Or with Python directly
python convert_demo_video.py
```

**Settings:**
- Output: `docs/videos/demo-overview.gif`
- FPS: 10
- Width: 900px
- Quality: 85%

**To customize settings**, edit these lines in `convert_demo_video.py`:
```python
SETTINGS = {
    'fps': 10,        # Lower = smaller file, 8-15 recommended
    'width': 900,     # Smaller = smaller file, 800-1200 recommended
    'quality': 85,    # Higher = better quality, 70-90 recommended
}
```

---

### 2. `mp4_to_gif.py` - General Purpose Converter
**Purpose:** Convert any MP4 video to GIF with custom settings.

**Usage:**
```bash
# Basic usage (uses defaults)
python mp4_to_gif.py "path/to/video.mp4"

# Specify output file
python mp4_to_gif.py "input.mp4" "output.gif"

# Full customization
python mp4_to_gif.py "input.mp4" "output.gif" 15 1000 90
#                                              fps width quality
```

**Arguments:**
1. `input.mp4` - Path to input MP4 file (required)
2. `output.gif` - Path to output GIF file (optional, default: same as input)
3. `fps` - Frames per second (optional, default: 10)
4. `width` - Width in pixels (optional, default: 800)
5. `quality` - Quality 1-100 (optional, default: 80)

**Examples:**
```bash
# Convert with defaults (10 fps, 800px width, 80% quality)
python mp4_to_gif.py "demo.mp4"

# High quality for GitHub README
python mp4_to_gif.py "demo.mp4" "readme-demo.gif" 12 1000 85

# Small file for quick loading
python mp4_to_gif.py "demo.mp4" "small-demo.gif" 8 600 70
```

**Presets:**

| Preset | FPS | Width | Quality | Use Case |
|--------|-----|-------|---------|----------|
| **Small** | 8 | 600 | 70 | Lightweight demos, mobile |
| **Balanced** | 10 | 800 | 80 | Default, good for most uses |
| **High Quality** | 15 | 1200 | 90 | Hero videos, detailed demos |

---

## Tips for Best Results

### File Size Optimization
- **Target:** < 5MB for GitHub (ideal: 2-3MB)
- **If too large:**
  - Reduce FPS (10 → 8)
  - Reduce width (900 → 700)
  - Reduce quality (85 → 75)
- **If too small/poor quality:**
  - Increase FPS (10 → 12)
  - Increase quality (85 → 90)

### Quality Settings
- **8 FPS:** Slideshow-like, smallest files
- **10 FPS:** Smooth enough for UI demos (recommended)
- **12-15 FPS:** Smooth animations, larger files
- **20+ FPS:** Unnecessary for GIFs, very large files

### Width Settings
- **600px:** Mobile-first, very small files
- **800px:** Good balance for most screens
- **900-1000px:** Detailed UI demonstrations
- **1200px+:** High-resolution displays, large files

### Recording Tips
1. **Keep videos short:** 10-30 seconds ideal
2. **Clean UI:** Close unnecessary windows/tabs
3. **Smooth movements:** Slow, deliberate mouse movements
4. **Highlight key actions:** Pause briefly on important steps
5. **High contrast:** Use themes with good contrast

---

## Troubleshooting

### Error: "ffmpeg not found"
**Solution:** Install ffmpeg (see Prerequisites above)

### Error: "Input file not found"
**Solution:** Check the file path, use quotes around paths with spaces:
```bash
python mp4_to_gif.py "C:\Users\Name\Videos\my video.mp4"
```

### GIF is too large (>10MB)
**Solution:** Reduce settings:
```bash
python mp4_to_gif.py "video.mp4" "output.gif" 8 600 70
```

### GIF quality is poor
**Solution:** Increase settings (warning: larger file):
```bash
python mp4_to_gif.py "video.mp4" "output.gif" 12 1000 90
```

### Video is too long
**Solution:** Trim the video first using ffmpeg:
```bash
# Trim to first 30 seconds
ffmpeg -i input.mp4 -t 30 -c copy trimmed.mp4

# Extract from 10s to 40s (30 seconds total)
ffmpeg -i input.mp4 -ss 10 -t 30 -c copy trimmed.mp4
```

---

## Workflow for README Videos

1. **Record video** (OBS, Windows Game Bar, etc.)
2. **Trim if needed** (keep to 10-60 seconds)
3. **Convert to GIF:**
   ```bash
   python mp4_to_gif.py "recording.mp4" "docs/videos/feature-demo.gif" 10 900 85
   ```
4. **Check file size:**
   - If > 5MB: Reduce fps/width/quality
   - If < 1MB: Can increase quality
5. **Update README.md:**
   ```markdown
   ![Feature Demo](docs/videos/feature-demo.gif)
   ```
6. **Create thumbnail (optional):**
   - Extract first frame: `ffmpeg -i video.mp4 -vframes 1 thumbnail.png`
   - Use in README: `[![Demo](thumbnail.png)](video.mp4)`

---

## Batch Processing Multiple Videos

Create a script to convert multiple videos:

```bash
# convert_all.bat (Windows)
@echo off
python mp4_to_gif.py "video1.mp4" "docs/videos/demo1.gif" 10 900 85
python mp4_to_gif.py "video2.mp4" "docs/videos/demo2.gif" 10 900 85
python mp4_to_gif.py "video3.mp4" "docs/videos/demo3.gif" 10 900 85
echo All videos converted!
pause
```

```bash
# convert_all.sh (Linux/Mac)
#!/bin/bash
python3 mp4_to_gif.py "video1.mp4" "docs/videos/demo1.gif" 10 900 85
python3 mp4_to_gif.py "video2.mp4" "docs/videos/demo2.gif" 10 900 85
python3 mp4_to_gif.py "video3.mp4" "docs/videos/demo3.gif" 10 900 85
echo "All videos converted!"
```

---

## Advanced: Extract Thumbnail

To create a thumbnail image from a video:

```bash
# Extract first frame
ffmpeg -i video.mp4 -vframes 1 -q:v 2 thumbnail.png

# Extract frame at 5 seconds
ffmpeg -ss 5 -i video.mp4 -vframes 1 -q:v 2 thumbnail.png
```

Then use in README for clickable video:
```markdown
[![Demo Video](docs/videos/thumbnails/demo.png)](docs/videos/demo.mp4)
```

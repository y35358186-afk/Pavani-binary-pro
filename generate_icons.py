#!/usr/bin/env python3
"""
Generate Pavani Binary Pro App Icons
Creates premium purple-gradient icons with stylized "P" letter
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Installing required package: Pillow")
    import subprocess
    subprocess.check_call(['pip', 'install', 'Pillow', '--break-system-packages'])
    from PIL import Image, ImageDraw, ImageFont
    import os

def create_pavani_icon(size):
    """Create Pavani Binary Pro icon with gradient and P letter"""
    
    # Create image with dark purple background
    img = Image.new('RGB', (size, size), color='#0a0015')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background (purple to pink)
    for i in range(size):
        # Calculate gradient color
        ratio = i / size
        r = int(157 + (255 - 157) * ratio * 0.3)  # 157 to pink
        g = int(78 + (0 - 78) * ratio * 0.5)       # 78 to pink
        b = int(221 + (110 - 221) * ratio * 0.3)   # 221 to pink
        draw.line([(0, i), (size, i)], fill=(r, g, b))
    
    # Draw rounded rectangle border
    border_width = max(2, size // 48)
    corner_radius = size // 8
    
    # Purple glow effect
    for offset in range(5):
        alpha = int(100 - offset * 15)
        rect_coords = [
            border_width - offset, 
            border_width - offset, 
            size - border_width + offset, 
            size - border_width + offset
        ]
        draw.rounded_rectangle(
            rect_coords,
            radius=corner_radius,
            outline=(157, 78, 221, alpha),
            width=2
        )
    
    # Draw the letter "P" - Pavani
    font_size = int(size * 0.65)
    try:
        # Try to use a serif font for elegant look
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    text = "P"
    
    # Get text size
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - int(size * 0.03)
    
    # Draw text shadow for depth
    shadow_offset = max(2, size // 64)
    draw.text((x + shadow_offset, y + shadow_offset), text, fill=(0, 0, 0, 150), font=font)
    
    # Draw main text with white/cyan color
    draw.text((x, y), text, fill='#00f5ff', font=font)
    
    # Add subtle shine effects at top
    shine_y_start = int(size * 0.15)
    for i in range(3):
        shine_y = shine_y_start + i * 4
        opacity = int(120 - i * 30)
        draw.line(
            [(int(size * 0.25), shine_y), (int(size * 0.75), shine_y)],
            fill=(255, 255, 255, opacity),
            width=3
        )
    
    # Add corner accents (small dots for premium look)
    accent_size = max(3, size // 32)
    accent_positions = [
        (int(size * 0.12), int(size * 0.12)),  # Top-left
        (int(size * 0.88), int(size * 0.12)),  # Top-right
        (int(size * 0.12), int(size * 0.88)),  # Bottom-left
        (int(size * 0.88), int(size * 0.88)),  # Bottom-right
    ]
    
    for px, py in accent_positions:
        draw.ellipse(
            [px - accent_size, py - accent_size, px + accent_size, py + accent_size],
            fill='#ff006e'
        )
    
    return img

def main():
    print("🎨 Generating Pavani Binary Pro Icons...")
    print("=" * 70)
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Generate 192x192 icon
    print("📱 Creating icon-192.png...")
    icon_192 = create_pavani_icon(192)
    icon_192_path = os.path.join(output_dir, 'icon-192.png')
    icon_192.save(icon_192_path, 'PNG', optimize=True)
    print(f"   ✅ Saved: {icon_192_path}")
    
    # Generate 512x512 icon
    print("📱 Creating icon-512.png...")
    icon_512 = create_pavani_icon(512)
    icon_512_path = os.path.join(output_dir, 'icon-512.png')
    icon_512.save(icon_512_path, 'PNG', optimize=True)
    print(f"   ✅ Saved: {icon_512_path}")
    
    # Generate favicon
    print("📱 Creating favicon.ico...")
    icon_32 = create_pavani_icon(32)
    favicon_path = os.path.join(output_dir, 'favicon.ico')
    icon_32.save(favicon_path, 'ICO')
    print(f"   ✅ Saved: {favicon_path}")
    
    print("=" * 70)
    print("🎉 Pavani Binary Pro icons generated successfully!")
    print("\n📋 Generated files:")
    print("   • icon-192.png (Mobile home screen)")
    print("   • icon-512.png (High-resolution displays)")
    print("   • favicon.ico (Browser tab)")
    print("\n✨ Your premium Pavani Binary Pro icons are ready!")
    print("🎨 Design: Purple gradient with cyan 'P' letter")

if __name__ == '__main__':
    main()

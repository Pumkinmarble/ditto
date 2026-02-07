#!/bin/bash

# Script to download Ready Player Me avatar files locally
# This makes the app work offline and removes dependency on RPM servers

echo "📥 Downloading Ready Player Me avatars..."

# Create assets directory
mkdir -p assets
cd assets

# Download male avatar
echo "👨 Downloading male avatar..."
curl -L -o male-default.glb "https://models.readyplayer.me/6987924e6ac2615313dd6ae4.glb?morphTargets=ARKit"

if [ $? -eq 0 ]; then
    echo "✅ Male avatar downloaded successfully"
else
    echo "❌ Failed to download male avatar"
fi

# Download female avatar
echo "👩 Downloading female avatar..."
curl -L -o female-default.glb "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit"

if [ $? -eq 0 ]; then
    echo "✅ Female avatar downloaded successfully"
else
    echo "❌ Failed to download female avatar"
fi

# Download custom avatar (your avatar)
echo "🎭 Downloading custom avatar..."
curl -L -o custom-avatar.glb "https://models.readyplayer.me/69879010ea77ff02ffcc5e1a.glb?morphTargets=ARKit"

if [ $? -eq 0 ]; then
    echo "✅ Custom avatar downloaded successfully"
else
    echo "❌ Failed to download custom avatar"
fi

echo ""
echo "✨ Done! Avatar files saved to: $(pwd)"
echo ""
echo "📁 Files:"
ls -lh *.glb

echo ""
echo "💡 The HTML file will now try to load from local files first,"
echo "   then fallback to CDN if local files aren't found."

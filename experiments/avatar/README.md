# Real-Time Avatar with Ready Player Me

A modular, real-time talking avatar system using Ready Player Me for avatar generation and Three.js for rendering with lip sync.

## Architecture

```
experimentation/avatar/
├── lib/                    # Core functionality (easy to refactor)
│   ├── readyPlayerMe.ts   # Avatar creation from photo
│   ├── avatarRenderer.ts  # Three.js rendering engine
│   └── lipSync.ts         # Audio → lip sync (upgradeable)
├── components/            # React components
│   ├── AvatarViewer.tsx   # Main avatar display
│   └── PhotoCapture.tsx   # Camera/photo upload
├── test/                  # Quick test demos
│   └── SimpleTest.tsx     # Minimal test (photo + audio)
└── public/audio/          # Test audio files
```

## Features

- ✅ Photo → 3D Avatar (Ready Player Me)
- ✅ Real-time lip sync with audio
- ✅ Works in browser (Next.js)
- ✅ Modular design (easy to swap components)
- ✅ No complex APIs needed for basic test

## Quick Test

The simple test lets you:
1. Take a photo or upload one
2. Load an avatar
3. Play audio or text → see lip sync work
4. **No ElevenLabs/Gemini needed for testing**

## Setup

### 1. Install Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
```

### 2. Run Simple Test

```bash
# Import the test component in your Next.js page
import SimpleTest from '@/experimentation/avatar/test/SimpleTest';
```

## How It Works

### Avatar Creation
1. User uploads photo
2. Send to Ready Player Me API
3. Get back .glb 3D model
4. Load into Three.js scene

### Lip Sync (Basic → Advanced)

**Current (Basic - No external dependencies):**
- Analyze audio amplitude
- Map to mouth blend shapes
- Simple but works immediately

**Upgrade Path (Easy to swap in):**
- Rhubarb Lip Sync (phoneme-based)
- Azure Speech Service (viseme data)
- Oculus Lipsync (advanced)

### Audio Input
- Load audio file (MP3, WAV)
- Or: Text → Speech (will add ElevenLabs later)
- Or: Microphone input

## Next Steps

Once the basic test works:
1. ✅ Integrate ElevenLabs (text → audio)
2. ✅ Add Gemini RAG (conversational AI)
3. ✅ Upgrade lip sync (Rhubarb/better algorithm)
4. ✅ Add facial expressions
5. ✅ Add voice cloning

## API Keys (Optional for now)

Ready Player Me is free but rate-limited. For production:
- Get API key at: https://readyplayer.me/

ElevenLabs (add later):
- https://elevenlabs.io/

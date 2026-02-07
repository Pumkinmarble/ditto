# Quick Start Guide

## Install Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
```

## Run the Test

### Option 1: Add to existing Next.js page

Create or edit a page in your Next.js app:

```tsx
// app/test-avatar/page.tsx
import SimpleTest from '@/experimentation/avatar/test/SimpleTest';

export default function TestAvatarPage() {
  return <SimpleTest />;
}
```

Then visit: `http://localhost:3000/test-avatar`

### Option 2: Use components separately

```tsx
import AvatarViewer from '@/experimentation/avatar/components/AvatarViewer';
import PhotoCapture from '@/experimentation/avatar/components/PhotoCapture';

export default function MyPage() {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  return (
    <div>
      <PhotoCapture onPhotoCapture={(blob) => {
        // Handle photo
      }} />

      <AvatarViewer
        avatarUrl={avatarUrl}
        audioUrl={audioUrl}
        isPlaying={true}
      />
    </div>
  );
}
```

## Test Flow

1. **Take Photo** - Use camera or upload
2. **Create Avatar** - Opens Ready Player Me (or use demo)
3. **Load Audio** - Upload MP3/WAV file
4. **Watch** - Avatar's mouth moves with audio!

## Sample Audio Files

Add test audio to `public/audio/`:

```bash
# Record yourself or use TTS
# Save as: public/audio/sample1.mp3
```

Or use any online audio file URL.

## Troubleshooting

### "Three is not defined"
Make sure you installed three.js:
```bash
npm install three
```

### "Avatar not loading"
- Check browser console for errors
- Verify avatar URL includes `?morphTargets=ARKit`
- Try the demo avatar first

### "Lip sync not working"
- Check if avatar has morph targets (console logs this)
- Try increasing audio volume
- Check browser console for Web Audio API errors

### "Ready Player Me not opening"
- Check if popups are blocked
- Try "Use Demo Avatar" instead for quick test

## What's Next?

Once the test works:
1. ✅ Integrate ElevenLabs (text → audio)
2. ✅ Add Gemini RAG (conversational AI)
3. ✅ Upgrade lip sync (Rhubarb, better algorithm)
4. ✅ Add facial expressions
5. ✅ Deploy to production

## Need Help?

Check the main README.md for full documentation and architecture details.

/**
 * Lip Sync Engine
 * Maps audio to mouth movements (blend shapes)
 *
 * Current: Basic amplitude-based
 * Upgrade path: Rhubarb, Azure Speech, Oculus Lipsync
 */

export type Viseme =
  | 'sil'  // Silence
  | 'aa'   // Open mouth (ah)
  | 'oh'   // Round lips (oh)
  | 'ee'   // Wide mouth (ee)
  | 'i'    // Small opening
  | 'u'    // Lips forward (oo)
  | 'ff'   // Lower lip to teeth
  | 'th'   // Tongue between teeth
  | 'ch'   // Lips forward tight
  | 'ss';  // Teeth together

export interface VisemeFrame {
  time: number;    // Time in seconds
  viseme: Viseme;  // Mouth shape
  weight: number;  // 0-1 intensity
}

export interface LipSyncData {
  frames: VisemeFrame[];
  duration: number;
}

/**
 * Basic Lip Sync: Analyze audio amplitude
 * Simple but works immediately - good for testing
 */
export class BasicLipSync {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;

  constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  /**
   * Connect audio source for real-time analysis
   */
  connectAudio(audioElement: HTMLAudioElement): void {
    const source = this.audioContext.createMediaElementSource(audioElement);
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  /**
   * Get current mouth opening (0-1) based on audio amplitude
   */
  getCurrentMouthOpening(): number {
    this.analyser.getByteFrequencyData(this.dataArray as Uint8Array);

    // Calculate average amplitude
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;

    // Normalize to 0-1 range
    return Math.min(average / 128, 1);
  }

  /**
   * Map amplitude to ARKit blend shapes
   */
  getMouthBlendShapes(): Record<string, number> {
    const opening = this.getCurrentMouthOpening();

    return {
      'mouthOpen': opening * 0.8,
      'jawOpen': opening * 0.6,
      'mouthSmile': opening * 0.2, // Slight smile
    };
  }
}

/**
 * Advanced Lip Sync: Pre-analyze audio for phonemes
 * TODO: Integrate Rhubarb or similar
 */
export class AdvancedLipSync {
  /**
   * Analyze audio file and generate viseme timeline
   * This is a placeholder - implement Rhubarb integration here
   */
  async analyzeAudio(audioUrl: string): Promise<LipSyncData> {
    // TODO: Call Rhubarb API or run locally
    // For now, return basic data

    const audio = new Audio(audioUrl);
    await new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', resolve);
      audio.load();
    });

    // Placeholder: Create simple open-close pattern
    const frames: VisemeFrame[] = [];
    const duration = audio.duration;
    const fps = 30;

    for (let i = 0; i < duration * fps; i++) {
      const time = i / fps;
      const weight = Math.sin(time * 5) * 0.5 + 0.5; // Sine wave

      frames.push({
        time,
        viseme: weight > 0.5 ? 'aa' : 'sil',
        weight,
      });
    }

    return { frames, duration };
  }

  /**
   * Get blend shapes for a specific time
   */
  getBlendShapesAtTime(lipSyncData: LipSyncData, time: number): Record<string, number> {
    // Find closest frame
    const frame = lipSyncData.frames.find(f => Math.abs(f.time - time) < 0.033)
      || lipSyncData.frames[0];

    return this.visemeToBlendShapes(frame.viseme, frame.weight);
  }

  /**
   * Map viseme to ARKit blend shapes
   */
  private visemeToBlendShapes(viseme: Viseme, weight: number): Record<string, number> {
    const shapes: Record<string, number> = {
      'mouthOpen': 0,
      'jawOpen': 0,
      'mouthSmile': 0,
      'mouthPucker': 0,
      'mouthFunnel': 0,
    };

    switch (viseme) {
      case 'aa': // Open mouth
        shapes.mouthOpen = weight * 0.8;
        shapes.jawOpen = weight * 0.6;
        break;
      case 'oh': // Round lips
        shapes.mouthPucker = weight * 0.7;
        shapes.mouthOpen = weight * 0.3;
        break;
      case 'ee': // Wide mouth
        shapes.mouthSmile = weight * 0.8;
        shapes.mouthOpen = weight * 0.2;
        break;
      case 'u': // Lips forward
        shapes.mouthFunnel = weight * 0.8;
        break;
      case 'sil': // Silence
        // All stay at 0
        break;
    }

    return shapes;
  }
}

/**
 * Factory: Create lip sync engine
 * Easy to swap between basic and advanced
 */
export function createLipSync(type: 'basic' | 'advanced' = 'basic'): BasicLipSync | AdvancedLipSync {
  return type === 'basic' ? new BasicLipSync() : new AdvancedLipSync();
}

/**
 * ARKit Blend Shape names (for reference)
 * Ready Player Me avatars support these
 */
export const ARKIT_BLEND_SHAPES = {
  // Jaw
  jawOpen: 'jawOpen',
  jawForward: 'jawForward',
  jawLeft: 'jawLeft',
  jawRight: 'jawRight',

  // Mouth
  mouthClose: 'mouthClose',
  mouthFunnel: 'mouthFunnel',
  mouthPucker: 'mouthPucker',
  mouthSmileLeft: 'mouthSmileLeft',
  mouthSmileRight: 'mouthSmileRight',
  mouthOpen: 'mouthOpen',

  // Lips
  mouthUpperUpLeft: 'mouthUpperUpLeft',
  mouthUpperUpRight: 'mouthUpperUpRight',
  mouthLowerDownLeft: 'mouthLowerDownLeft',
  mouthLowerDownRight: 'mouthLowerDownRight',
} as const;

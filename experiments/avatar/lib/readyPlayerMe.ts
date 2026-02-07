/**
 * Ready Player Me Integration
 * Converts photos to 3D avatars
 */

const RPM_API_URL = 'https://api.readyplayer.me/v1';
const RPM_SUBDOMAIN = 'demo'; // Use your subdomain or 'demo' for testing

export interface AvatarConfig {
  bodyType?: 'fullbody' | 'halfbody';
  gender?: 'male' | 'female';
  style?: 'default' | 'anime';
}

export interface AvatarResult {
  avatarUrl: string;  // URL to .glb model
  avatarId: string;   // Unique ID
  thumbnailUrl?: string;
}

/**
 * Create avatar from photo (client-side)
 * Uses Ready Player Me iframe method (easiest)
 */
export function openAvatarCreator(
  onComplete: (avatarUrl: string) => void,
  config?: AvatarConfig
): void {
  const frame = document.createElement('iframe');

  const bodyType = config?.bodyType || 'halfbody';
  const params = new URLSearchParams({
    frameApi: 'true',
    clearCache: 'true',
    bodyType,
  });

  frame.src = `https://${RPM_SUBDOMAIN}.readyplayer.me/avatar?${params}`;
  frame.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
    z-index: 9999;
  `;

  // Listen for avatar creation
  window.addEventListener('message', (event) => {
    if (event.data?.source !== 'readyplayerme') return;

    if (event.data.eventName === 'v1.avatar.exported') {
      const avatarUrl = event.data.data.url;

      // Add quality parameters
      const glbUrl = avatarUrl.includes('?')
        ? `${avatarUrl}&morphTargets=ARKit`
        : `${avatarUrl}?morphTargets=ARKit`;

      onComplete(glbUrl);
      document.body.removeChild(frame);
    }

    if (event.data.eventName === 'v1.frame.ready') {
      // Frame loaded successfully
      console.log('Ready Player Me loaded');
    }
  });

  document.body.appendChild(frame);
}

/**
 * Alternative: Create avatar from photo blob (API method)
 * Requires Ready Player Me API key for production
 */
export async function createAvatarFromPhoto(
  photoBlob: Blob,
  config?: AvatarConfig
): Promise<AvatarResult> {
  // This is a simplified version
  // For production, use Ready Player Me API with authentication

  const formData = new FormData();
  formData.append('photo', photoBlob);
  if (config?.bodyType) formData.append('bodyType', config.bodyType);
  if (config?.gender) formData.append('gender', config.gender);

  // Note: This endpoint requires API key in production
  const response = await fetch(`${RPM_API_URL}/avatars`, {
    method: 'POST',
    body: formData,
    // headers: { 'Authorization': `Bearer ${API_KEY}` }, // Add in production
  });

  if (!response.ok) {
    throw new Error(`Failed to create avatar: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    avatarUrl: `${data.url}?morphTargets=ARKit`, // Add morph targets for lip sync
    avatarId: data.id,
    thumbnailUrl: data.thumbnailUrl,
  };
}

/**
 * Load avatar from URL
 * Validates and returns the GLB URL with proper parameters
 */
export function getAvatarUrl(avatarId: string, options?: {
  quality?: 'low' | 'medium' | 'high';
  useHands?: boolean;
  morphTargets?: boolean;
}): string {
  const baseUrl = `https://models.readyplayer.me/${avatarId}.glb`;

  const params = new URLSearchParams();

  if (options?.morphTargets !== false) {
    params.append('morphTargets', 'ARKit'); // Essential for lip sync!
  }

  if (options?.quality) {
    params.append('quality', options.quality);
  }

  if (options?.useHands) {
    params.append('useHands', 'true');
  }

  return params.toString() ? `${baseUrl}?${params}` : baseUrl;
}

/**
 * Validate Ready Player Me avatar URL
 */
export function isValidAvatarUrl(url: string): boolean {
  return url.includes('readyplayer.me') && url.endsWith('.glb');
}

/**
 * Extract avatar ID from URL
 */
export function getAvatarIdFromUrl(url: string): string | null {
  const match = url.match(/\/([a-f0-9-]+)\.glb/i);
  return match ? match[1] : null;
}

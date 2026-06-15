/**
 * Web-only MediaPipe Face Mesh integration.
 *
 * Loads the library from CDN at runtime (no Metro bundling, no bundle size
 * impact). Returns normalised 0–1 landmark positions for the nine face zones
 * the skin-report screen uses. Falls back gracefully to null on any failure.
 */

import { Platform } from 'react-native';

// ─── Public types ──────────────────────────────────────────────────────────
export interface FaceZonePositions {
  forehead:        { x: number; y: number };
  left_cheek:      { x: number; y: number };
  right_cheek:     { x: number; y: number };
  nose:            { x: number; y: number };
  chin:            { x: number; y: number };
  left_under_eye:  { x: number; y: number };
  right_under_eye: { x: number; y: number };
  left_temple:     { x: number; y: number };
  right_temple:    { x: number; y: number };
}

// ─── MediaPipe landmark indices (468-point topology) ──────────────────────
// Verified against the canonical face mesh topology map.
const ZONE_LANDMARK_IDX: Record<keyof FaceZonePositions, number> = {
  forehead:        10,
  left_cheek:      234,
  right_cheek:     454,
  nose:            1,
  chin:            152,
  left_under_eye:  226,
  right_under_eye: 446,
  left_temple:     162,
  right_temple:    389,
};

// ─── CDN config ────────────────────────────────────────────────────────────
const CDN_VERSION = '0.4.1633559619';
const CDN_BASE    = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${CDN_VERSION}`;

// ─── Module-level singleton ────────────────────────────────────────────────
// Re-using one FaceMesh instance avoids re-initialising the WASM graph on
// every call. The first call is slow (WASM + model download from CDN);
// subsequent calls reuse the cached WASM and are fast.
let instance: any = null;
let initPromise: Promise<void> | null = null;

// ─── Helpers ───────────────────────────────────────────────────────────────
function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-fm="${src}"]`)) { resolve(); return; }
    const s     = document.createElement('script');
    s.src       = src;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-fm', src);
    s.onload  = () => resolve();
    s.onerror = () => reject(new Error(`CDN load failed: ${src}`));
    document.head.appendChild(s);
  });
}

function createImageElement(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img       = new Image();
    img.crossOrigin = 'anonymous';
    img.onload      = () => resolve(img);
    img.onerror     = () => reject(new Error('Image element load failed'));
    img.src         = uri;
  });
}

async function getOrCreateInstance(): Promise<any> {
  if (instance) return instance;

  // Ensure only one initialisation attempt even under concurrent calls.
  if (!initPromise) {
    initPromise = (async () => {
      await injectScript(`${CDN_BASE}/face_mesh.js`);

      const FaceMeshCtor = (window as any).FaceMesh;
      if (typeof FaceMeshCtor !== 'function') {
        throw new Error('window.FaceMesh not available after script load');
      }

      const fm = new FaceMeshCtor({
        locateFile: (file: string) => `${CDN_BASE}/${file}`,
      });

      fm.setOptions({
        maxNumFaces:            1,
        refineLandmarks:        false,   // faster; we only need coarse landmarks
        minDetectionConfidence: 0.5,
        minTrackingConfidence:  0.5,
      });

      instance = fm;
    })();
  }

  await initPromise;
  return instance;
}

// ─── Public API ────────────────────────────────────────────────────────────
/**
 * Run MediaPipe Face Mesh on `imageUri` and return the nine face-zone
 * landmark positions as normalised 0–1 fractions of the image dimensions.
 *
 * Returns null if:
 *  - Running on a non-web platform
 *  - The CDN scripts fail to load
 *  - No face is found in the image
 *  - Detection times out (30 s)
 */
export async function detectFaceZones(imageUri: string): Promise<FaceZonePositions | null> {
  if (Platform.OS !== 'web') return null;
  if (typeof document === 'undefined') return null;

  try {
    const fm  = await getOrCreateInstance();
    const img = await createImageElement(imageUri);

    return await new Promise<FaceZonePositions | null>((resolve) => {
      let settled = false;
      const settle = (v: FaceZonePositions | null) => {
        if (!settled) { settled = true; resolve(v); }
      };

      // Hard timeout — CDN WASM loading can be slow on first run.
      const timeout = setTimeout(() => {
        console.warn('[faceMesh] detection timed out — using fallback positions');
        settle(null);
      }, 30_000);

      fm.onResults((results: any) => {
        clearTimeout(timeout);
        const landmarks: any[] | undefined = results.multiFaceLandmarks?.[0];

        if (!landmarks || landmarks.length < 468) {
          console.warn('[faceMesh] no face detected — using fallback positions');
          settle(null);
          return;
        }

        const zones = {} as FaceZonePositions;
        for (const [zone, idx] of Object.entries(ZONE_LANDMARK_IDX) as [keyof FaceZonePositions, number][]) {
          const lm = landmarks[idx];
          zones[zone] = { x: lm.x, y: lm.y };
        }

        console.log('[faceMesh] landmarks detected for zones:', Object.keys(zones).join(', '));
        settle(zones);
      });

      fm.send({ image: img }).catch((err: Error) => {
        clearTimeout(timeout);
        console.warn('[faceMesh] send() error:', err?.message);
        settle(null);
      });
    });
  } catch (err: any) {
    console.warn('[faceMesh] detection failed:', err?.message ?? err);
    return null;
  }
}

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '../../src/store/assessmentStore';
import { runScan } from '../../src/scan/scanAdapter';

// Detection states that drive the UI and countdown logic
type DetectionState = 'no_face' | 'off_centre' | 'centred' | 'capturing' | 'analysing';

const STATUS_CONFIG: Record<
  DetectionState,
  { text: string; color: string; ovalColor: string }
> = {
  no_face:    { text: 'No face detected',    color: '#EF4444', ovalColor: '#EF4444' },
  off_centre: { text: 'Centre your face',    color: '#F59E0B', ovalColor: '#F59E0B' },
  centred:    { text: 'Perfect — hold still', color: '#22C55E', ovalColor: '#22C55E' },
  capturing:  { text: 'Capturing...',         color: '#22C55E', ovalColor: '#22C55E' },
  analysing:  { text: 'Analysing your skin...', color: '#FFFFFF', ovalColor: '#FFFFFF' },
};

// ------------------------------------------------------------------
// Face detection strategy
// The browser's Shape Detection API (window.FaceDetector) is available
// in Chrome behind a flag. On platforms where it's not available the
// detection falls back to a timed auto-progression so the full UX
// flow is testable. When expo-face-detector or VisionCamera is
// integrated for native builds, replace `detectFaceInFrame` below.
// ------------------------------------------------------------------
async function detectFaceInFrame(
  imageData: ImageData | null,
): Promise<'no_face' | 'off_centre' | 'centred'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const FaceDetectorAPI = (window as any).FaceDetector;
  if (!FaceDetectorAPI || !imageData) return 'no_face';

  try {
    const detector = new FaceDetectorAPI({ maxDetectedFaces: 1, fastMode: false });
    const bitmap = await createImageBitmap(imageData);
    const faces = await detector.detect(bitmap);
    bitmap.close();

    if (faces.length === 0) return 'no_face';

    const face = faces[0].boundingBox;
    const iw = imageData.width;
    const ih = imageData.height;

    // Centred = face box fills at least 30% of frame width and is
    // horizontally within the middle third of the frame
    const faceCentreX = face.x + face.width / 2;
    const horizontallyCentred =
      faceCentreX > iw * 0.33 && faceCentreX < iw * 0.67;
    const largEnough = face.width > iw * 0.30;

    return horizontallyCentred && largEnough ? 'centred' : 'off_centre';
  } catch {
    return 'no_face';
  }
}

export default function ScanCameraScreen() {
  const { setScanResults, applyScanOverrides, setCapturedImageUri } = useAssessmentStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [detection, setDetection] = useState<DetectionState>('no_face');
  const [countdown, setCountdown] = useState(5);

  const cameraRef = useRef<CameraView>(null);
  const captureInProgress = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ----------------------------------------------------------------
  // Permission gate
  // ----------------------------------------------------------------
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // ----------------------------------------------------------------
  // On web: grab a frame from the <video> element behind CameraView
  // and run face detection on it. Falls back to auto-progression when
  // FaceDetector API is unavailable.
  // ----------------------------------------------------------------
  const getFrameImageData = useCallback((): ImageData | null => {
    if (Platform.OS !== 'web') return null;
    const video = document.querySelector('video');
    if (!video || video.readyState < 2) return null;

    if (!frameCanvasRef.current) {
      frameCanvasRef.current = document.createElement('canvas');
    }
    const canvas = frameCanvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  // ----------------------------------------------------------------
  // Auto-progression fallback (used when FaceDetector API is absent)
  // Mimics the full UX flow: no_face → off_centre → centred → capture
  // ----------------------------------------------------------------
  const runSimulatedProgression = useCallback(() => {
    if (simulationRef.current) clearTimeout(simulationRef.current);

    setDetection('no_face');
    setCountdown(5);

    simulationRef.current = setTimeout(() => {
      setDetection('off_centre');
      simulationRef.current = setTimeout(() => {
        setDetection('centred');
      }, 1800);
    }, 2000);
  }, []);

  // ----------------------------------------------------------------
  // Detection polling loop (500ms interval)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!permission?.granted || captureInProgress.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasBrowserFaceDetector = !!(window as any).FaceDetector;

    if (!hasBrowserFaceDetector && Platform.OS === 'web') {
      // Start simulated progression once
      runSimulatedProgression();
      return;
    }

    const poll = setInterval(async () => {
      if (captureInProgress.current) return;
      const frame = getFrameImageData();
      const result = await detectFaceInFrame(frame);
      setDetection(prev => {
        // Don't override a terminal state
        if (prev === 'capturing' || prev === 'analysing') return prev;
        return result;
      });
    }, 500);

    return () => clearInterval(poll);
  }, [permission?.granted, getFrameImageData, runSimulatedProgression]);

  // ----------------------------------------------------------------
  // Countdown: starts when centred, resets if face leaves position
  // ----------------------------------------------------------------
  useEffect(() => {
    if (detection === 'centred' && !captureInProgress.current) {
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            triggerCapture();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (detection !== 'centred' && countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
      setCountdown(5);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [detection]);

  // ----------------------------------------------------------------
  // Capture + scan pipeline
  // ----------------------------------------------------------------
  const triggerCapture = useCallback(async () => {
    if (captureInProgress.current) return;
    captureInProgress.current = true;
    setDetection('capturing');

    // Brief flash pause so the user sees "Capturing..."
    await new Promise(r => setTimeout(r, 400));
    setDetection('analysing');

    // Capture the frame. URI is stored transiently for the analysis screen;
    // it is never persisted. A real scan provider receives it here too.
    const imageUri = await cameraRef.current
      ?.takePictureAsync({ quality: 0.6, skipProcessing: true })
      .then(p => p?.uri ?? '')
      .catch(() => '');

    setCapturedImageUri(imageUri ?? null);

    const results = await runScan({ imageUri: imageUri ?? '' });

    setScanResults({
      oiliness: results.oiliness,
      acne: results.acne,
      pigmentation: results.pigmentation,
      tan: results.tan,
      texture: results.texture,
    });

    applyScanOverrides();
    router.replace('/assessment/skin-analysis' as any);
  }, [setScanResults, applyScanOverrides]);

  // ----------------------------------------------------------------
  // Cleanup on unmount
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (simulationRef.current) clearTimeout(simulationRef.current);
    };
  }, []);

  // ----------------------------------------------------------------
  // Permission screens
  // ----------------------------------------------------------------
  if (!permission) {
    return <View style={styles.permissionContainer} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is needed to analyse your skin.
        </Text>
        {permission.canAskAgain && (
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Allow camera</Text>
          </TouchableOpacity>
        )}
        {!permission.canAskAgain && (
          <Text style={styles.permissionHint}>
            Please enable camera access in your browser or device settings.
          </Text>
        )}
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------------------
  // Analysing overlay (full screen, no camera needed)
  // ----------------------------------------------------------------
  if (detection === 'analysing') {
    return (
      <View style={styles.analysingContainer}>
        <Text style={styles.analysingText}>Analysing your skin...</Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[detection];

  // ----------------------------------------------------------------
  // Main camera view
  // ----------------------------------------------------------------
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
      />

      {/* Dark vignette overlay to frame the oval */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* Instruction text */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="none">
        <Text style={styles.instruction}>
          Position your face in the oval in good lighting
        </Text>
      </SafeAreaView>

      {/* Oval face guide */}
      <View style={styles.ovalWrapper} pointerEvents="none">
        <View style={[styles.oval, { borderColor: statusCfg.ovalColor }]} />

        {/* Countdown badge inside oval */}
        {detection === 'centred' && countdown > 0 && (
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>

      {/* Status message below oval */}
      <View style={styles.statusWrapper} pointerEvents="none">
        <Text style={[styles.statusText, { color: statusCfg.color }]}>
          {statusCfg.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 32,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ovalWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oval: {
    width: 230,
    height: 300,
    borderRadius: 115,
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  countdownBadge: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  statusWrapper: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Permission screens
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    padding: 32,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permissionButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  permissionHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Analysing screen
  analysingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  analysingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});

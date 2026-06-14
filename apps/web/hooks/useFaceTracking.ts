'use client';

import { useEffect, useRef, useState } from 'react';

type Emotion = '😊' | '😮' | '😱' | '🤔' | '😐';

export function useFaceTracking(videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean): Emotion {
  const [emotion, setEmotion] = useState<Emotion>('😐');
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    let detector: any = null;
    let running = true;

    async function init() {
      try {
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        detector = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        });
        detect();
      } catch {
        // Fallback: no face tracking
      }
    }

    function detect() {
      if (!running || !videoRef.current || !detector) return;
      try {
        const results = detector.detectForVideo(videoRef.current, Date.now());
        if (results?.faceBlendshapes?.[0]) {
          const shapes = results.faceBlendshapes[0].categories;
          const get = (name: string) => shapes.find((c: any) => c.categoryName === name)?.score ?? 0;

          const smiling = get('mouthSmileLeft') + get('mouthSmileRight') > 0.5;
          const mouthOpen = get('jawOpen') > 0.4;
          const eyebrowRaise = get('browInnerUp') > 0.3;

          if (eyebrowRaise && mouthOpen) setEmotion('😱');
          else if (smiling) setEmotion('😊');
          else if (mouthOpen) setEmotion('😮');
          else if (eyebrowRaise) setEmotion('🤔');
          else setEmotion('😐');
        }
      } catch {}
      animFrameRef.current = requestAnimationFrame(detect);
    }

    init();
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
      detector?.close?.();
    };
  }, [enabled, videoRef]);

  return emotion;
}

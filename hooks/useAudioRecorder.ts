'use client';

import { useState, useCallback, useRef } from 'react';

interface AudioRecorderState {
  isRecording: boolean;
  duration: number;
  error: string | null;
}

export function useAudioRecorder(maxDuration = 30) {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    duration: 0,
    error: null,
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.start();
      setState({ isRecording: true, duration: 0, error: null });

      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.duration >= maxDuration) {
            stopRecording();
            return prev;
          }
          return { ...prev, duration: prev.duration + 1 };
        });
      }, 1000);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: 'Microphone access denied',
      }));
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && state.isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      clearInterval(timerRef.current);

      return new Promise<Blob>((resolve) => {
        mediaRecorder.current!.onstop = () => {
          const blob = new Blob(chunks.current, { type: 'audio/webm' });
          setState({ isRecording: false, duration: 0, error: null });
          resolve(blob);
        };
      });
    }
    return Promise.resolve(new Blob());
  }, [state.isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorder.current && state.isRecording) {
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      clearInterval(timerRef.current);
      setState({ isRecording: false, duration: 0, error: null });
      chunks.current = [];
    }
  }, [state.isRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
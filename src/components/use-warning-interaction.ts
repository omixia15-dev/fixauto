"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Envelope attacks measured from the supplied recording; see output/audio/ignition-cues.json.
const CUE_TIMES_SECONDS = [2.7, 3.91, 5.11, 6.31, 7.5] as const;
const CLIP_DURATION_SECONDS = 10;
const AUDIO_URL = "/audio/ignition-first-10s.wav";
const RETURN_CHAPTER_SELECTOR = '[data-scene="return"]';

function clampElapsed(seconds: number): number {
  return Math.max(0, Math.min(CLIP_DURATION_SECONDS, seconds));
}

export function useWarningInteraction(scene: string): {
  revealedCount: number;
  soundEnabled: boolean;
  soundAvailable: boolean;
  quietEnding: boolean;
  toggleSound: () => Promise<void>;
} {
  const [revealedCount, setRevealedCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundAvailable, setSoundAvailable] = useState(true);
  const [quietEnding, setQuietEnding] = useState(false);
  const [sequenceRunning, setSequenceRunning] = useState(false);

  const sceneRef = useRef(scene);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const runningRef = useRef(false);
  const mediaClockRef = useRef(false);
  const silentStartedAtRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const revealedRef = useRef(0);
  const soundEnabledRef = useRef(false);
  const soundAvailableRef = useRef(true);
  const inactiveRef = useRef(false);
  const resumeMediaRef = useRef(false);
  const returnBoundaryRef = useRef(false);

  const setRunning = useCallback((running: boolean) => {
    runningRef.current = running;
    setSequenceRunning(running);
  }, []);

  const setSound = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled;
    setSoundEnabled(enabled);
  }, []);

  const setAvailable = useCallback((available: boolean) => {
    soundAvailableRef.current = available;
    setSoundAvailable(available);
  }, []);

  const revealAt = useCallback((seconds: number) => {
    const count = CUE_TIMES_SECONDS.filter((cue) => seconds >= cue).length;
    if (count !== revealedRef.current) {
      revealedRef.current = count;
      setRevealedCount(count);
    }
  }, []);

  const readElapsed = useCallback(() => {
    if (!startedRef.current) return elapsedRef.current;
    if (mediaClockRef.current && audioRef.current) {
      return clampElapsed(audioRef.current.currentTime);
    }
    if (silentStartedAtRef.current !== null) {
      return clampElapsed(
        elapsedRef.current + (performance.now() - silentStartedAtRef.current) / 1000,
      );
    }
    return elapsedRef.current;
  }, []);

  const beginSilent = useCallback(
    (seconds = 0) => {
      startedRef.current = true;
      elapsedRef.current = clampElapsed(seconds);
      mediaClockRef.current = false;
      silentStartedAtRef.current = inactiveRef.current ? null : performance.now();
      setRunning(!inactiveRef.current && elapsedRef.current < CLIP_DURATION_SECONDS);
    },
    [setRunning],
  );

  const returnChapterEntered = useCallback(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return false;
    if (sceneRef.current === "return") return true;
    const chapter = document.querySelector<HTMLElement>(RETURN_CHAPTER_SELECTOR);
    return chapter !== null && chapter.getBoundingClientRect().top < window.innerHeight;
  }, []);

  const stopAtReturnChapter = useCallback(() => {
    if (returnBoundaryRef.current || !returnChapterEntered()) return;
    returnBoundaryRef.current = true;
    setQuietEnding(true);

    const elapsed = readElapsed();
    revealAt(elapsed);
    elapsedRef.current = elapsed;
    silentStartedAtRef.current = null;
    mediaClockRef.current = false;
    setSound(false);

    const audio = audioRef.current;
    if (audio) {
      audio.muted = true;
      audio.pause();
    }

    if (startedRef.current && elapsed < CLIP_DURATION_SECONDS && !inactiveRef.current) {
      silentStartedAtRef.current = performance.now();
      setRunning(true);
    } else {
      setRunning(false);
    }
  }, [readElapsed, revealAt, returnChapterEntered, setRunning, setSound]);

  const startVisualSequence = useCallback(() => {
    if (startedRef.current || inactiveRef.current || document.visibilityState === "hidden") return;
    beginSilent(0);
  }, [beginSilent]);

  const releaseAudio = useCallback((audio: HTMLAudioElement) => {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    if (audioRef.current === audio) audioRef.current = null;
  }, []);

  const fallBackToSilent = useCallback(
    (audio: HTMLAudioElement) => {
      if (audioRef.current !== audio || !mediaClockRef.current) return;
      const elapsed = clampElapsed(audio.currentTime);
      releaseAudio(audio);
      elapsedRef.current = elapsed;
      mediaClockRef.current = false;
      revealAt(elapsed);
      setSound(false);
      setAvailable(false);
      silentStartedAtRef.current =
        !inactiveRef.current && elapsed < CLIP_DURATION_SECONDS ? performance.now() : null;
      setRunning(silentStartedAtRef.current !== null);
    },
    [releaseAudio, revealAt, setAvailable, setRunning, setSound],
  );

  const pauseForInactivity = useCallback(() => {
    if (inactiveRef.current) return;
    inactiveRef.current = true;
    const audio = audioRef.current;
    resumeMediaRef.current =
      mediaClockRef.current && audio !== null && !audio.paused && readElapsed() < CLIP_DURATION_SECONDS;
    const elapsed = readElapsed();
    revealAt(elapsed);
    elapsedRef.current = elapsed;
    silentStartedAtRef.current = null;
    mediaClockRef.current = false;
    if (audio && !audio.paused) audio.pause();
    setRunning(false);
  }, [readElapsed, revealAt, setRunning]);

  const resumeAfterInactivity = useCallback(() => {
    if (
      !inactiveRef.current ||
      document.visibilityState === "hidden" ||
      !document.hasFocus()
    ) {
      return;
    }

    inactiveRef.current = false;
    const elapsed = elapsedRef.current;
    if (!startedRef.current || elapsed >= CLIP_DURATION_SECONDS) return;

    const audio = audioRef.current;
    if (
      resumeMediaRef.current &&
      soundEnabledRef.current &&
      !returnBoundaryRef.current &&
      audio
    ) {
      mediaClockRef.current = true;
      audio.muted = false;
      setRunning(true);
      void audio.play().catch(() => fallBackToSilent(audio));
    } else {
      if (soundEnabledRef.current) setSound(false);
      if (audio) audio.muted = true;
      beginSilent(elapsed);
    }
    resumeMediaRef.current = false;
  }, [beginSilent, fallBackToSilent, setRunning, setSound]);

  useEffect(() => {
    if (!sequenceRunning) return;

    let frameId = 0;
    const tick = () => {
      if (!runningRef.current) return;

      let seconds = elapsedRef.current;
      if (mediaClockRef.current && audioRef.current) {
        seconds = clampElapsed(audioRef.current.currentTime);
      } else if (silentStartedAtRef.current !== null) {
        seconds = clampElapsed(
          elapsedRef.current + (performance.now() - silentStartedAtRef.current) / 1000,
        );
      }

      revealAt(seconds);
      if (seconds >= CLIP_DURATION_SECONDS) {
        elapsedRef.current = CLIP_DURATION_SECONDS;
        silentStartedAtRef.current = null;
        mediaClockRef.current = false;
        setRunning(false);
        return;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [revealAt, sequenceRunning, setRunning]);

  useEffect(() => {
    const startOnPointerMove = () => startVisualSequence();
    const startOnTouchDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") startVisualSequence();
    };
    const handleScroll = () => stopAtReturnChapter();
    const handleBlur = () => pauseForInactivity();
    const handleFocus = () => resumeAfterInactivity();
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") pauseForInactivity();
      else resumeAfterInactivity();
    };

    window.addEventListener("pointermove", startOnPointerMove, { passive: true });
    window.addEventListener("pointerdown", startOnTouchDown, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    stopAtReturnChapter();

    return () => {
      window.removeEventListener("pointermove", startOnPointerMove);
      window.removeEventListener("pointerdown", startOnTouchDown);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [
    pauseForInactivity,
    resumeAfterInactivity,
    startVisualSequence,
    stopAtReturnChapter,
  ]);

  useEffect(() => {
    sceneRef.current = scene;
    stopAtReturnChapter();
  }, [scene, stopAtReturnChapter]);

  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (audio) releaseAudio(audio);
    },
    [releaseAudio],
  );

  const toggleSound = async () => {
    stopAtReturnChapter();
    if (!soundAvailableRef.current || returnBoundaryRef.current) return;

    if (soundEnabledRef.current) {
      setSound(false);
      const audio = audioRef.current;
      if (audio && mediaClockRef.current && !audio.paused) audio.muted = true;
      return;
    }

    const currentAudio = audioRef.current;
    if (
      currentAudio &&
      mediaClockRef.current &&
      !currentAudio.paused &&
      currentAudio.currentTime < CLIP_DURATION_SECONDS &&
      !inactiveRef.current
    ) {
      currentAudio.muted = false;
      setSound(true);
      return;
    }

    const oldAudio = audioRef.current;
    if (oldAudio) releaseAudio(oldAudio);
    revealedRef.current = 0;
    setRevealedCount(0);
    startedRef.current = true;
    elapsedRef.current = 0;
    silentStartedAtRef.current = null;
    mediaClockRef.current = false;

    if (typeof Audio !== "function") {
      setAvailable(false);
      setSound(false);
      beginSilent(0);
      return;
    }

    const audio = new Audio(AUDIO_URL);
    audio.preload = "auto";
    audio.currentTime = 0;
    audioRef.current = audio;
    mediaClockRef.current = true;
    setSound(true);
    audio.onended = () => {
      if (audioRef.current !== audio) return;
      elapsedRef.current = CLIP_DURATION_SECONDS;
      silentStartedAtRef.current = null;
      mediaClockRef.current = false;
      revealAt(CLIP_DURATION_SECONDS);
      setRunning(false);
    };
    audio.onerror = () => fallBackToSilent(audio);
    setRunning(!inactiveRef.current);

    try {
      await audio.play();
      if (returnBoundaryRef.current || audioRef.current !== audio) {
        audio.muted = true;
        audio.pause();
      }
    } catch {
      fallBackToSilent(audio);
    }
  };

  return { revealedCount, soundEnabled, soundAvailable, quietEnding, toggleSound };
}

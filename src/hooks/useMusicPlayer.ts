"use client";

import { useEffect, useReducer } from "react";
import { musicPlayer } from "@/lib/audio/musicPlayer";

export function useMusicPlayer() {
  const [, forceUpdate] = useReducer((c: number) => c + 1, 0);

  useEffect(() => musicPlayer.subscribe(forceUpdate), []);

  return {
    trackId: musicPlayer.trackId,
    isPlaying: musicPlayer.isPlaying,
    volume: musicPlayer.volume,
    error: musicPlayer.error,
    setTrack: musicPlayer.setTrack.bind(musicPlayer),
    play: musicPlayer.play.bind(musicPlayer),
    pause: musicPlayer.pause.bind(musicPlayer),
    toggle: musicPlayer.toggle.bind(musicPlayer),
    setVolume: musicPlayer.setVolume.bind(musicPlayer),
    retry: musicPlayer.retry.bind(musicPlayer),
    stop: musicPlayer.stop.bind(musicPlayer),
  };
}

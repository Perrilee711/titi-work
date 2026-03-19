import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  audioFile: string;
  coverColor: string;
  duration: number;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  playlist: Track[];
  play: (track: Track) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  addToPlaylist: (track: Track) => void;
  clearPlaylist: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [howlReady, setHowlReady] = useState(false);
  const howlRef = useRef<any>(null);
  const playlistRef = useRef<Track[]>([]);

  // Keep playlist ref in sync
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  // Emit state change events for TrackCard sync
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('audio-state-change', {
      detail: { track: currentTrack, isPlaying }
    }));
  }, [currentTrack, isPlaying]);

  const play = useCallback((track: Track) => {
    console.log('Playing track:', track);

    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }

    const Howl = (window as any).Howl;
    if (!Howl) {
      console.error('Howler not loaded yet');
      return;
    }

    // Ensure track is in playlist
    setPlaylist(prev => {
      if (!prev.find(t => t.id === track.id)) {
        return [...prev, track];
      }
      return prev;
    });

    try {
      const sound = new Howl({
        src: [track.audioFile],
        html5: true,
        volume: volume,
        preload: true,
        onplay: () => {
          console.log('Playback started');
          setIsPlaying(true);
          requestAnimationFrame(updateProgress);
        },
        onpause: () => {
          console.log('Playback paused');
          setIsPlaying(false);
        },
        onend: () => {
          console.log('Playback ended');
          const currentPlaylist = playlistRef.current;
          const idx = currentPlaylist.findIndex(t => t.id === track.id);
          if (idx < currentPlaylist.length - 1) {
            play(currentPlaylist[idx + 1]);
          } else {
            setIsPlaying(false);
            setProgress(0);
          }
        },
        onloaderror: (id: number, error: any) => {
          console.error('Failed to load audio:', error);
        },
        onplayerror: (id: number, error: any) => {
          console.error('Failed to play audio:', error);
        },
      });

      howlRef.current = sound;
      setCurrentTrack(track);

      // Start playing
      sound.play();
    } catch (err) {
      console.error('Error creating Howl:', err);
    }
  }, [volume]);

  const updateProgress = useCallback(() => {
    if (howlRef.current && isPlaying) {
      const seek = howlRef.current.seek() || 0;
      setProgress(seek);
      requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  const toggle = useCallback(() => {
    if (!howlRef.current) {
      console.log('No audio loaded');
      return;
    }
    if (isPlaying) {
      howlRef.current.pause();
    } else {
      howlRef.current.play();
    }
  }, [isPlaying]);

  const next = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    if (idx < playlist.length - 1) {
      play(playlist[idx + 1]);
    }
  }, [currentTrack, playlist, play]);

  const prev = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    if (progress > 3) {
      howlRef.current?.seek(0);
      setProgress(0);
    } else {
      const idx = playlist.findIndex(t => t.id === currentTrack.id);
      if (idx > 0) {
        play(playlist[idx - 1]);
      }
    }
  }, [currentTrack, playlist, progress, play]);

  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (howlRef.current) {
      howlRef.current.volume(v);
    }
  }, []);

  const addToPlaylist = useCallback((track: Track) => {
    setPlaylist(prev => {
      if (prev.find(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
  }, []);

  // Load Howler.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js';
    script.onload = () => {
      console.log('Howler.js loaded successfully');
      setHowlReady(true);
    };
    script.onerror = () => {
      console.error('Failed to load Howler.js');
    };
    document.head.appendChild(script);

    const handlePlayTrack = (e: Event) => {
      const track = (e as CustomEvent<Track>).detail;
      console.log('Received play-track event:', track);
      play(track);
    };

    window.addEventListener('play-track', handlePlayTrack);

    return () => {
      window.removeEventListener('play-track', handlePlayTrack);
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, [play]);

  return (
    <AudioContext.Provider value={{
      currentTrack, isPlaying, progress, volume, playlist,
      play, toggle, next, prev, seek, setVolume, addToPlaylist, clearPlaylist
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    // SSR fallback — return noop
    return {
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      volume: 0.8,
      playlist: [],
      play: () => {},
      toggle: () => {},
      next: () => {},
      prev: () => {},
      seek: () => {},
      setVolume: () => {},
      addToPlaylist: () => {},
      clearPlaylist: () => {},
    };
  }
  return ctx;
}

import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';

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
  const howlRef = useRef<any>(null);

  const play = (track: Track) => {
    if (howlRef.current) {
      howlRef.current.unload();
    }

    const Howl = (window as any).Howl;
    if (!Howl) return;

    const sound = new Howl({
      src: [track.audioFile],
      html5: true,
      volume: volume,
      onplay: () => {
        setIsPlaying(true);
        requestAnimationFrame(updateProgress);
      },
      onpause: () => setIsPlaying(false),
      onend: () => {
        const idx = playlist.findIndex(t => t.id === track.id);
        if (idx < playlist.length - 1) {
          play(playlist[idx + 1]);
        } else {
          setIsPlaying(false);
          setProgress(0);
        }
      },
      onload: () => {
        sound.play();
      },
    });

    howlRef.current = sound;
    setCurrentTrack(track);
  };

  const updateProgress = () => {
    if (howlRef.current && isPlaying) {
      const seek = howlRef.current.seek() || 0;
      setProgress(seek);
      requestAnimationFrame(updateProgress);
    }
  };

  const toggle = () => {
    if (!howlRef.current) return;
    if (isPlaying) {
      howlRef.current.pause();
    } else {
      howlRef.current.play();
    }
  };

  const next = () => {
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    if (idx < playlist.length - 1) {
      play(playlist[idx + 1]);
    }
  };

  const prev = () => {
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
  };

  const seek = (time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setProgress(time);
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (howlRef.current) {
      howlRef.current.volume(v);
    }
  };

  const addToPlaylist = (track: Track) => {
    setPlaylist(prev => {
      if (prev.find(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js';
    script.onload = () => console.log('Howler.js loaded');
    document.head.appendChild(script);

    const handlePlayTrack = (e: Event) => {
      const track = (e as CustomEvent<Track>).detail;
      play(track);
      addToPlaylist(track);
    };

    window.addEventListener('play-track', handlePlayTrack);

    return () => {
      window.removeEventListener('play-track', handlePlayTrack);
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, []);

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

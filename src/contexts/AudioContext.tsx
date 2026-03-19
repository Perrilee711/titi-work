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

  // Use refs to avoid stale closures
  const howlRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const playlistRef = useRef<Track[]>([]);
  const currentTrackRef = useRef<Track | null>(null);
  const volumeRef = useRef(0.8);

  // Keep refs in sync
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Emit state change events for TrackCard sync
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('audio-state-change', {
      detail: { track: currentTrack, isPlaying }
    }));
  }, [currentTrack, isPlaying]);

  const updateProgress = () => {
    if (howlRef.current && isPlayingRef.current) {
      const seek = howlRef.current.seek() || 0;
      setProgress(seek);
      requestAnimationFrame(updateProgress);
    }
  };

  const play = (track: Track) => {
    console.log('Playing:', track.audioFile);

    // Stop existing playback
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }

    const Howl = (window as any).Howl;
    if (!Howl) {
      console.error('Howler not loaded');
      return;
    }

    // Add to playlist
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
        volume: volumeRef.current,
        preload: true,
        onplay: () => {
          console.log('Started playing');
          setIsPlaying(true);
          isPlayingRef.current = true;
          requestAnimationFrame(updateProgress);
        },
        onpause: () => {
          console.log('Paused');
          setIsPlaying(false);
          isPlayingRef.current = false;
        },
        onend: () => {
          console.log('Ended');
          const currentPlaylist = playlistRef.current;
          const idx = currentPlaylist.findIndex(t => t.id === track.id);
          if (idx < currentPlaylist.length - 1) {
            play(currentPlaylist[idx + 1]);
          } else {
            setIsPlaying(false);
            isPlayingRef.current = false;
            setProgress(0);
          }
        },
        onloaderror: (_id: number, error: any) => {
          console.error('Load error:', error);
        },
        onplayerror: (_id: number, error: any) => {
          console.error('Play error:', error);
        },
      });

      howlRef.current = sound;
      setCurrentTrack(track);
      currentTrackRef.current = track;
      sound.play();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const toggle = () => {
    if (!howlRef.current) return;
    if (isPlayingRef.current) {
      howlRef.current.pause();
    } else {
      howlRef.current.play();
    }
  };

  const next = () => {
    const track = currentTrackRef.current;
    if (!track || playlistRef.current.length === 0) return;
    const idx = playlistRef.current.findIndex(t => t.id === track.id);
    if (idx < playlistRef.current.length - 1) {
      play(playlistRef.current[idx + 1]);
    }
  };

  const prev = () => {
    const track = currentTrackRef.current;
    if (!track || playlistRef.current.length === 0) return;
    if (progress > 3) {
      howlRef.current?.seek(0);
      setProgress(0);
    } else {
      const idx = playlistRef.current.findIndex(t => t.id === track.id);
      if (idx > 0) {
        play(playlistRef.current[idx - 1]);
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
    volumeRef.current = v;
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

  // Load Howler.js and set up event listener
  useEffect(() => {
    // Check if already loaded
    if ((window as any).Howl) {
      console.log('Howler already loaded');
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js';
      script.onload = () => console.log('Howler loaded');
      script.onerror = () => console.error('Howler load failed');
      document.head.appendChild(script);
    }

    // Listen for play-track events
    const handlePlayTrack = (e: Event) => {
      const track = (e as CustomEvent<Detail>).detail;
      console.log('Got play event:', track);
      play(track);
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

interface Detail {
  id: string;
  title: string;
  audioFile: string;
  coverColor: string;
  duration: number;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
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

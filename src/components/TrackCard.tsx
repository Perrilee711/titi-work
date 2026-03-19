import { useState, useEffect } from 'react';
import { Play, Clock } from 'lucide-react';

interface TrackCardProps {
  id: string;
  title: string;
  coverColor: string;
  duration: number;
  featured?: boolean;
  audioFile: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Vinyl record component for TrackCard
function VinylIcon({ isPlaying, isCurrent }: { isPlaying: boolean; isCurrent: boolean }) {
  return (
    <div
      className={`relative ${isPlaying && isCurrent ? 'animate-spin' : ''}`}
      style={{ animationDuration: isPlaying ? '2s' : '0s' }}
    >
      {/* Vinyl base */}
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-black" />
      {/* Grooves */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'repeating-radial-gradient(circle at center, transparent 0px, transparent 2px, rgba(255,255,255,0.05) 3px, transparent 4px)',
        }}
      />
      {/* Label */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full"
        style={{
          background: isCurrent
            ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
            : 'linear-gradient(135deg, #3b3b3b 0%, #1a1a1a 100%)',
        }}
      />
      {/* Center hole */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black" />
    </div>
  );
}

export default function TrackCard({ id, title, coverColor, duration, featured, audioFile }: TrackCardProps) {
  const [isCurrent, setIsCurrent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handlePlayTrack = (e: Event) => {
      const track = (e as CustomEvent<any>).detail;
      setIsCurrent(track.id === id);
    };

    window.addEventListener('play-track', handlePlayTrack);

    return () => {
      window.removeEventListener('play-track', handlePlayTrack);
    };
  }, [id]);

  // Listen for custom events to sync playing state
  useEffect(() => {
    const handleTrackChange = (e: Event) => {
      const data = (e as CustomEvent<any>).detail;
      setIsCurrent(data.track?.id === id);
      setIsPlaying(data.isPlaying && data.track?.id === id);
    };

    window.addEventListener('audio-state-change', handleTrackChange);
    return () => window.removeEventListener('audio-state-change', handleTrackChange);
  }, [id]);

  const handlePlay = () => {
    const track = { id, title, audioFile, coverColor, duration };
    window.dispatchEvent(new CustomEvent('play-track', { detail: track }));
  };

  return (
    <button
      onClick={handlePlay}
      aria-label={`Play ${title}`}
      className={`group w-full text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative ${
        isCurrent ? 'ring-2 ring-purple-500/50' : ''
      } ${featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
    >
      {/* Active indicator glow */}
      {isCurrent && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none z-10 animate-pulse" />
      )}

      {/* Cover with gradient */}
      <div
        className="aspect-square relative flex items-center justify-center overflow-hidden"
        style={{
          background: coverColor
            ? `linear-gradient(135deg, ${coverColor} 0%, ${adjustColor(coverColor, -40)} 100%)`
            : 'linear-gradient(135deg, #1a1a24 0%, #12121a 100%)'
        }}
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            background: isCurrent
              ? 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.5), transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.25), transparent 70%)'
          }}
        />

        {/* Vinyl record icon - always visible */}
        <div className={`transition-all duration-500 ${
          isCurrent || (group as any)?.matches?.(':hover')
            ? 'scale-110 translate-x-2'
            : 'scale-100'
        }`}>
          <VinylIcon isPlaying={isPlaying} isCurrent={isCurrent} />
        </div>

        {/* Play overlay on hover */}
        <div
          className={`absolute inset-0 transition-all duration-300 flex items-center justify-center ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            {isPlaying && isCurrent ? (
              <div className="playing-bar">
                <span></span><span></span><span></span><span></span>
              </div>
            ) : (
              <Play className="text-white fill-white ml-1" size={28} />
            )}
          </div>
        </div>

        {/* Playing indicator */}
        {isCurrent && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="playing-bar">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
        )}

        {/* Featured badge */}
        {featured && !isCurrent && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] uppercase tracking-widest text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 relative" style={{ background: 'linear-gradient(180deg, #1a1a20 0%, #151518 100%)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`font-medium text-sm truncate transition-colors ${
              isCurrent ? 'text-purple-400' : 'text-white'
            }`}>
              {title}
            </p>
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <Clock size={10} />
              {formatTime(duration)}
            </p>
          </div>
          {isCurrent && (
            <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full animate-pulse">
              Playing
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// Helper function to adjust color brightness
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

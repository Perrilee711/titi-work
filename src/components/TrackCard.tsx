import { Play, Pause, Clock, Disc } from 'lucide-react';

interface TrackCardProps {
  id: string;
  title: string;
  coverColor: string;
  duration: number;
  featured?: boolean;
  isPlaying?: boolean;
  isCurrent?: boolean;
  onPlay: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrackCard({ id, title, coverColor, duration, featured, isPlaying, isCurrent, onPlay }: TrackCardProps) {
  return (
    <button
      onClick={onPlay}
      aria-label={`Play ${title}`}
      className={`group w-full text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        isCurrent ? 'ring-2 ring-indigo-500/50' : ''
      } ${featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
    >
      {/* Cover with gradient */}
      <div
        className="aspect-square relative flex items-center justify-center overflow-hidden"
        style={{
          background: coverColor
            ? `linear-gradient(135deg, ${coverColor} 0%, ${adjustColor(coverColor, -40)} 100%)`
            : 'linear-gradient(135deg, #1e1e2e 0%, #16161f 100%)'
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
             style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3), transparent 70%)' }} />

        {/* Hover play button */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
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

        {/* Music icon */}
        <Disc className={`w-14 h-14 text-white/15 absolute ${isPlaying && isCurrent ? 'animate-spin' : ''}`}
              style={{ animationDuration: isPlaying ? '3s' : '0s' }} />

        {/* Playing indicator */}
        {isPlaying && isCurrent && (
          <div className="absolute bottom-4 right-4">
            <div className="playing-bar">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4" style={{ background: 'linear-gradient(180deg, #1a1a20 0%, #151518 100%)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">{title}</p>
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <Clock size={10} />
              {formatTime(duration)}
            </p>
          </div>
          {featured && (
            <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">
              Featured
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

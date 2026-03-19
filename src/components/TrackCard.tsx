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
      className={`group w-full text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 ${
        isCurrent ? 'ring-2 ring-offset-2 ring-offset-black' : ''
      } ${featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
      style={isCurrent ? { '--tw-ring-color': coverColor || '#d4789a' } as any : {}}
    >
      {/* Cover */}
      <div
        className="aspect-square relative flex items-center justify-center overflow-hidden"
        style={{
          background: coverColor
            ? `linear-gradient(135deg, ${coverColor} 0%, ${adjustColor(coverColor, -30)} 100%)`
            : 'linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)'
        }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
        </div>

        {/* Hover overlay with play button */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
            {isPlaying && isCurrent ? (
              <Pause className="text-white fill-white" size={28} />
            ) : (
              <Play className="text-white fill-white ml-1" size={28} />
            )}
          </div>
        </div>

        {/* Center icon */}
        <Disc className={`w-12 h-12 text-white/20 ${isPlaying && isCurrent ? 'animate-spin' : ''}`} style={{ animationDuration: isPlaying ? '4s' : '0s' }} />

        {/* Playing indicator */}
        {isPlaying && isCurrent && (
          <div className="absolute bottom-3 right-3 flex gap-0.5">
            <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-gradient-to-b from-[#1a1a1f] to-[#111]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">{title}</p>
            <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
              <Clock size={10} />
              {formatTime(duration)}
            </p>
          </div>
          {featured && (
            <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-white/40 border border-white/20 px-1.5 py-0.5 rounded">
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

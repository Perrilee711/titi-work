import { Heart, Music, Sparkles, Rocket, Star } from 'lucide-react';

const iconMap: Record<string, any> = {
  heart: Heart,
  music: Music,
  sparkles: Sparkles,
  rocket: Rocket,
  star: Star,
};

// Accent colors for different icons
const iconColors: Record<string, { bg: string; text: string }> = {
  heart: { bg: 'linear-gradient(135deg, #d4789a 0%, #e8a0b8 100%)', text: '#fff' },
  music: { bg: 'linear-gradient(135deg, #9b8ac4 0%, #b8a8d4 100%)', text: '#fff' },
  sparkles: { bg: 'linear-gradient(135deg, #8b9a6b 0%, #a8b088 100%)', text: '#fff' },
  rocket: { bg: 'linear-gradient(135deg, #4a9ac4 0%, #6bb0e0 100%)', text: '#fff' },
  star: { bg: 'linear-gradient(135deg, #c4a94a 0%, #e0c86b 100%)', text: '#fff' },
};

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  icon: string;
  linkedTrack?: string;
  onPlayTrack?: (id: string) => void;
  activeTrackId?: string | null;
}

export default function Timeline({ events, onPlayTrack, activeTrackId }: {
  events: TimelineEvent[];
  onPlayTrack?: (id: string) => void;
  activeTrackId?: string | null;
}) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="relative">
      {/* Vertical line with gradient */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

      <div className="space-y-10">
        {sorted.map((event, idx) => {
          const Icon = iconMap[event.icon] || Star;
          const isActive = activeTrackId && event.linkedTrack === activeTrackId;
          const colors = iconColors[event.icon] || iconColors.star;

          return (
            <div key={event.id} className="relative flex gap-6 group">
              {/* Icon with gradient background */}
              <div
                className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  isActive ? 'scale-110 shadow-xl shadow-purple-500/30' : 'group-hover:scale-105'
                }`}
                style={{
                  background: colors.bg,
                  boxShadow: isActive ? '0 0 30px rgba(212, 120, 154, 0.4)' : '0 4px 15px rgba(0,0,0,0.3)',
                }}
              >
                <Icon size={20} color={colors.text} />
                {/* Subtle glow effect when active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl animate-pulse bg-white/20" />
                )}
              </div>

              {/* Content */}
              <div className="pt-3 pb-4 flex-1">
                <div className="text-white/40 text-xs font-mono mb-2 flex items-center gap-2">
                  <span>{event.date}</span>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px]">
                      Now Playing
                    </span>
                  )}
                </div>
                <h3 className={`text-xl font-semibold mb-2 transition-colors ${
                  isActive ? 'text-white' : 'text-white/90'
                }`}>
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-white/50 text-sm leading-relaxed max-w-xl">{event.description}</p>
                )}
                {event.linkedTrack && onPlayTrack && (
                  <button
                    onClick={() => onPlayTrack(event.linkedTrack!)}
                    aria-label={isActive ? `Stop playing track` : `Play linked track`}
                    className={`mt-4 text-sm px-5 py-2.5 rounded-full border transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'border-white/40 bg-gradient-to-r from-[#d4789a]/20 to-[#9b8ac4]/20 text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        Playing
                      </>
                    ) : (
                      <>
                        <span className="text-xs">▶</span>
                        Play Track
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { PlayCircle, Clock } from 'lucide-react';

interface TrackCardProps {
  id: string;
  title: string;
  coverColor: string;
  duration: number;
  featured?: boolean;
  audioFile: string;
  index?: number;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrackCard({ id, title, coverColor, duration, featured, audioFile, index = 1 }: TrackCardProps) {
  const [isCurrent, setIsCurrent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handlePlayTrack = (e: Event) => {
      const track = (e as CustomEvent<any>).detail;
      setIsCurrent(track.id === id);
    };

    window.addEventListener('play-track', handlePlayTrack);
    return () => window.removeEventListener('play-track', handlePlayTrack);
  }, [id]);

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

  // Featured card - grid style
  if (featured) {
    return (
      <button
        onClick={handlePlay}
        className="card group text-left relative"
      >
        {/* Cover */}
        <div
          className="aspect-square relative overflow-hidden"
          style={{ background: coverColor || '#1f2020' }}
        >
          <img
            src={`https://lh3.googleusercontent.com/aida-public/AB6AXuCgtOZokyfW-5iyT7eX3l8NY76ryhn_alBS73FGb5OwQ4Da4Vf5ragbLvEeiRW3zZLPR4kQbSA7bF5klocofwBe67MJPg5Sp5U-DYVY37gjbF8-XdmDsnz7e8-qf3as2cCtqpK-kXWGHeUb6BQh-NzsG8klyB61WpDEUl40kPsZoggBMwagSz3dUcQZ3eOjwN4ytx8HJtGRSXYblhqN8YEICLWO_GI4xYr_mGpLlH5mOKC4Pjr7VJTmgBqTOXfYB_KDFb5HY13JfJfH`}
            alt={title}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center play-overlay">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
              <PlayCircle size={32} className="text-[#60130f] ml-1" fill="#60130f" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <span className="badge mb-2">Featured</span>
          <h3 className="font-bold text-lg leading-tight group-hover:text-[#ffb4aa] transition-colors">
            {title}
          </h3>
          <p className="text-[#dcc0bd] text-sm mt-1 flex items-center gap-1">
            <Clock size={12} />
            {formatTime(duration)}
          </p>
        </div>
      </button>
    );
  }

  // List item style
  return (
    <button
      onClick={handlePlay}
      className="track-item w-full flex items-center gap-4 p-3 rounded-2xl text-left"
    >
      {/* Track number */}
      <span className="track-number w-6 text-lg font-bold text-[#dcc0bd] transition-colors">
        {String(index).padStart(2, '0')}
      </span>

      {/* Cover thumbnail */}
      <div
        className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
        style={{ background: coverColor || '#1f2020' }}
      >
        <img
          src={`https://lh3.googleusercontent.com/aida-public/AB6AXuBGtqIegTQTNSvPt9kJ0eflveH_uCXNCdhlQNgRgyb7U4n_iNS4aRsGsL89KeEHUe8eTvZcSXxsz7c_iFqCSNomGDYu_NCPhtObW_GINpr69sSd5evVdYz5aZxhiZhznrY3nHiztzWH591s2kBNp4AeChk8ybJzpw3BKYMZGLRCbObzD6_HBM4hP5hV32KL6sWr46QKjvO43jDoK3q1RS8VepMcqgLJcs7w404mPAulakVthTs46SlPbS0jT9-b52_0sKBN9qzRs5nc`}
          alt={title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Title */}
      <div className="flex-grow min-w-0">
        <h4 className={`font-bold truncate transition-colors ${isCurrent ? 'text-[#ffb4aa]' : ''}`}>
          {title}
        </h4>
        <p className="text-[#dcc0bd] text-xs">
          Titi • {formatTime(duration)}
        </p>
      </div>

      {/* Play button on hover */}
      <div className="track-play-btn opacity-0 transition-opacity">
        {isCurrent && isPlaying ? (
          <div className="playing-bar">
            <span></span><span></span><span></span><span></span>
          </div>
        ) : (
          <PlayCircle size={24} className="text-[#ffb4aa]" />
        )}
      </div>
    </button>
  );
}

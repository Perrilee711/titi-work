import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronUp, Disc3 } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const { currentTrack, isPlaying, progress, volume, playlist, toggle, next, prev, seek, setVolume } = useAudio();
  const [expanded, setExpanded] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const duration = currentTrack.duration || 0;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Click on progress bar to seek
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    seek(percent * duration);
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 pointer-events-none md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-4xl">
      <div className="glass-panel rounded-3xl p-3 flex items-center justify-between pointer-events-auto shadow-2xl">
        {/* Track Info */}
        <div className="flex items-center gap-3">
          {/* Cover */}
          <div
            className="w-12 h-12 rounded-xl overflow-hidden bg-[#2a2a2a] shrink-0"
            style={{ background: currentTrack.coverColor || '#2a2a2a' }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGtqIegTQTNSvPt9kJ0eflveH_uCXNCdhlQNgRgyb7U4n_iNS4aRsGsL89KeEHUe8eTvZcSXxsz7c_iFqCSNomGDYu_NCPhtObW_GINpr69sSd5evVdYz5aZxhiZhznrY3nHiztzWH591s2kBNp4AeChk8ybJzpw3BKYMZGLRCbObzD6_HBM4hP5hV32KL6sWr46QKjvO43jDoK3q1RS8VepMcqgLJcs7w404mPAulakVthTs46SlPbS0jT9-b52_0sKBN9qzRs5nc"
              alt="Track Art"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Title */}
          <div>
            <h5 className="text-sm font-bold leading-tight">{currentTrack.title}</h5>
            <p className="text-[10px] text-[#dcc0bd] uppercase tracking-wider font-semibold">
              Titi
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Playback controls - hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={prev}
              className="text-[#dcc0bd] hover:text-[#ffb4aa] transition-colors"
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={toggle}
              className="w-10 h-10 rounded-full bg-gradient-primary text-[#60130f] flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              className="text-[#dcc0bd] hover:text-[#ffb4aa] transition-colors"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Mobile play button */}
          <button
            onClick={toggle}
            className="md:hidden w-10 h-10 rounded-full bg-gradient-primary text-[#60130f] flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Progress - hidden on small screens */}
            <div className="hidden sm:block w-24 h-1 bg-[#353535] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Heart */}
            <button className="text-[#dcc0bd] hover:text-[#ffb4aa] transition-colors">
              <Heart size={20} />
            </button>

            {/* Expand */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#dcc0bd] hover:text-white transition-colors"
            >
              <ChevronUp size={20} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="glass-panel rounded-3xl p-4 mt-2 shadow-2xl">
          <div className="space-y-4">
            {/* Large progress bar */}
            <div>
              <div
                ref={progressRef}
                onClick={handleProgressClick}
                className="h-2 bg-[#353535] rounded-full cursor-pointer group overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-primary rounded-full relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#dcc0bd] font-mono">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playlist */}
            {playlist.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <p className="text-xs text-[#dcc0bd] uppercase tracking-wider font-semibold">Up Next</p>
                {playlist.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('play-track', { detail: t }));
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 transition-all ${
                      t.id === currentTrack.id
                        ? 'bg-[#2a2a2a] text-[#ffb4aa]'
                        : 'text-[#dcc0bd] hover:text-white hover:bg-[#1f2020]'
                    }`}
                  >
                    <span className="text-[#dcc0bd]/50 w-4">{idx + 1}</span>
                    <span className="truncate flex-1">{t.title}</span>
                    {t.id === currentTrack.id && isPlaying && (
                      <div className="playing-bar">
                        <span></span><span></span><span></span><span></span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                className="text-[#dcc0bd] hover:text-white transition-colors"
              >
                {volume === 0 ? (
                  <span className="text-xs">🔇</span>
                ) : (
                  <span className="text-xs">🔊</span>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1 accent-[#ffb4aa] bg-[#353535] rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

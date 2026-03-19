import { useState, useEffect } from 'react';
import { Menu, X, Search, Globe } from 'lucide-react';

interface NavigationProps {
  lang?: 'en' | 'zh';
}

const links = [
  { label: 'Tracks', href: '/#tracks', zh: '曲目' },
  { label: 'Stories', href: '/stories', zh: '故事' },
  { label: 'About', href: '/about', zh: '关于' },
  { label: 'Search', href: '/search', zh: '搜索', icon: Search },
];

export default function Navigation({ lang = 'en' }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langSwitchOpen, setLangSwitchOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const toggleLang = () => {
    const targetLang = lang === 'en' ? 'zh' : 'en';
    const current = window.location.pathname;
    if (current.startsWith('/zh')) {
      window.location.href = current.replace('/zh', targetLang === 'zh' ? '/zh' : '');
    } else {
      window.location.href = targetLang === 'zh' ? '/zh' + current : current;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        {/* Logo with gradient */}
        <a href="/" className="font-bold text-xl tracking-tight group">
          <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:from-[#d4789a] group-hover:to-[#9b8ac4] transition-all">
            titi.work
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white/50 hover:text-white text-sm transition-colors relative group"
            >
              {lang === 'zh' ? link.zh : link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[#d4789a] to-[#9b8ac4] group-hover:w-full transition-all duration-300" />
            </a>
          ))}

          {/* Lang toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-white/30 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            <Globe size={14} />
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 top-14 bg-[#0a0a0a]/98 backdrop-blur-xl z-30 flex flex-col items-center justify-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              {lang === 'zh' ? link.zh : link.label}
            </a>
          ))}
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 text-white/40 hover:text-white text-lg transition-colors"
          >
            <Globe size={18} />
            {lang === 'en' ? '切换中文' : 'Switch to English'}
          </button>
        </div>
      )}
    </header>
  );
}

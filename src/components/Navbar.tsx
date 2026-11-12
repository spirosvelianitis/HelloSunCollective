import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'overview', label: 'Overview' },
  { id: 'vendors', label: 'Vendors & Sales' },
  { id: 'events', label: 'Events' },
  { id: 'partnership', label: 'Partnership' },
];

export function Navbar({ onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E7E5E0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('overview');
          }}
          className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#1A1917] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] rounded-sm"
        >
          Hello Sunshine Collective
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="py-1 border-b border-transparent hover:border-[#1A1917] hover:text-[#1A1917] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] rounded-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('partnership')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-[#FAF9F6] bg-[#1A1917] hover:bg-[#B45309] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2"
          >
            Partner With Us
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E7E5E0] text-[#1A1917] hover:bg-[#F3F0EA] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E7E5E0] bg-[#FAF9F6] px-4 py-4 space-y-2">
          {NAV_LINKS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(item.id);
              }}
              className="block py-2.5 px-3 text-sm font-medium text-[#1A1917] rounded-lg hover:bg-[#F3F0EA]"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => handleLinkClick('partnership')}
            className="w-full mt-2 px-4 py-2.5 text-sm font-semibold text-[#FAF9F6] bg-[#1A1917] rounded-lg"
          >
            Partner With Us
          </button>
        </div>
      )}
    </header>
  );
}

import { CollectiveOverview } from '../types.ts';

interface FooterProps {
  overview: CollectiveOverview;
  onNavigate: (sectionId: string) => void;
}

export function Footer({ overview, onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#FAF9F6] border-t border-[#E7E5E0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-display text-lg font-semibold text-[#1A1917]">{overview.name}</p>
          <p className="text-xs text-[#78716C] mt-1">
            {overview.location} · {overview.hours}
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#57534E]">
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('overview');
            }}
            className="hover:text-[#1A1917] transition-colors"
          >
            Overview
          </a>
          <a
            href="#vendors"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('vendors');
            }}
            className="hover:text-[#1A1917] transition-colors"
          >
            Vendors &amp; Sales
          </a>
          <a
            href="#events"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('events');
            }}
            className="hover:text-[#1A1917] transition-colors"
          >
            Events Calendar
          </a>
          <a
            href="#partnership"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('partnership');
            }}
            className="hover:text-[#1A1917] transition-colors"
          >
            Vendor Partnership
          </a>
        </nav>

        <p className="text-xs text-[#78716C]">
          © 2026 {overview.name}. Member-owned artisan cooperative.
        </p>
      </div>
    </footer>
  );
}

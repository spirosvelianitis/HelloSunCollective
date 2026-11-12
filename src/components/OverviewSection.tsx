import { ArrowRight } from 'lucide-react';
import { CollectiveOverview, CommunityEvent, TimePeriod, Vendor } from '../types.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface OverviewSectionProps {
  overview: CollectiveOverview;
  vendors: Vendor[];
  events: CommunityEvent[];
  onNavigate: (sectionId: string) => void;
}

export function OverviewSection({
  overview,
  vendors,
  events,
  onNavigate,
}: OverviewSectionProps) {
  const total90DaySales = vendors.reduce(
    (sum, v) => sum + v.salesByPeriod[TimePeriod.NinetyDays].totalRevenue,
    0,
  );
  const totalAvailableUnits = vendors.reduce(
    (sum, v) => sum + v.inventory.reduce((skuSum, item) => skuSum + item.stock, 0),
    0,
  );

  return (
    <section id="overview" className="border-b border-[#E7E5E0]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-10 pb-14 sm:pt-14 sm:pb-20">
        {/* Hero 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-[#78716C] mb-4">
                {overview.location} · {overview.hours}
              </p>

              <h1
                className="font-display font-semibold tracking-tight text-[#1A1917] leading-[1.08] mb-5"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.6rem)',
                  textWrap: 'balance',
                }}
              >
                Where independent makers share one sunlit roof.
              </h1>

              <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-xl mb-8">
                {overview.tagline} Explore live vendor sales and shelf inventory, RSVP to upcoming
                neighborhood workshops, or connect directly with our founder to stock your craft.
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => onNavigate('vendors')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#FAF9F6] bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2"
                >
                  <span>Explore Vendor Insights</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('events')}
                  className="py-2 text-sm font-medium text-[#1A1917] border-b border-[#1A1917] hover:text-[#B45309] hover:border-[#B45309] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  View Community Calendar
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#E7E5E0] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#78716C]">
              <span>Founded 2022 in Portland</span>
              <span aria-hidden="true">·</span>
              <span>Member-Owned Retail Cooperative</span>
              <span aria-hidden="true">·</span>
              <span>85% Direct Maker Payout</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[380px] rounded-xl overflow-hidden border border-[#E7E5E0] bg-[#EFECE6]">
              <ResilientImage
                src="/src/assets/images/hero_collective_atelier_1794514483454.jpg"
                alt="Sun-drenched interior of Hello Sunshine Collective featuring oak tables stocked with handmade stoneware ceramics, textiles, and botanical jars"
                fallbackTitle="Hello Sunshine Collective Storefront"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 sm:p-6">
                <p className="text-xs font-medium text-[#FDE68A] mb-1">
                  Millhouse Main Floor · Autumn 2026
                </p>
                <p className="text-sm text-white/95 max-w-md leading-snug">
                  Twenty-four local workshops sharing shelf space, POS analytics, and community worktables.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Proof Strip */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-[#E7E5E0] bg-white rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-[#E7E5E0]">
          <div className="p-5 sm:p-6">
            <p className="text-xs font-medium text-[#78716C] mb-1.5">Active Tracked Studios</p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#1A1917] tabular-nums">
              {vendors.length} <span className="text-sm font-sans font-normal text-[#78716C]">featured · 24 total</span>
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-xs font-medium text-[#78716C] mb-1.5">90-Day Collective Sales</p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#1A1917] tabular-nums">
              ${total90DaySales.toLocaleString()}
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-xs font-medium text-[#78716C] mb-1.5">Units Ready on Shelves</p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#1A1917] tabular-nums">
              {totalAvailableUnits.toLocaleString()}
            </p>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-xs font-medium text-[#78716C] mb-1.5">Upcoming Gatherings</p>
            <p className="font-mono text-2xl sm:text-3xl font-semibold text-[#1A1917] tabular-nums">
              {events.length} <span className="text-sm font-sans font-normal text-[#78716C]">Nov–Jan</span>
            </p>
          </div>
        </div>

        {/* Organization Overview: Story, Mission & Goals */}
        <div className="mt-16 pt-14 border-t border-[#E7E5E0] grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#B45309] mb-2">
                Our Story &amp; Mission
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#1A1917] tracking-tight leading-snug mb-5">
                Built to give neighborhood artisans fair economics and clear data.
              </h2>

              <div className="space-y-4 text-[15px] text-[#44403C] leading-relaxed max-w-prose">
                {overview.storyParagraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? 'first-letter:font-display first-letter:text-4xl first-letter:font-semibold first-letter:float-left first-letter:mr-2.5 first-letter:mt-0.5 first-letter:text-[#1A1917] first-letter:leading-none'
                        : ''
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E7E5E0]">
              <p className="text-xs font-medium uppercase tracking-wider text-[#78716C] mb-2">
                Collective Mission
              </p>
              <p className="font-display text-lg sm:text-xl italic text-[#1A1917] leading-relaxed">
                &ldquo;{overview.missionStatement}&rdquo;
              </p>
              <p className="mt-3 text-xs text-[#78716C]">
                {overview.ownerName} · {overview.ownerRole}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#B45309] mb-1">
                  2026–2027 Roadmap
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#1A1917]">
                  Collective Goals
                </h3>
              </div>
              <span className="text-xs text-[#78716C]">Reviewed quarterly by member vote</span>
            </div>

            <div className="divide-y divide-[#E7E5E0] border-t border-b border-[#E7E5E0]">
              {overview.goals.map((goal) => (
                <div
                  key={goal.index}
                  className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-start"
                >
                  <div className="sm:col-span-5">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-xs font-semibold text-[#B45309] tabular-nums">
                        {goal.index}.
                      </span>
                      <h4 className="font-semibold text-base text-[#1A1917]">{goal.title}</h4>
                    </div>
                    <p className="mt-1 pl-6 text-xs font-mono text-[#78716C]">{goal.metric}</p>
                  </div>
                  <p className="sm:col-span-7 text-sm text-[#57534E] leading-relaxed">
                    {goal.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

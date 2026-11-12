import { FormEvent, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { CommunityEvent, EventCategory } from '../types.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface CommunityCalendarSectionProps {
  events: CommunityEvent[];
  onRsvpEvent: (eventId: string, name: string, email: string) => Promise<void>;
}

interface MonthSlot {
  year: number;
  monthIndex: number; // 0-indexed
  label: string;
}

const MONTHS: MonthSlot[] = [
  { year: 2026, monthIndex: 10, label: 'November 2026' },
  { year: 2026, monthIndex: 11, label: 'December 2026' },
  { year: 2027, monthIndex: 0, label: 'January 2027' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY_KEY = '2026-11-12';

function formatDateKey(year: number, monthIndex: number, day: number): string {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function formatReadableDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function CommunityCalendarSection({
  events,
  onRsvpEvent,
}: CommunityCalendarSectionProps) {
  const [monthCursor, setMonthCursor] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<EventCategory>(EventCategory.All);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id ?? '');

  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [rsvpFeedback, setRsvpFeedback] = useState('');

  const currentMonth = MONTHS[monthCursor];

  const filteredEvents = useMemo(() => {
    return events.filter(
      (evt) => categoryFilter === EventCategory.All || evt.category === categoryFilter,
    );
  }, [events, categoryFilter]);

  const monthPrefix = `${currentMonth.year}-${String(currentMonth.monthIndex + 1).padStart(2, '0')}`;

  const eventsInCurrentMonth = useMemo(() => {
    return filteredEvents.filter((evt) => evt.date.startsWith(monthPrefix));
  }, [filteredEvents, monthPrefix]);

  const selectedEvent = useMemo(() => {
    return (
      filteredEvents.find((e) => e.id === selectedEventId) ??
      eventsInCurrentMonth[0] ??
      filteredEvents[0] ??
      events[0]
    );
  }, [filteredEvents, eventsInCurrentMonth, selectedEventId, events]);

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(Date.UTC(currentMonth.year, currentMonth.monthIndex, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(currentMonth.year, currentMonth.monthIndex + 1, 0)).getUTCDate();
    const cells: Array<{ day: number | null; dateKey: string | null }> = [];

    for (let i = 0; i < firstDayOfWeek; i += 1) {
      cells.push({ day: null, dateKey: null });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({
        day: d,
        dateKey: formatDateKey(currentMonth.year, currentMonth.monthIndex, d),
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateKey: null });
    }
    return cells;
  }, [currentMonth]);

  const handleRsvpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!rsvpName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rsvpEmail.trim())) {
      setRsvpStatus('error');
      setRsvpFeedback('Please enter your name and a valid email address.');
      return;
    }

    setRsvpStatus('submitting');
    setRsvpFeedback('');
    try {
      await onRsvpEvent(selectedEvent.id, rsvpName.trim(), rsvpEmail.trim());
      setRsvpStatus('success');
      setRsvpFeedback(`Spot reserved for ${rsvpName.trim()} at ${selectedEvent.title}.`);
      setRsvpName('');
      setRsvpEmail('');
    } catch (err) {
      setRsvpStatus('error');
      setRsvpFeedback(
        err instanceof Error ? err.message : 'Could not complete RSVP. Please try again.',
      );
    }
  };

  if (!selectedEvent) return null;

  const spotsRemaining = Math.max(0, selectedEvent.capacity - selectedEvent.registeredCount);

  return (
    <section id="events" className="border-b border-[#E7E5E0] bg-[#FAF9F6]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
        {/* Top Editorial Banner + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-10">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#B45309] mb-2">
                Community Gatherings &amp; Workshops
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-[#1A1917] tracking-tight mb-4"
                style={{ textWrap: 'balance' }}
              >
                Upcoming collective events calendar
              </h2>
              <p className="text-base text-[#57534E] leading-relaxed max-w-2xl">
                Every week our resident studios open the long timber worktable for botanical
                printing, stoneware glazing, seasonal markets, and prospective maker coffee tours.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div
                role="tablist"
                aria-label="Filter community events by type"
                className="flex flex-wrap items-center gap-1 p-1 bg-white border border-[#E7E5E0] rounded-lg"
              >
                {Object.values(EventCategory).map((cat) => {
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      role="tab"
                      type="button"
                      aria-selected={active}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#1A1917] text-white'
                          : 'text-[#57534E] hover:text-[#1A1917]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="inline-flex items-center p-1 bg-white border border-[#E7E5E0] rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'calendar'
                      ? 'bg-[#FAF9F6] text-[#1A1917] border border-[#E7E5E0]'
                      : 'text-[#57534E] hover:text-[#1A1917] border border-transparent'
                  }`}
                >
                  Calendar Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#FAF9F6] text-[#1A1917] border border-[#E7E5E0]'
                      : 'text-[#57534E] hover:text-[#1A1917] border border-transparent'
                  }`}
                >
                  Upcoming List
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-56 lg:h-full min-h-[210px] rounded-xl overflow-hidden border border-[#E7E5E0] bg-[#EFECE6]">
              <ResilientImage
                src="/images/community_workshop_gathering_1794514484220.jpg"
                alt="Neighbors and makers gathered around a timber table crafting pressed botanical prints at Hello Sunshine Collective"
                fallbackTitle="Community Workshop Table"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Calendar / List + Selected Event Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-xl overflow-hidden">
            {viewMode === 'calendar' ? (
              <>
                <div className="px-5 py-4 border-b border-[#E7E5E0] flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#1A1917]">
                      {currentMonth.label}
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      {eventsInCurrentMonth.length} scheduled gatherings this month
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Previous month"
                      disabled={monthCursor === 0}
                      onClick={() => setMonthCursor((c) => Math.max(0, c - 1))}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E7E5E0] text-[#1A1917] hover:bg-[#FAF9F6] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next month"
                      disabled={monthCursor === MONTHS.length - 1}
                      onClick={() => setMonthCursor((c) => Math.min(MONTHS.length - 1, c + 1))}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E7E5E0] text-[#1A1917] hover:bg-[#FAF9F6] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-[#E7E5E0] bg-[#FAF9F6]">
                  {WEEKDAYS.map((dayName) => (
                    <div
                      key={dayName}
                      className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[#78716C]"
                    >
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Day Cells */}
                <div className="grid grid-cols-7 divide-x divide-y divide-[#E7E5E0]">
                  {calendarCells.map((cell, index) => {
                    if (!cell.day || !cell.dateKey) {
                      return <div key={`empty-${index}`} className="min-h-[84px] sm:min-h-[96px] bg-[#FAF9F6]/60" />;
                    }

                    const dayEvents = filteredEvents.filter((evt) => evt.date === cell.dateKey);
                    const isToday = cell.dateKey === TODAY_KEY;
                    const hasSelected = dayEvents.some((evt) => evt.id === selectedEvent.id);

                    return (
                      <div
                        key={cell.dateKey}
                        className={`min-h-[84px] sm:min-h-[96px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                          hasSelected ? 'bg-[#FFFBEB]' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-mono text-xs tabular-nums ${
                              isToday
                                ? 'font-bold text-[#B45309] underline underline-offset-4'
                                : 'text-[#57534E]'
                            }`}
                          >
                            {cell.day}
                          </span>
                          {isToday && (
                            <span className="hidden sm:inline text-[10px] font-medium text-[#B45309]">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1">
                          {dayEvents.map((evt) => {
                            const active = evt.id === selectedEvent.id;
                            return (
                              <button
                                key={evt.id}
                                type="button"
                                onClick={() => {
                                  setSelectedEventId(evt.id);
                                  setRsvpStatus('idle');
                                  setRsvpFeedback('');
                                }}
                                className={`w-full text-left px-1.5 py-1 rounded text-[11px] leading-tight font-medium transition-colors cursor-pointer truncate ${
                                  active
                                    ? 'bg-[#B45309] text-white'
                                    : 'bg-[#FAF9F6] text-[#1A1917] border border-[#E7E5E0] hover:border-[#B45309]'
                                }`}
                                title={evt.title}
                              >
                                {evt.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="divide-y divide-[#E7E5E0]">
                {filteredEvents.map((evt) => {
                  const active = evt.id === selectedEvent.id;
                  const spots = Math.max(0, evt.capacity - evt.registeredCount);
                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setRsvpStatus('idle');
                        setRsvpFeedback('');
                      }}
                      className={`w-full text-left p-5 transition-colors cursor-pointer ${
                        active ? 'bg-[#FFFBEB]' : 'hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                        <span className="text-xs font-mono text-[#B45309] tabular-nums">
                          {formatReadableDate(evt.date)} · {evt.startTime}
                        </span>
                        <span className="text-xs font-mono text-[#57534E] tabular-nums">
                          {spots} of {evt.capacity} spots left
                        </span>
                      </div>
                      <h4 className="font-display text-lg font-semibold text-[#1A1917]">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-[#78716C] mt-1">
                        {evt.category} · {evt.host} · {evt.location}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Selected Event Details & Working RSVP */}
          <div className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-xl p-6 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-wider text-[#B45309] mb-2">
              {selectedEvent.category} · {selectedEvent.priceLabel}
            </p>
            <h3 className="font-display text-2xl font-semibold text-[#1A1917] leading-snug mb-4">
              {selectedEvent.title}
            </h3>

            <div className="space-y-2.5 text-sm text-[#44403C] pb-5 border-b border-[#E7E5E0]">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#78716C] shrink-0" aria-hidden="true" />
                <span>{formatReadableDate(selectedEvent.date)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#78716C] shrink-0" aria-hidden="true" />
                <span className="font-mono text-xs tabular-nums">
                  {selectedEvent.startTime} – {selectedEvent.endTime}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#78716C] shrink-0" aria-hidden="true" />
                <span>
                  {selectedEvent.location} · Hosted by {selectedEvent.host}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-[#78716C] shrink-0" aria-hidden="true" />
                <span className="font-mono text-xs tabular-nums">
                  {selectedEvent.registeredCount} / {selectedEvent.capacity} registered ·{' '}
                  <strong className="font-semibold text-[#1A1917]">
                    {spotsRemaining} spots remaining
                  </strong>
                </span>
              </div>
            </div>

            <p className="text-sm text-[#57534E] leading-relaxed py-5 border-b border-[#E7E5E0]">
              {selectedEvent.description}
            </p>

            {/* RSVP Form */}
            <form onSubmit={handleRsvpSubmit} className="pt-5 space-y-4">
              <p className="text-sm font-semibold text-[#1A1917]">Reserve Your Spot</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="rsvp-name" className="block text-xs font-medium text-[#57534E] mb-1">
                    Full Name
                  </label>
                  <input
                    id="rsvp-name"
                    type="text"
                    required
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                  />
                </div>
                <div>
                  <label htmlFor="rsvp-email" className="block text-xs font-medium text-[#57534E] mb-1">
                    Email Address
                  </label>
                  <input
                    id="rsvp-email"
                    type="email"
                    required
                    value={rsvpEmail}
                    onChange={(e) => setRsvpEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F6] border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                  />
                </div>
              </div>

              {rsvpFeedback && (
                <div
                  role={rsvpStatus === 'error' ? 'alert' : 'status'}
                  className={`flex items-start gap-2 p-3 rounded-lg text-xs font-medium border ${
                    rsvpStatus === 'success'
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                      : 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
                  }`}
                >
                  {rsvpStatus === 'success' && (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <span>{rsvpFeedback}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={rsvpStatus === 'submitting' || spotsRemaining === 0}
                className="w-full px-5 py-2.5 text-sm font-semibold text-[#FAF9F6] bg-[#1A1917] hover:bg-[#B45309] rounded-lg transition-colors duration-150 disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed"
              >
                {spotsRemaining === 0
                  ? 'Event Full'
                  : rsvpStatus === 'submitting'
                    ? 'Reserving Spot...'
                    : 'Confirm RSVP'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

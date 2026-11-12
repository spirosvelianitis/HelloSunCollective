import { useCallback, useEffect, useState } from 'react';
import { CommunityCalendarSection } from './components/CommunityCalendarSection.tsx';
import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { OverviewSection } from './components/OverviewSection.tsx';
import { PartnershipSection } from './components/PartnershipSection.tsx';
import { VendorInsightsSection } from './components/VendorInsightsSection.tsx';
import {
  INITIAL_EVENTS,
  INITIAL_INQUIRIES,
  INITIAL_OVERVIEW,
  INITIAL_VENDORS,
} from './data/collectiveData.ts';
import {
  CollectivePayload,
  CommunityEvent,
  PartnershipInquiry,
  Vendor,
} from './types.ts';

export default function App() {
  const [data, setData] = useState<CollectivePayload>({
    overview: INITIAL_OVERVIEW,
    vendors: INITIAL_VENDORS,
    events: INITIAL_EVENTS,
    inquiries: INITIAL_INQUIRIES,
  });
  const [isHydrating, setIsHydrating] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchCollective = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch('/api/collective');
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const payload = (await res.json()) as CollectivePayload;
      setData(payload);
    } catch {
      setLoadError('Live sync unavailable; displaying current collective snapshot.');
    } finally {
      setIsHydrating(false);
    }
  }, []);

  useEffect(() => {
    fetchCollective();
  }, [fetchCollective]);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleAdjustInventory = useCallback(
    async (vendorId: string, itemId: string, delta: number) => {
      const res = await fetch(`/api/vendors/${vendorId}/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || 'Failed to update inventory.');
      }
      const result = (await res.json()) as { vendor: Vendor };
      setData((prev) => ({
        ...prev,
        vendors: prev.vendors.map((v) => (v.id === vendorId ? result.vendor : v)),
      }));
    },
    [],
  );

  const handleRsvpEvent = useCallback(
    async (eventId: string, name: string, email: string) => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || 'Unable to register RSVP.');
      }
      const result = (await res.json()) as { event: CommunityEvent };
      setData((prev) => ({
        ...prev,
        events: prev.events.map((evt) => (evt.id === eventId ? result.event : evt)),
      }));
    },
    [],
  );

  const handleSubmitInquiry = useCallback(
    async (
      payload: Omit<PartnershipInquiry, 'id' | 'referenceCode' | 'submittedAt' | 'status'>,
    ) => {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || 'Unable to submit partnership inquiry.');
      }
      const result = (await res.json()) as { inquiry: PartnershipInquiry };
      setData((prev) => ({
        ...prev,
        inquiries: [result.inquiry, ...prev.inquiries],
      }));
      return result.inquiry;
    },
    [],
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A1917]">
      <Navbar onNavigate={scrollToSection} />

      {loadError && !isHydrating && (
        <div
          role="status"
          className="bg-[#FFFBEB] border-b border-[#FDE68A] px-4 py-2 text-center text-xs text-[#92400E]"
        >
          {loadError}
        </div>
      )}

      <main className="flex-1">
        <OverviewSection
          overview={data.overview}
          vendors={data.vendors}
          events={data.events}
          onNavigate={scrollToSection}
        />

        <VendorInsightsSection
          vendors={data.vendors}
          onAdjustInventory={handleAdjustInventory}
        />

        <CommunityCalendarSection
          events={data.events}
          onRsvpEvent={handleRsvpEvent}
        />

        <PartnershipSection
          overview={data.overview}
          inquiries={data.inquiries}
          onSubmitInquiry={handleSubmitInquiry}
        />
      </main>

      <Footer overview={data.overview} onNavigate={scrollToSection} />
    </div>
  );
}

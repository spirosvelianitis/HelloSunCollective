import { FormEvent, useState } from 'react';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import {
  CollectiveOverview,
  PartnershipInquiry,
  PartnershipType,
  VendorCategory,
} from '../types.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface PartnershipSectionProps {
  overview: CollectiveOverview;
  inquiries: PartnershipInquiry[];
  onSubmitInquiry: (
    payload: Omit<PartnershipInquiry, 'id' | 'referenceCode' | 'submittedAt' | 'status'>,
  ) => Promise<PartnershipInquiry>;
}

const VENDOR_DISCIPLINES = Object.values(VendorCategory).filter(
  (c): c is Exclude<VendorCategory, VendorCategory.All> => c !== VendorCategory.All,
);

const PARTNERSHIP_TYPES = Object.values(PartnershipType);

export function PartnershipSection({
  overview,
  inquiries,
  onSubmitInquiry,
}: PartnershipSectionProps) {
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState<Exclude<VendorCategory, VendorCategory.All>>(
    VendorCategory.Ceramics,
  );
  const [partnershipType, setPartnershipType] = useState<PartnershipType>(
    PartnershipType.ShelfSpace,
  );
  const [monthlyVolume, setMonthlyVolume] = useState('20–40 units / month');
  const [message, setMessage] = useState('');

  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');
  const [confirmedInquiry, setConfirmedInquiry] = useState<PartnershipInquiry | null>(null);
  const [showRecentLog, setShowRecentLog] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!brandName.trim() || !contactName.trim()) {
      setSubmitState('error');
      setErrorText('Please include your studio or brand name and your contact name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitState('error');
      setErrorText('Please enter a valid email address so Clara can reply.');
      return;
    }
    if (message.trim().length < 15) {
      setSubmitState('error');
      setErrorText('Please tell us a little more about your work and partnership goals (15+ characters).');
      return;
    }

    setSubmitState('submitting');
    try {
      const created = await onSubmitInquiry({
        brandName: brandName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        website: website.trim(),
        category,
        partnershipType,
        monthlyVolume,
        message: message.trim(),
      });
      setConfirmedInquiry(created);
      setSubmitState('success');
      setBrandName('');
      setContactName('');
      setEmail('');
      setWebsite('');
      setMessage('');
    } catch (err) {
      setSubmitState('error');
      setErrorText(
        err instanceof Error ? err.message : 'Unable to send your partnership note. Please try again.',
      );
    }
  };

  return (
    <section id="partnership" className="bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Owner Contact & Partnership Terms */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#B45309] mb-2">
                Vendor Partnerships
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-[#1A1917] tracking-tight mb-4"
                style={{ textWrap: 'balance' }}
              >
                Bring your studio into the collective
              </h2>
              <p className="text-base text-[#57534E] leading-relaxed">
                Whether you are seeking permanent shelf space, a weekend courtyard pop-up, or a
                table to teach a neighborhood craft class, partnership inquiries go straight to{' '}
                <strong className="font-semibold text-[#1A1917]">{overview.ownerName}</strong>.
              </p>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#E7E5E0] bg-[#FAF9F6]">
              <div className="h-44 overflow-hidden border-b border-[#E7E5E0]">
                <ResilientImage
                  src="/images/vendor_botanical_apothecary_1794514483984.jpg"
                  alt="Small-batch botanical apothecary goods displayed on stone shelf at Hello Sunshine Collective"
                  fallbackTitle="Collective Shelf Curation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg font-semibold text-[#1A1917]">
                  What Every Member Studio Receives
                </h3>
                <ul className="space-y-2.5 text-sm text-[#44403C]">
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-semibold text-[#B45309] mt-0.5">01.</span>
                    <span>85% direct payout on all shelf sales, settled every 1st and 15th.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-semibold text-[#B45309] mt-0.5">02.</span>
                    <span>Real-time SKU velocity, stock alerts, and seasonal period analytics.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-semibold text-[#B45309] mt-0.5">03.</span>
                    <span>Access to host paid community workshops and tasting flights on-site.</span>
                  </li>
                </ul>

                <div className="pt-4 border-t border-[#E7E5E0] flex items-center justify-between text-xs text-[#57534E]">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
                    <span>{overview.ownerEmail}</span>
                  </span>
                  <span>Replies within 2 business days</span>
                </div>
              </div>
            </div>

            {/* Expandable Submitted Inquiries Ledger */}
            <div className="border-t border-[#E7E5E0] pt-5">
              <button
                type="button"
                onClick={() => setShowRecentLog((prev) => !prev)}
                className="text-xs font-semibold text-[#1A1917] hover:text-[#B45309] transition-colors cursor-pointer"
              >
                {showRecentLog ? 'Hide' : 'View'} Recent Partnership Inquiries ({inquiries.length})
              </button>

              {showRecentLog && (
                <div className="mt-4 divide-y divide-[#E7E5E0] border border-[#E7E5E0] rounded-xl bg-[#FAF9F6]">
                  {inquiries.slice(0, 5).map((inq) => (
                    <div key={inq.id} className="p-4 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-[#1A1917]">{inq.brandName}</span>
                        <span className="font-mono text-[#B45309]">{inq.referenceCode}</span>
                      </div>
                      <p className="text-[#57534E]">
                        {inq.contactName} · {inq.category} · {inq.partnershipType}
                      </p>
                      <p className="text-[#78716C] mt-1">Status: {inq.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Validated Contact Owner Form */}
          <div className="lg:col-span-7 bg-[#FAF9F6] border border-[#E7E5E0] rounded-xl p-6 sm:p-8">
            <div className="pb-5 mb-6 border-b border-[#E7E5E0]">
              <h3 className="font-display text-2xl font-semibold text-[#1A1917]">
                Partnership Inquiry to {overview.ownerName}
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Tell us about your craft line, production cadence, and how you would like to collaborate.
              </p>
            </div>

            {submitState === 'success' && confirmedInquiry ? (
              <div className="p-6 rounded-xl bg-white border border-[#BBF7D0] space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h4 className="font-display text-xl font-semibold text-[#1A1917]">
                      Partnership inquiry received
                    </h4>
                    <p className="text-sm text-[#44403C] mt-1">
                      Thank you, {confirmedInquiry.contactName}. {overview.ownerName} has received your
                      application for <strong>{confirmedInquiry.brandName}</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#FAF9F6] border border-[#E7E5E0] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#78716C] block">Reference ID</span>
                    <span className="font-mono font-semibold text-[#1A1917]">
                      {confirmedInquiry.referenceCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Track</span>
                    <span className="font-medium text-[#1A1917]">
                      {confirmedInquiry.partnershipType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#78716C] block">Category</span>
                    <span className="font-medium text-[#1A1917]">{confirmedInquiry.category}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitState('idle');
                    setConfirmedInquiry(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#1A1917] border border-[#E7E5E0] rounded-lg hover:bg-[#FAF9F6] cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="partner-brand" className="block text-xs font-semibold text-[#1A1917] mb-1.5">
                      Studio or Brand Name *
                    </label>
                    <input
                      id="partner-brand"
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Meadowlark Ceramics"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                    />
                  </div>
                  <div>
                    <label htmlFor="partner-contact" className="block text-xs font-semibold text-[#1A1917] mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      id="partner-contact"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Soraia Mendes"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="partner-email" className="block text-xs font-semibold text-[#1A1917] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="partner-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@meadowlark.studio"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                    />
                  </div>
                  <div>
                    <label htmlFor="partner-website" className="block text-xs font-semibold text-[#1A1917] mb-1.5">
                      Website or Lookbook URL
                    </label>
                    <input
                      id="partner-website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://meadowlark.studio"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="partner-category" className="block text-xs font-semibold text-[#1A1917] mb-1.5">
                      Craft Discipline
                    </label>
                    <select
                      id="partner-category"
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as Exclude<VendorCategory, VendorCategory.All>)
                      }
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                    >
                      {VENDOR_DISCIPLINES.map((disc) => (
                        <option key={disc} value={disc}>
                          {disc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="partner-type" className="block text-xs font-semibold text-[#1A1917] mb-1.5">
                      Partnership Track
                    </label>
                    <select
                      id="partner-type"
                      value={partnershipType}
                      onChange={(e) => setPartnershipType(e.target.value as PartnershipType)}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                    >
                      {PARTNERSHIP_TYPES.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="partner-volume" className="block text-xs font-semibold text-[#1A1917] mb-1.5">
                      Monthly Capacity
                    </label>
                    <select
                      id="partner-volume"
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                    >
                      <option value="10–20 units / month">10–20 units / month</option>
                      <option value="20–40 units / month">20–40 units / month</option>
                      <option value="40–80 units / month">40–80 units / month</option>
                      <option value="80+ units / month">80+ units / month</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="partner-message" className="block text-xs font-semibold text-[#1A1917] mb-1.5">
                    About Your Craft &amp; Partnership Goals *
                  </label>
                  <textarea
                    id="partner-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your materials, typical retail price points, and whether you would like to host a workshop or apply for shelf allocation..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7E5E0] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#B45309]"
                  />
                </div>

                {submitState === 'error' && errorText && (
                  <div
                    role="alert"
                    className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs font-medium text-[#B91C1C]"
                  >
                    {errorText}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <span className="text-xs text-[#78716C]">
                    Direct delivery to {overview.ownerName} ({overview.ownerEmail})
                  </span>
                  <button
                    type="submit"
                    disabled={submitState === 'submitting'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#FAF9F6] bg-[#B45309] hover:bg-[#92400E] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {submitState === 'submitting' ? 'Sending Note...' : 'Send Partnership Inquiry'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

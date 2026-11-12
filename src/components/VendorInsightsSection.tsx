import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  Search,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  InventoryItem,
  StockStatus,
  TimePeriod,
  Vendor,
  VendorCategory,
} from '../types.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface VendorInsightsSectionProps {
  vendors: Vendor[];
  onAdjustInventory: (vendorId: string, itemId: string, delta: number) => Promise<void>;
}

const PERIOD_LABELS: Record<TimePeriod, string> = {
  [TimePeriod.ThirtyDays]: '30 Days',
  [TimePeriod.NinetyDays]: '90 Days',
  [TimePeriod.SixMonths]: '6 Months',
  [TimePeriod.OneYear]: '1 Year',
};

const CATEGORIES = Object.values(VendorCategory);

function getStockStatus(item: InventoryItem): StockStatus {
  if (item.stock <= 0) return StockStatus.SoldOut;
  if (item.stock <= item.reorderAt) return StockStatus.LowStock;
  return StockStatus.InStock;
}

export function VendorInsightsSection({
  vendors,
  onAdjustInventory,
}: VendorInsightsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>(VendorCategory.All);
  const [vendorQuery, setVendorQuery] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id ?? '');
  const [period, setPeriod] = useState<TimePeriod>(TimePeriod.NinetyDays);
  const [stockFilter, setStockFilter] = useState<'ALL' | StockStatus>('ALL');
  const [skuSearch, setSkuSearch] = useState('');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    const q = vendorQuery.trim().toLowerCase();
    return vendors.filter((vendor) => {
      const matchesCategory =
        selectedCategory === VendorCategory.All || vendor.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        vendor.name.toLowerCase().includes(q) ||
        vendor.owner.toLowerCase().includes(q) ||
        vendor.category.toLowerCase().includes(q) ||
        vendor.inventory.some((item) => item.name.toLowerCase().includes(q))
      );
    });
  }, [vendors, selectedCategory, vendorQuery]);

  const activeVendor = useMemo(() => {
    const exact = filteredVendors.find((v) => v.id === selectedVendorId);
    return exact ?? filteredVendors[0] ?? vendors[0];
  }, [filteredVendors, selectedVendorId, vendors]);

  const activeSales = activeVendor?.salesByPeriod[period];

  const growthPct = useMemo(() => {
    if (!activeSales || activeSales.priorRevenue === 0) return 0;
    return ((activeSales.totalRevenue - activeSales.priorRevenue) / activeSales.priorRevenue) * 100;
  }, [activeSales]);

  const filteredInventory = useMemo(() => {
    if (!activeVendor) return [];
    const q = skuSearch.trim().toLowerCase();
    return activeVendor.inventory.filter((item) => {
      const status = getStockStatus(item);
      const matchesStatus = stockFilter === 'ALL' || status === stockFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.variant.toLowerCase().includes(q)
      );
    });
  }, [activeVendor, stockFilter, skuSearch]);

  const handleStockAdjust = async (item: InventoryItem, delta: number) => {
    if (!activeVendor) return;
    setPendingItemId(item.id);
    setInventoryMessage(null);
    try {
      await onAdjustInventory(activeVendor.id, item.id, delta);
      const actionText = delta > 0 ? `Added ${delta} units to` : `Logged ${Math.abs(delta)} sale for`;
      setInventoryMessage(`${actionText} ${item.name}.`);
    } catch {
      setInventoryMessage('Unable to update stock right now. Please try again.');
    } finally {
      setPendingItemId(null);
    }
  };

  if (!activeVendor || !activeSales) {
    return null;
  }

  const maxSeriesRevenue = Math.max(...activeSales.series.map((pt) => pt.revenue), 1);
  const inspectedPoint =
    hoveredPointIdx !== null && activeSales.series[hoveredPointIdx]
      ? activeSales.series[hoveredPointIdx]
      : activeSales.series[activeSales.series.length - 1];

  const totalInventoryUnits = activeVendor.inventory.reduce((sum, item) => sum + item.stock, 0);
  const lowOrOutCount = activeVendor.inventory.filter(
    (item) => getStockStatus(item) !== StockStatus.InStock,
  ).length;

  return (
    <section id="vendors" className="border-b border-[#E7E5E0] bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-14 sm:py-20">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#B45309] mb-2">
              Vendor Performance &amp; Shelf Stock
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#1A1917] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Live sales insights and inventory by studio
            </h2>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={vendorQuery}
              onChange={(e) => setVendorQuery(e.target.value)}
              placeholder="Search studio, maker, or product..."
              aria-label="Search vendors or products"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF9F6] border border-[#E7E5E0] rounded-lg text-[#1A1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#B45309]"
            />
          </div>
        </div>

        {/* Category Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter vendors by craft discipline"
          className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF9F6] border border-[#E7E5E0] rounded-lg w-fit mb-8"
        >
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#1A1917] border border-[#E7E5E0]'
                    : 'text-[#57534E] hover:text-[#1A1917] border border-transparent'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Main 2-Panel Vendor Analytics Workspace */}
        {filteredVendors.length === 0 ? (
          <div className="p-10 rounded-xl border border-[#E7E5E0] bg-[#FAF9F6] text-center">
            <p className="font-display text-xl text-[#1A1917] mb-2">No matching studios found</p>
            <p className="text-sm text-[#57534E] mb-5">
              Try clearing your search term or switching back to all craft disciplines.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(VendorCategory.All);
                setVendorQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#1A1917] text-white rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Vendor Roster */}
            <div className="lg:col-span-4 border border-[#E7E5E0] rounded-xl bg-[#FAF9F6] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E7E5E0] flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                  Member Studios ({filteredVendors.length})
                </span>
                <span className="text-xs text-[#78716C]">90D Gross</span>
              </div>

              <div className="divide-y divide-[#E7E5E0]">
                {filteredVendors.map((vendor) => {
                  const isSelected = vendor.id === activeVendor.id;
                  const unitsReady = vendor.inventory.reduce((sum, i) => sum + i.stock, 0);
                  const alertCount = vendor.inventory.filter(
                    (i) => getStockStatus(i) !== StockStatus.InStock,
                  ).length;

                  return (
                    <button
                      key={vendor.id}
                      type="button"
                      onClick={() => {
                        setSelectedVendorId(vendor.id);
                        setHoveredPointIdx(null);
                        setInventoryMessage(null);
                      }}
                      className={`w-full text-left px-5 py-4 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B45309] ${
                        isSelected
                          ? 'bg-white'
                          : 'hover:bg-[#F4F1EA]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isSelected ? 'text-[#B45309]' : 'text-[#1A1917]'
                            }`}
                          >
                            {vendor.name}
                          </p>
                          <p className="text-xs text-[#78716C] mt-0.5 truncate">
                            {vendor.category} · {vendor.studioLocation}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-semibold text-[#1A1917] tabular-nums shrink-0">
                          ${vendor.salesByPeriod[TimePeriod.NinetyDays].totalRevenue.toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-[#57534E]">
                        <span>{vendor.owner}</span>
                        <span className="font-mono tabular-nums">
                          {unitsReady} in stock
                          {alertCount > 0 ? ` · ${alertCount} low/out` : ''}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Vendor Detail: Sales & Inventory */}
            <div className="lg:col-span-8 space-y-8">
              {/* Vendor Profile Header */}
              <div className="p-6 rounded-xl border border-[#E7E5E0] bg-[#FAF9F6] flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-full sm:w-44 h-36 rounded-lg overflow-hidden border border-[#E7E5E0] shrink-0 bg-[#EFECE6]">
                  <ResilientImage
                    src={activeVendor.imageUrl}
                    alt={`${activeVendor.name} studio showcase`}
                    fallbackTitle={activeVendor.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                    <h3 className="font-display text-2xl font-semibold text-[#1A1917]">
                      {activeVendor.name}
                    </h3>
                    <span className="font-mono text-xs text-[#57534E] tabular-nums">
                      {activeVendor.payoutShare}% direct maker payout
                    </span>
                  </div>

                  <p className="text-xs text-[#78716C] mb-3">
                    {activeVendor.owner} · {activeVendor.category} · {activeVendor.studioLocation} · Joined{' '}
                    {activeVendor.joinedDate}
                  </p>

                  <p className="text-sm text-[#44403C] leading-relaxed">{activeVendor.bio}</p>
                </div>
              </div>

              {/* Sales Over Period */}
              <div className="p-6 rounded-xl border border-[#E7E5E0] bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E7E5E0]">
                  <div>
                    <h4 className="font-display text-xl font-semibold text-[#1A1917]">
                      Sales Over Period
                    </h4>
                    <p className="text-xs text-[#78716C] mt-0.5">
                      Gross shelf revenue, units sold, and sell-through for {PERIOD_LABELS[period]}
                    </p>
                  </div>

                  <div
                    role="group"
                    aria-label="Select sales reporting period"
                    className="inline-flex items-center p-1 bg-[#FAF9F6] border border-[#E7E5E0] rounded-lg self-start sm:self-auto"
                  >
                    {(Object.keys(PERIOD_LABELS) as TimePeriod[]).map((pKey) => {
                      const active = period === pKey;
                      return (
                        <button
                          key={pKey}
                          type="button"
                          onClick={() => {
                            setPeriod(pKey);
                            setHoveredPointIdx(null);
                          }}
                          className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            active
                              ? 'bg-[#1A1917] text-white'
                              : 'text-[#57534E] hover:text-[#1A1917]'
                          }`}
                        >
                          {pKey.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4 KPI Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-[#E7E5E0]">
                  <div>
                    <p className="text-xs text-[#78716C] mb-1">Gross Revenue</p>
                    <p className="font-mono text-xl sm:text-2xl font-semibold text-[#1A1917] tabular-nums">
                      ${activeSales.totalRevenue.toLocaleString()}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-mono text-[#16A34A] tabular-nums">
                      <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>+{growthPct.toFixed(1)}% vs prior</span>
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#78716C] mb-1">Units Sold</p>
                    <p className="font-mono text-xl sm:text-2xl font-semibold text-[#1A1917] tabular-nums">
                      {activeSales.totalUnits.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-[#78716C]">across {activeVendor.inventory.length} SKUs</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#78716C] mb-1">Avg. Order Value</p>
                    <p className="font-mono text-xl sm:text-2xl font-semibold text-[#1A1917] tabular-nums">
                      ${activeSales.avgOrderValue}
                    </p>
                    <p className="mt-1 text-xs text-[#78716C]">per checkout basket</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#78716C] mb-1">Sell-Through Rate</p>
                    <p className="font-mono text-xl sm:text-2xl font-semibold text-[#1A1917] tabular-nums">
                      {activeSales.sellThroughRate}%
                    </p>
                    <p className="mt-1 text-xs text-[#78716C]">shelf allocation moved</p>
                  </div>
                </div>

                {/* Interactive Bar + Interval Readout */}
                <div className="pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-medium text-[#57534E]">
                      Interval Breakdown ({PERIOD_LABELS[period]})
                    </span>
                    <div className="font-mono text-xs text-[#1A1917] tabular-nums">
                      <span className="font-semibold">{inspectedPoint.label}:</span>{' '}
                      ${inspectedPoint.revenue.toLocaleString()} · {inspectedPoint.units} units ·{' '}
                      {inspectedPoint.orders} orders
                    </div>
                  </div>

                  <div
                    className="grid gap-3 items-end h-44 pt-4 pb-2 px-3 rounded-lg bg-[#FAF9F6] border border-[#E7E5E0]"
                    style={{
                      gridTemplateColumns: `repeat(${activeSales.series.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {activeSales.series.map((pt, idx) => {
                      const heightPct = Math.max(12, Math.round((pt.revenue / maxSeriesRevenue) * 100));
                      const isHovered = hoveredPointIdx === idx;
                      return (
                        <button
                          key={pt.label}
                          type="button"
                          onMouseEnter={() => setHoveredPointIdx(idx)}
                          onFocus={() => setHoveredPointIdx(idx)}
                          onMouseLeave={() => setHoveredPointIdx(null)}
                          className="h-full flex flex-col justify-end items-center gap-2 group cursor-pointer focus:outline-none"
                        >
                          <span className="font-mono text-[11px] text-[#57534E] tabular-nums">
                            ${(pt.revenue / 1000).toFixed(1)}k
                          </span>
                          <div className="w-full max-w-[44px] flex-1 flex items-end">
                            <div
                              className={`w-full rounded-t-md transition-colors duration-150 ${
                                isHovered
                                  ? 'bg-[#B45309]'
                                  : 'bg-[#1A1917] group-hover:bg-[#B45309]'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-medium text-[#57534E]">
                            {pt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Inventory Available Table */}
              <div className="p-6 rounded-xl border border-[#E7E5E0] bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E7E5E0]">
                  <div>
                    <h4 className="font-display text-xl font-semibold text-[#1A1917]">
                      Inventory Available
                    </h4>
                    <p className="text-xs text-[#78716C] mt-0.5 font-mono tabular-nums">
                      {totalInventoryUnits} total units on shelves · {lowOrOutCount} items need restock
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="search"
                      value={skuSearch}
                      onChange={(e) => setSkuSearch(e.target.value)}
                      placeholder="Filter SKUs..."
                      aria-label="Filter vendor inventory SKUs"
                      className="px-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#E7E5E0] rounded-lg text-[#1A1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#B45309] w-36"
                    />

                    <div className="inline-flex items-center p-0.5 bg-[#FAF9F6] border border-[#E7E5E0] rounded-lg">
                      {(['ALL', StockStatus.InStock, StockStatus.LowStock, StockStatus.SoldOut] as const).map(
                        (st) => {
                          const active = stockFilter === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setStockFilter(st)}
                              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                active
                                  ? 'bg-white text-[#1A1917] border border-[#E7E5E0]'
                                  : 'text-[#57534E] hover:text-[#1A1917] border border-transparent'
                              }`}
                            >
                              {st === 'ALL' ? 'All' : st}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>

                {inventoryMessage && (
                  <div
                    role="status"
                    className="mt-4 px-4 py-2.5 rounded-lg bg-[#FAF9F6] border border-[#E7E5E0] text-xs font-medium text-[#1A1917]"
                  >
                    {inventoryMessage}
                  </div>
                )}

                {filteredInventory.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#57534E]">
                    No inventory items match the selected filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E7E5E0] text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
                          <th className="py-3 pr-4">Product &amp; SKU</th>
                          <th className="py-3 px-3 text-right">Price</th>
                          <th className="py-3 px-3 text-right">90D Sold</th>
                          <th className="py-3 px-3 text-right">Available</th>
                          <th className="py-3 px-3">Stock Status</th>
                          <th className="py-3 pl-3 text-right">Shelf Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E5E0] text-sm">
                        {filteredInventory.map((item) => {
                          const status = getStockStatus(item);
                          const isBusy = pendingItemId === item.id;
                          return (
                            <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                              <td className="py-3.5 pr-4">
                                <p className="font-medium text-[#1A1917]">{item.name}</p>
                                <p className="text-xs text-[#78716C] mt-0.5">
                                  <span className="font-mono">{item.sku}</span> · {item.variant}
                                </p>
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-[#1A1917] tabular-nums">
                                ${item.unitPrice}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-[#57534E] tabular-nums">
                                {item.unitsSold90d}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#1A1917] tabular-nums">
                                {item.stock}
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                {status === StockStatus.InStock && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
                                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>In Stock</span>
                                  </span>
                                )}
                                {status === StockStatus.LowStock && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B45309]">
                                    <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Low Stock (≤{item.reorderAt})</span>
                                  </span>
                                )}
                                {status === StockStatus.SoldOut && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B91C1C]">
                                    <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Sold Out</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={isBusy || item.stock === 0}
                                    onClick={() => handleStockAdjust(item, -1)}
                                    title="Log 1 unit sold"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded border border-[#E7E5E0] bg-white text-[#1A1917] hover:bg-[#FAF9F6] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-3 h-3" aria-hidden="true" />
                                    <span>1</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => handleStockAdjust(item, 5)}
                                    title="Restock 5 units"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded border border-[#E7E5E0] bg-[#FAF9F6] text-[#1A1917] hover:bg-[#EFECE6] disabled:opacity-40 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" aria-hidden="true" />
                                    <span>5</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

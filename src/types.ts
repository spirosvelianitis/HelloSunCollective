export enum TimePeriod {
  ThirtyDays = '30d',
  NinetyDays = '90d',
  SixMonths = '6m',
  OneYear = '1y',
}

export enum StockStatus {
  InStock = 'In Stock',
  LowStock = 'Low Stock',
  SoldOut = 'Sold Out',
}

export enum VendorCategory {
  All = 'All Crafts',
  Ceramics = 'Ceramics',
  Botanicals = 'Botanicals',
  Textiles = 'Textiles',
  Pantry = 'Pantry',
  Woodworking = 'Woodworking',
  PrintPaper = 'Print & Paper',
}

export enum EventCategory {
  All = 'All Events',
  Workshop = 'Workshops',
  Market = 'Markets',
  Tasting = 'Tastings',
  VendorHours = 'Vendor Hours',
}

export enum PartnershipType {
  ShelfSpace = 'Full-Time Shelf Space',
  WeekendPopUp = 'Weekend Pop-Up Booth',
  WorkshopHost = 'Community Workshop Host',
  WholesaleConsignment = 'Seasonal Consignment',
}

export interface SalesPoint {
  label: string;
  revenue: number;
  units: number;
  orders: number;
}

export interface PeriodSalesSummary {
  totalRevenue: number;
  priorRevenue: number;
  totalUnits: number;
  avgOrderValue: number;
  sellThroughRate: number;
  series: SalesPoint[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  variant: string;
  unitPrice: number;
  stock: number;
  reorderAt: number;
  unitsSold90d: number;
}

export interface Vendor {
  id: string;
  name: string;
  owner: string;
  category: Exclude<VendorCategory, VendorCategory.All>;
  studioLocation: string;
  joinedDate: string;
  bio: string;
  imageUrl: string;
  payoutShare: number;
  salesByPeriod: Record<TimePeriod, PeriodSalesSummary>;
  inventory: InventoryItem[];
}

export interface EventAttendee {
  name: string;
  email: string;
  registeredAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  category: Exclude<EventCategory, EventCategory.All>;
  host: string;
  location: string;
  description: string;
  capacity: number;
  registeredCount: number;
  priceLabel: string;
  attendees: EventAttendee[];
}

export interface PartnershipInquiry {
  id: string;
  referenceCode: string;
  brandName: string;
  contactName: string;
  email: string;
  website: string;
  category: Exclude<VendorCategory, VendorCategory.All>;
  partnershipType: PartnershipType;
  monthlyVolume: string;
  message: string;
  submittedAt: string;
  status: 'Received' | 'Under Review';
}

export interface CollectiveGoal {
  index: string;
  title: string;
  metric: string;
  description: string;
}

export interface CollectiveOverview {
  name: string;
  tagline: string;
  location: string;
  hours: string;
  ownerName: string;
  ownerRole: string;
  ownerEmail: string;
  storyParagraphs: string[];
  missionStatement: string;
  goals: CollectiveGoal[];
}

export interface CollectivePayload {
  overview: CollectiveOverview;
  vendors: Vendor[];
  events: CommunityEvent[];
  inquiries: PartnershipInquiry[];
}

export type UserRole   = 'seeker' | 'lister' | 'admin'
export type KycStatus  = 'pending' | 'in_review' | 'verified' | 'rejected'
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'sold' | 'rented' | 'rejected'
export type ListingType   = 'rent' | 'sale'
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed' | 'expired'
export type DisputeStatus = 'open' | 'under_review' | 'resolved_lister' | 'resolved_seeker' | 'closed'
export type ClosingStatus = 'pending' | 'paid' | 'disputed' | 'refunded'
export type ClosingType   = 'rent' | 'sale'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone?: string
  avatar_url?: string
  kyc_status: KycStatus
  kyc_submitted_at?: string
  kyc_reviewed_at?: string
  stripe_customer_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Market {
  id: string
  name: string
  slug: string
  country_code: string
  currency: string
  timezone: string
  is_active: boolean
  launched_at?: string
  default_deposit: number
  created_at: string
}

export interface Listing {
  id: string
  lister_id: string
  market_id: string
  listing_type: ListingType
  status: ListingStatus
  title: string
  description?: string
  price: number
  price_currency: string
  size_sqm?: number
  rooms?: number
  floor?: number
  address_street?: string
  address_city?: string
  address_zip?: string
  address_country: string
  smart_lock_type?: string
  has_live_camera: boolean
  view_count: number
  booking_count: number
  reviewed_by?: string
  reviewed_at?: string
  rejected_reason?: string
  created_at: string
  updated_at: string
  // joined
  lister?: Profile
  market?: Market
  images?: ListingImage[]
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  is_360: boolean
  is_cover: boolean
  sort_order: number
}

export interface Booking {
  id: string
  slot_id: string
  seeker_id: string
  listing_id: string
  status: BookingStatus
  deposit_amount: number
  deposit_captured: boolean
  deposit_released_at?: string
  lock_opened_at?: string
  lock_closed_at?: string
  damage_reported: boolean
  created_at: string
  // joined
  seeker?: Profile
  listing?: Listing
}

export interface Closing {
  id: string
  listing_id: string
  seeker_id: string
  lister_id: string
  market_id: string
  closing_type: ClosingType
  closing_price: number
  price_currency: string
  commission_rate: number
  commission_amount: number
  status: ClosingStatus
  paid_at?: string
  created_at: string
  // joined
  seeker?: Profile
  lister?: Profile
  listing?: Listing
}

export interface Dispute {
  id: string
  booking_id: string
  reported_by: string
  against_user_id: string
  status: DisputeStatus
  title: string
  description: string
  damage_amount?: number
  admin_id?: string
  decision?: string
  decision_amount?: number
  decision_notes?: string
  decided_at?: string
  created_at: string
  updated_at: string
  // joined
  reporter?: Profile
  against?: Profile
  booking?: Booking
}

export interface Service {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  price: number
  currency: string
  provider?: string
  is_active: boolean
  sort_order: number
}

// Placeholder for full DB type — extend as needed
export type Database = any

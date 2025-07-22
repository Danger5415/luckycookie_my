// Database schema and helper functions
import { supabase } from './supabase';
import type { Database } from './supabase';

// Extended database types
export interface ShippingAddress {
  id: string;
  user_id: string;
  prize_id: string;
  full_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  special_instructions?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  shipping_carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GumroadPurchase {
  id: string;
  user_id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  tier: string;
  price_usd: number;
  email: string;
  status: 'pending' | 'verified' | 'cracked' | 'shipped' | 'completed';
  purchase_data: any;
  created_at: string;
  updated_at: string;
}

export interface DynamicPrize {
  id: string;
  tier: string;
  source: 'manual';
  external_id?: string;
  name: string;
  description?: string;
  image_url: string;
  price_usd: number;
  affiliate_url?: string;
  commission_rate?: number;
  is_active: boolean;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_updated: string;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_at: string;
  updated_by: string;
}

export interface FreePrizeClaim {
  id: string;
  user_id: string;
  crack_history_id: string;
  prize_name: string;
  prize_value: number;
  claim_type: string;
  account_email: string;
  account_username?: string;
  phone_number?: string;
  platform_details: any;
  special_instructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  admin_notes?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Database helper functions
export class DatabaseService {
  // Shipping addresses
  static async createShippingAddress(data: Omit<ShippingAddress, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('shipping_addresses')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async updateShippingStatus(
    id: string, 
    status: ShippingAddress['status'], 
    trackingNumber?: string,
    carrier?: string
  ) {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (carrier) updateData.shipping_carrier = carrier;
    if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('shipping_addresses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getShippingAddresses(filters?: {
    status?: string;
    user_id?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('shipping_addresses')
      .select(`
        *,
        user_profiles (email),
        dynamic_prizes (name, image_url, price_usd)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Gumroad purchases
  static async createGumroadPurchase(data: Omit<GumroadPurchase, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('gumroad_purchases')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async updateGumroadPurchaseStatus(id: string, status: GumroadPurchase['status']) {
    const { data, error } = await supabase
      .from('gumroad_purchases')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getGumroadPurchases(filters?: {
    status?: string;
    user_id?: string;
    tier?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('gumroad_purchases')
      .select(`
        *,
        user_profiles (email)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.tier) query = query.eq('tier', filters.tier);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Free prize claims
  static async createFreePrizeClaim(data: Omit<FreePrizeClaim, 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from('free_prize_claims')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async updateFreePrizeClaimStatus(
    id: string, 
    status: FreePrizeClaim['status'], 
    adminNotes?: string
  ) {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (adminNotes) updateData.admin_notes = adminNotes;
    if (status === 'completed') updateData.processed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('free_prize_claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getFreePrizeClaims(filters?: {
    status?: string;
    user_id?: string;
    claim_type?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('free_prize_claims')
      .select(`
        *,
        user_profiles (email),
        crack_history (created_at)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.claim_type) query = query.eq('claim_type', filters.claim_type);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Dynamic prizes
  static async createDynamicPrize(data: Omit<DynamicPrize, 'id' | 'created_at'>) {
    const { data: result, error } = await supabase
      .from('dynamic_prizes')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async updateDynamicPrize(id: string, data: Partial<DynamicPrize>) {
    const { data: result, error } = await supabase
      .from('dynamic_prizes')
      .update({ 
        ...data, 
        last_updated: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async getDynamicPrizes(filters?: {
    tier?: string;
    is_active?: boolean;
    source?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('dynamic_prizes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.tier) query = query.eq('tier', filters.tier);
    if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active);
    // Only manual prizes are supported now
    query = query.eq('source', 'manual');
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getRandomPrizeByTier(tier: string): Promise<DynamicPrize | null> {
    const { data, error } = await supabase
      .from('dynamic_prizes')
      .select('*')
      .eq('tier', tier)
      .eq('is_active', true)
      .eq('source', 'manual')
      .eq('stock_status', 'in_stock');

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Return random prize from available options
    return data[Math.floor(Math.random() * data.length)];
  }

  // Get random free prize by price range
  static async getRandomFreePrizeByPriceRange(minPrice: number, maxPrice: number): Promise<DynamicPrize | null> {
    const { data, error } = await supabase
      .from('dynamic_prizes')
      .select('*')
      .eq('is_active', true)
      .eq('source', 'manual')
      .eq('stock_status', 'in_stock')
      .gte('price_usd', minPrice)
      .lte('price_usd', maxPrice);

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Return random prize from available options
    return data[Math.floor(Math.random() * data.length)];
  }

  // Get prizes for display (manual prizes only)
  static async getPrizesForTierDisplay(tier: string): Promise<DynamicPrize[]> {
    const prizes = await this.getDynamicPrizes({ 
      tier, 
      is_active: true,
      source: 'manual',
      limit: 10 
    });
    
    return prizes || [];
  }

  // Admin settings
  static async getAdminSetting(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) return null;
    return data?.value;
  }

  static async setAdminSetting(key: string, value: any, description?: string, updatedBy?: string) {
    const { data, error } = await supabase
      .from('admin_settings')
      .upsert({
        key,
        value,
        description,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics and reporting
  static async getAnalytics(dateRange?: { start: string; end: string }) {
    const queries = [];

    // Total users
    queries.push(
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
    );

    // Total cracks
    let crackQuery = supabase
      .from('crack_history')
      .select('*', { count: 'exact', head: true });

    if (dateRange) {
      crackQuery = crackQuery
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }
    queries.push(crackQuery);

    // Premium purchases
    let purchaseQuery = supabase
      .from('gumroad_purchases')
      .select('*', { count: 'exact', head: true });

    if (dateRange) {
      purchaseQuery = purchaseQuery
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);
    }
    queries.push(purchaseQuery);

    // Pending shipments
    queries.push(
      supabase
        .from('shipping_addresses')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'processing'])
    );

    const results = await Promise.all(queries);
    
    return {
      totalUsers: results[0].count || 0,
      totalCracks: results[1].count || 0,
      premiumPurchases: results[2].count || 0,
      pendingShipments: results[3].count || 0,
      pendingFreeClaims: 0 // Will be updated with actual query
    };
  }

  // Get analytics including free prize claims
  static async getExtendedAnalytics(dateRange?: { start: string; end: string }) {
    const basicAnalytics = await this.getAnalytics(dateRange);
    
    // Get pending free prize claims
    const { count: pendingFreeClaims } = await supabase
      .from('free_prize_claims')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'processing']);

    return {
      ...basicAnalytics,
      pendingFreeClaims: pendingFreeClaims || 0
    };
  }
}
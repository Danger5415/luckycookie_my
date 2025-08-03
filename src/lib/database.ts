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
  };

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

  // Prize notification system
  static async notifyPrizeWin(payload: {
    type: 'free_prize_win' | 'premium_prize_win' | 'free_prize_claim' | 'premium_shipping_info';
    user: {
      email: string;
      id: string;
    };
    prize: {
      name: string;
      value?: number;
      tier?: string;
      type?: string;
    };
    details?: {
      claimType?: string;
      accountEmail?: string;
      shippingAddress?: any;
      specialInstructions?: string;
    };
  }) {
    console.log('🔔 DatabaseService.notifyPrizeWin called with payload:', payload);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      console.log('📧 Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-prize-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
        }),
      });

      console.log('📧 Notification fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send prize notification:', errorText);
        console.error('📧 Full response details:', { status: response.status, statusText: response.statusText, errorText });
        // Don't throw error - notification failure shouldn't break the main flow
        return false;
      }

      const result = await response.json();
      console.log('Prize notification sent successfully:', result);
      console.log('📧 Notification sent successfully with result:', result);
      return true;
    } catch (error) {
      console.error('Error sending prize notification:', error);
      console.error('📧 Notification error details:', error);
      // Don't throw error - notification failure shouldn't break the main flow
      return false;
    }
  };

  // Share bonus system
  static async updateCrackHistoryShareStatus(crackHistoryId: string) {
    try {
      console.log('📝 Updating crack history share status for ID:', crackHistoryId);
      
      // First, get the current crack history record
      const { data: crackHistory, error: fetchError } = await supabase
        .from('crack_history')
        .select('prize_data')
        .eq('id', crackHistoryId)
        .single();

      if (fetchError) throw fetchError;
      console.log('📝 Retrieved crack history record');

      // Parse existing prize_data or create new object
      let prizeData = {};
      if (crackHistory.prize_data) {
        prizeData = typeof crackHistory.prize_data === 'string' 
          ? JSON.parse(crackHistory.prize_data) 
          : crackHistory.prize_data;
      }

      // Add share bonus applied flag
      prizeData = {
        ...prizeData,
        share_bonus_applied: true,
        share_bonus_applied_at: new Date().toISOString()
      };
      console.log('📝 Updated prize data with share bonus flag');

      // Update the record
      const { error: updateError } = await supabase
        .from('crack_history')
        .update({ prize_data: prizeData })
        .eq('id', crackHistoryId);

      if (updateError) throw updateError;
      console.log('✅ Successfully updated crack history share status');

      return true;
    } catch (error) {
      console.error('❌ Error updating crack history share status:', error);
      throw error;
    }
  }

  static async adjustLastCrackTime(userId: string, minutesToSubtract: number) {
    try {
      console.log('⏰ Adjusting last crack time for user:', userId, 'by', minutesToSubtract, 'minutes');
      
      // Get current user profile
      const { data: userProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('last_crack_time')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;
      console.log('⏰ Retrieved user profile for time adjustment');

      if (!userProfile.last_crack_time) {
        console.warn('⚠️ User has no last_crack_time, cannot adjust');
        return false;
      }

      // Calculate new time (subtract minutes)
      const currentTime = new Date(userProfile.last_crack_time);
      const adjustedTime = new Date(currentTime.getTime() - (minutesToSubtract * 60 * 1000));
      console.log('⏰ Calculated adjusted time:', adjustedTime.toISOString());

      // Update the user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ last_crack_time: adjustedTime.toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;
      console.log('✅ Successfully adjusted last crack time');

      return true;
    } catch (error) {
      console.error('❌ Error adjusting last crack time:', error);
      throw error;
    }
  }

  static async checkShareBonusApplied(crackHistoryId: string): Promise<boolean> {
    try {
      console.log('🔍 Checking share bonus status for crack:', crackHistoryId);
      
      const { data: crackHistory, error } = await supabase
        .from('crack_history')
        .select('prize_data')
        .eq('id', crackHistoryId)
        .single();

      if (error) throw error;

      if (!crackHistory.prize_data) return false;

      const prizeData = typeof crackHistory.prize_data === 'string' 
        ? JSON.parse(crackHistory.prize_data) 
        : crackHistory.prize_data;

      const bonusApplied = prizeData.share_bonus_applied === true;
      console.log('🔍 Share bonus status:', bonusApplied ? 'Already applied' : 'Not applied');
      
      return bonusApplied;
    } catch (error) {
      console.error('❌ Error checking share bonus status:', error);
      return false;
    }
  }

  // Bonus task system
  static async applyBonus(userId: string, bonusType: 'youtube_subscribe' | 'youtube_like_video' | 'youtube_watch_video') {
    try {
      console.log('🎁 Applying bonus:', bonusType, 'for user:', userId);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/apply-bonus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          user_id: userId,
          bonus_type: bonusType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply bonus');
      }

      const result = await response.json();
      console.log('✅ Bonus applied successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error applying bonus:', error);
      throw error;
    }
  }

  static async getUserClaimedBonuses(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_bonuses')
        .select('bonus_type, claimed_at')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bonuses:', error);
      return [];
    }
  }
}
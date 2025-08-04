// Database schema and helper functions
import { supabase } from './supabase';
import type { Database } from './supabase';
import { withTimeout } from '../utils/timeout';

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
    try {
      const { data: result, error } = await withTimeout(
        supabase
          .from('shipping_addresses')
          .insert(data)
          .select()
          .single(),
        10000,
        'Creating shipping address timed out'
      );

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating shipping address:', error);
      throw error;
    }
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

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('shipping_addresses')
          .update(updateData)
          .eq('id', id)
          .select()
          .single(),
        10000,
        'Updating shipping status timed out'
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating shipping status:', error);
      throw error;
    }
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

    try {
      const { data, error } = await withTimeout(
        query,
        15000,
        'Fetching shipping addresses timed out'
      );
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
      throw error;
    }
  }

  // Gumroad purchases
  static async createGumroadPurchase(data: Omit<GumroadPurchase, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: result, error } = await withTimeout(
        supabase
          .from('gumroad_purchases')
          .insert(data)
          .select()
          .single(),
        10000,
        'Creating Gumroad purchase timed out'
      );

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating Gumroad purchase:', error);
      throw error;
    }
  }

  static async updateGumroadPurchaseStatus(id: string, status: GumroadPurchase['status']) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('gumroad_purchases')
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()
          .single(),
        10000,
        'Updating Gumroad purchase status timed out'
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating Gumroad purchase status:', error);
      throw error;
    }
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

    try {
      const { data, error } = await withTimeout(
        query,
        15000,
        'Fetching Gumroad purchases timed out'
      );
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching Gumroad purchases:', error);
      throw error;
    }
  }

  // Free prize claims
  static async createFreePrizeClaim(data: Omit<FreePrizeClaim, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: result, error } = await withTimeout(
        supabase
          .from('free_prize_claims')
          .insert(data)
          .select()
          .single(),
        10000,
        'Creating free prize claim timed out'
      );

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating free prize claim:', error);
      throw error;
    }
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

    try {
      const { data, error } = await withTimeout(
        supabase
          .from('free_prize_claims')
          .update(updateData)
          .eq('id', id)
          .select()
          .single(),
        10000,
        'Updating free prize claim status timed out'
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating free prize claim status:', error);
      throw error;
    }
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

    try {
      const { data, error } = await withTimeout(
        query,
        15000,
        'Fetching free prize claims timed out'
      );
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching free prize claims:', error);
      throw error;
    }
  }

  // Dynamic prizes
  static async createDynamicPrize(data: Omit<DynamicPrize, 'id' | 'created_at'>) {
    try {
      const { data: result, error } = await withTimeout(
        supabase
          .from('dynamic_prizes')
          .insert(data)
          .select()
          .single(),
        10000,
        'Creating dynamic prize timed out'
      );

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating dynamic prize:', error);
      throw error;
    }
  }

  static async updateDynamicPrize(id: string, data: Partial<DynamicPrize>) {
    try {
      const { data: result, error } = await withTimeout(
        supabase
          .from('dynamic_prizes')
          .update({ 
            ...data, 
            last_updated: new Date().toISOString() 
          })
          .eq('id', id)
          .select()
          .single(),
        10000,
        'Updating dynamic prize timed out'
      );

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error updating dynamic prize:', error);
      throw error;
    }
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

    try {
      const { data, error } = await withTimeout(
        query,
        15000,
        'Fetching dynamic prizes timed out'
      );
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching dynamic prizes:', error);
      throw error;
    }
  }

  static async getRandomPrizeByTier(tier: string): Promise<DynamicPrize | null> {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('dynamic_prizes')
          .select('*')
          .eq('tier', tier)
          .eq('is_active', true)
          .eq('source', 'manual')
          .eq('stock_status', 'in_stock'),
        10000,
        'Fetching random prize by tier timed out'
      );

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Return random prize from available options
      return data[Math.floor(Math.random() * data.length)];
    } catch (error) {
      console.error('Error fetching random prize by tier:', error);
      throw error;
    }
  }

  // Get random free prize by price range
  static async getRandomFreePrizeByPriceRange(minPrice: number, maxPrice: number): Promise<DynamicPrize | null> {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('dynamic_prizes')
          .select('*')
          .eq('is_active', true)
          .eq('source', 'manual')
          .eq('stock_status', 'in_stock')
          .gte('price_usd', minPrice)
          .lte('price_usd', maxPrice),
        10000,
        'Fetching random free prize by price range timed out'
      );

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Return random prize from available options
      return data[Math.floor(Math.random() * data.length)];
    } catch (error) {
      console.error('Error fetching random free prize by price range:', error);
      throw error;
    }
  }

  // Get prizes for display (manual prizes only)
  static async getPrizesForTierDisplay(tier: string): Promise<DynamicPrize[]> {
    try {
      const prizes = await this.getDynamicPrizes({ 
        tier, 
        is_active: true,
        source: 'manual',
        limit: 10 
      });
      
      return prizes || [];
    } catch (error) {
      console.error('Error getting prizes for tier display:', error);
      throw error;
    }
  };

  // Admin settings
  static async getAdminSetting(key: string): Promise<any> {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('admin_settings')
          .select('value')
          .eq('key', key)
          .single(),
        8000,
        'Fetching admin setting timed out'
      );

      if (error) return null;
      return data?.value;
    } catch (error) {
      console.error('Error fetching admin setting:', error);
      return null;
    }
  }

  static async setAdminSetting(key: string, value: any, description?: string, updatedBy?: string) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('admin_settings')
          .upsert({
            key,
            value,
            description,
            updated_by: updatedBy,
            updated_at: new Date().toISOString()
          })
          .select()
          .single(),
        10000,
        'Setting admin setting timed out'
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting admin setting:', error);
      throw error;
    }
  }

  // Analytics and reporting
  static async getAnalytics(dateRange?: { start: string; end: string }) {
    const queries = [];

    // Total users
    queries.push(
      withTimeout(
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true }),
        10000,
        'Fetching user count timed out'
      )
    );

    // Total cracks
    let crackQuery = withTimeout(
      supabase
        .from('crack_history')
        .select('*', { count: 'exact', head: true }),
      10000,
      'Fetching crack count timed out'
    );

    if (dateRange) {
      crackQuery = withTimeout(
        supabase
          .from('crack_history')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end),
        10000,
        'Fetching filtered crack count timed out'
      );
    }
    queries.push(crackQuery);

    // Premium purchases
    let purchaseQuery = withTimeout(
      supabase
        .from('gumroad_purchases')
        .select('*', { count: 'exact', head: true }),
      10000,
      'Fetching purchase count timed out'
    );

    if (dateRange) {
      purchaseQuery = withTimeout(
        supabase
          .from('gumroad_purchases')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end),
        10000,
        'Fetching filtered purchase count timed out'
      );
    }
    queries.push(purchaseQuery);

    // Pending shipments
    queries.push(
      withTimeout(
        supabase
          .from('shipping_addresses')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing']),
        10000,
        'Fetching pending shipments count timed out'
      )
    );

    try {
      const results = await Promise.all(queries);
      
      return {
        totalUsers: results[0].count || 0,
        totalCracks: results[1].count || 0,
        premiumPurchases: results[2].count || 0,
        pendingShipments: results[3].count || 0,
        pendingFreeClaims: 0 // Will be updated with actual query
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Get analytics including free prize claims
  static async getExtendedAnalytics(dateRange?: { start: string; end: string }) {
    const basicAnalytics = await this.getAnalytics(dateRange);
    
    // Get pending free prize claims
    try {
      const { count: pendingFreeClaims } = await withTimeout(
        supabase
          .from('free_prize_claims')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'processing']),
        10000,
        'Fetching pending free claims count timed out'
      );

      return {
        ...basicAnalytics,
        pendingFreeClaims: pendingFreeClaims || 0
      };
    } catch (error) {
      console.error('Error fetching extended analytics:', error);
      throw error;
    }
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
      
      const response = await withTimeout(
        fetch(`${supabaseUrl}/functions/v1/send-prize-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString(),
          }),
        }),
        15000,
        'Prize notification request timed out'
      );

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
      const { data: crackHistory, error: fetchError } = await withTimeout(
        supabase
          .from('crack_history')
          .select('prize_data')
          .eq('id', crackHistoryId)
          .single(),
        8000,
        'Fetching crack history for share status update timed out'
      );

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
      const { error: updateError } = await withTimeout(
        supabase
          .from('crack_history')
          .update({ prize_data: prizeData })
          .eq('id', crackHistoryId),
        8000,
        'Updating crack history share status timed out'
      );

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
      const { data: userProfile, error: fetchError } = await withTimeout(
        supabase
          .from('user_profiles')
          .select('last_crack_time')
          .eq('id', userId)
          .single(),
        8000,
        'Fetching user profile for time adjustment timed out'
      );

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
      const { error: updateError } = await withTimeout(
        supabase
          .from('user_profiles')
          .update({ last_crack_time: adjustedTime.toISOString() })
          .eq('id', userId),
        8000,
        'Updating last crack time timed out'
      );

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
      
      const { data: crackHistory, error } = await withTimeout(
        supabase
          .from('crack_history')
          .select('prize_data')
          .eq('id', crackHistoryId)
          .single(),
        8000,
        'Checking share bonus status timed out'
      );

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
  static async applyBonus(userId: string, bonusType: 'youtube_subscribe' | 'youtube_like_video' | 'youtube_watch_video', videoId?: string) {
    try {
      console.log('🎁 Applying bonus:', bonusType, 'for user:', userId);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const requestBody: any = {
        user_id: userId,
        bonus_type: bonusType,
      };

      // Add video_id for video-based bonuses
      if ((bonusType === 'youtube_like_video' || bonusType === 'youtube_watch_video') && videoId) {
        requestBody.video_id = videoId;
      }

      const response = await withTimeout(
        fetch(`${supabaseUrl}/functions/v1/apply-bonus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }),
        15000,
        'Apply bonus request timed out'
      );

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
      const { data, error } = await withTimeout(
        supabase
          .from('user_bonuses')
          .select('bonus_type, claimed_at, video_id')
          .eq('user_id', userId),
        10000,
        'Fetching user claimed bonuses timed out'
      );

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bonuses:', error);
      return [];
    }
  }

  // Fetch latest YouTube video
  static async fetchLatestYouTubeVideo() {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await withTimeout(
        fetch(`${supabaseUrl}/functions/v1/fetch-latest-youtube-video`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }),
        20000,
        'Fetching latest YouTube video timed out'
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch latest YouTube video');
      }

      const result = await response.json();
      return result.video;
    } catch (error) {
      console.error('Error fetching latest YouTube video:', error);
      throw error;
    }
  }

  // Fetch latest X (Twitter) tweet
  static async fetchLatestTweet() {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await withTimeout(
        fetch(`${supabaseUrl}/functions/v1/fetch-latest-tweet`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }),
        20000,
        'Fetching latest tweet timed out'
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch latest tweet');
      }

      const result = await response.json();
      return result.tweet;
    } catch (error) {
      console.error('Error fetching latest tweet:', error);
      throw error;
    }
  }

  // Fetch latest TikTok video
  static async fetchLatestTikTok() {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await withTimeout(
        fetch(`${supabaseUrl}/functions/v1/fetch-latest-tiktok`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }),
        20000,
        'Fetching latest TikTok video timed out'
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch latest TikTok video');
      }

      const result = await response.json();
      return result.video;
    } catch (error) {
      console.error('Error fetching latest TikTok video:', error);
      throw error;
    }
  }
}
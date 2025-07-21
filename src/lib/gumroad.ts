// Gumroad integration for premium cookie purchases
import axios from 'axios';

import { supabase } from './supabase';

export interface GumroadProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  short_url: string;
  description: string;
  tags: string[];
  formatted_price: string;
  file_info: any;
  max_purchase_count: number | null;
  published: boolean;
  sales_count: number;
  sales_usd_cents: number;
  is_tiered_membership: boolean;
  recurrences: any[];
  variants: any[];
  preview_url: string | null;
  thumbnail_url: string | null;
  custom_permalink: string | null;
  custom_receipt: string | null;
  custom_summary: string | null;
  custom_fields: any[];
  shown_on_profile: boolean;
  require_shipping: boolean;
  view_count: number;
}

export interface GumroadSale {
  id: string;
  seller_id: string;
  product_id: string;
  product_name: string;
  permalink: string;
  product_permalink: string;
  email: string;
  price: number;
  gumroad_fee: number;
  currency: string;
  quantity: number;
  discover_fee_charged: boolean;
  can_contact: boolean;
  referrer: string;
  card: {
    visual: string;
    type: string;
    bin: string;
    expiry_month: string;
    expiry_year: string;
  };
  order_number: number;
  sale_id: string;
  sale_timestamp: string;
  purchaser_id: string;
  subscription_id: string | null;
  cancelled: boolean;
  disputed: boolean;
  dispute_won: boolean;
  refunded: boolean;
  chargebacked: boolean;
  download_count: number;
  custom_fields: Record<string, any>;
  variants_and_quantity: any;
  license_key: string;
  shipping_information: {
    name: string;
    address: string;
    city: string;
    state: string;
    country_code: string;
    zip: string;
  } | null;
  is_recurring_billing: boolean;
  is_preorder_authorization: boolean;
  is_gift_receiver_purchase: boolean;
  refunded_at: string | null;
  disputed_at: string | null;
  dispute_won_at: string | null;
  affiliate: any;
  affiliate_credit_amount_cents: number;
}

class GumroadAPI {
  private accessToken: string;
  private baseUrl = 'https://api.gumroad.com/v2';

  constructor() {
    this.accessToken = import.meta.env.VITE_GUMROAD_ACCESS_TOKEN || '';
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        ...(data && { data }),
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Gumroad API Error:', error);
      throw error;
    }
  }

  async getProducts(): Promise<GumroadProduct[]> {
    const response = await this.makeRequest('/products');
    return response.products || [];
  }

  async getProduct(productId: string): Promise<GumroadProduct | null> {
    try {
      const response = await this.makeRequest(`/products/${productId}`);
      return response.product || null;
    } catch (error) {
      return null;
    }
  }

  async getSales(after?: string, before?: string): Promise<GumroadSale[]> {
    let endpoint = '/sales';
    const params = new URLSearchParams();
    
    if (after) params.append('after', after);
    if (before) params.append('before', before);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const response = await this.makeRequest(endpoint);
    return response.sales || [];
  }

  async getSale(saleId: string): Promise<GumroadSale | null> {
    try {
      const response = await this.makeRequest(`/sales/${saleId}`);
      return response.sale || null;
    } catch (error) {
      return null;
    }
  }

  // Verify a purchase by checking if the sale exists and matches the user
  async verifyPurchase(saleId: string, userEmail: string): Promise<boolean> {
    try {
      // For now, check our local database since Gumroad API might not be configured
      // In production, you would also verify with Gumroad API
      
      // Check if purchase exists in our database
      const { data: purchase } = await supabase
        .from('gumroad_purchases')
        .select('*')
        .eq('sale_id', saleId)
        .eq('email', userEmail.toLowerCase())
        .single();
        
      return purchase !== null && purchase.status === 'verified';
    } catch (error) {
      console.error('Purchase verification error:', error);
      return false;
    }
  }

  // Get purchase URL for a specific tier
  getPurchaseUrl(tier: string, userEmail?: string, returnUrl?: string): string {
    // These will be replaced with actual Gumroad product URLs
    const productUrls: Record<string, string> = {
      bronze: 'https://653415968405.gumroad.com/l/amvjh',
      silver: 'https://653415968405.gumroad.com/l/samzj',
      gold: 'https://653415968405.gumroad.com/l/pjaep',
      sapphire: 'https://653415968405.gumroad.com/l/ncbkj',
      diamond: 'https://653415968405.gumroad.com/l/sfrvaq'
    };

    let url = productUrls[tier] || productUrls.bronze;
    
    // Add parameters if provided
    const params = new URLSearchParams();
    
    if (returnUrl) {
      params.append('return_to', returnUrl);
    }
    
    if (userEmail) {
      params.append('email', userEmail);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }
}

export const gumroadAPI = new GumroadAPI();

// Webhook handler for Gumroad sales (to be used in backend)
export interface GumroadWebhookPayload {
  seller_id: string;
  product_id: string;
  product_name: string;
  permalink: string;
  product_permalink: string;
  short_product_id: string;
  email: string;
  price: string;
  gumroad_fee: string;
  currency: string;
  quantity: string;
  discover_fee_charged: string;
  can_contact: string;
  referrer: string;
  card: string;
  order_number: string;
  sale_id: string;
  sale_timestamp: string;
  purchaser_id: string;
  subscription_id: string;
  variants: string;
  test: string;
  license_key: string;
  ip_country: string;
  is_recurring_charge: string;
  is_preorder_authorization: string;
  is_gift_receiver_purchase: string;
  refunded: string;
  disputed: string;
  dispute_won: string;
  affiliate: string;
  affiliate_credit_amount_cents: string;
  variants_and_quantity: string;
  product_rating: string;
  reviews_count: string;
  average_rating: string;
  custom_fields: Record<string, string>;
}

export const validateGumroadWebhook = (payload: GumroadWebhookPayload): boolean => {
  // Basic validation - in production, you'd verify the webhook signature
  return !!(payload.sale_id && payload.email && payload.product_id);
};
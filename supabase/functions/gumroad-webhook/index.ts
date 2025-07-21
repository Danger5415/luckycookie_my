import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse webhook payload
    const payload = await req.json()
    
    // Log the webhook for debugging
    await supabaseClient
      .from('webhook_logs')
      .insert({
        source: 'gumroad',
        event_type: 'sale',
        payload: payload,
        processed: false
      })

    // Extract relevant data from Gumroad webhook
    const {
      sale_id,
      product_id,
      product_name,
      email,
      price,
      purchaser_id,
      product_permalink
    } = payload

    // Determine tier from product permalink or product_id
    let tier = 'bronze' // default
    if (product_permalink) {
      if (product_permalink.includes('amvjh')) tier = 'bronze'
      else if (product_permalink.includes('samzj')) tier = 'silver'
      else if (product_permalink.includes('pjaep')) tier = 'gold'
      else if (product_permalink.includes('ncbkj')) tier = 'sapphire'
      else if (product_permalink.includes('sfrvaq')) tier = 'diamond'
    }

    // Find user by email
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userProfile) {
      // Store purchase in database
      const { error: purchaseError } = await supabaseClient
        .from('gumroad_purchases')
        .upsert({
          user_id: userProfile.id,
          sale_id: sale_id,
          product_id: product_id || `luckycookie-${tier}`,
          product_name: product_name || `LuckyCookie ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`,
          tier: tier,
          price_usd: parseFloat(price) || 0,
          email: email,
          status: 'verified',
          purchase_data: payload
        }, {
          onConflict: 'sale_id'
        })

      if (purchaseError) {
        console.error('Error storing purchase:', purchaseError)
        throw purchaseError
      }

      // Mark webhook as processed
      await supabaseClient
        .from('webhook_logs')
        .update({ processed: true })
        .eq('source', 'gumroad')
        .eq('payload->sale_id', sale_id)

      return new Response(
        JSON.stringify({ success: true, message: 'Purchase recorded successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      // User not found - they might purchase before creating account
      console.log('User not found for email:', email)
      
      return new Response(
        JSON.stringify({ success: true, message: 'Webhook received, user will be linked when they sign up' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
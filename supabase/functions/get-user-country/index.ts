import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface GeolocationResponse {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  ip: string;
  success: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract IP address from request headers
    // Edge Functions provide the real client IP through these headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
              req.headers.get('x-real-ip') ||
              req.headers.get('cf-connecting-ip') ||
              req.headers.get('x-client-ip') ||
              'unknown'

    console.log('Detected IP address:', ip)

    // Handle localhost/development cases
    if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      console.log('Local/development IP detected, returning default country')
      return new Response(
        JSON.stringify({ 
          country: 'United States',
          countryCode: 'US',
          ip: ip,
          success: true,
          note: 'Default country for local/development environment'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Use ip-api.com for geolocation (free service with good accuracy)
    // Note: For production with high traffic, consider upgrading to a paid service
    const geoApiUrl = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,city,query`
    
    console.log('Calling geolocation API:', geoApiUrl)
    
    const geoResponse = await fetch(geoApiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'LuckyCookie.io/1.0'
      }
    })

    if (!geoResponse.ok) {
      console.error('Geolocation API request failed:', geoResponse.status, geoResponse.statusText)
      throw new Error(`Geolocation API request failed: ${geoResponse.status}`)
    }

    const geoData = await geoResponse.json()
    console.log('Geolocation API response:', geoData)

    if (geoData.status === 'success' && geoData.country) {
      const result: GeolocationResponse = {
        country: geoData.country,
        countryCode: geoData.countryCode || 'Unknown',
        region: geoData.region,
        city: geoData.city,
        ip: geoData.query || ip,
        success: true
      }

      console.log('Successfully determined country:', result.country)

      return new Response(
        JSON.stringify(result),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      // Geolocation failed, return fallback
      console.warn('Geolocation API returned failure or no country:', geoData)
      
      return new Response(
        JSON.stringify({ 
          country: 'Unknown',
          countryCode: 'XX',
          ip: ip,
          success: false,
          error: geoData.message || 'Geolocation failed',
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

  } catch (error) {
    console.error('Get user country error:', error)
    
    // Return fallback response on any error
    return new Response(
      JSON.stringify({ 
        country: 'Unknown',
        countryCode: 'XX',
        ip: 'unknown',
        success: false,
        error: error.message,
        fallback: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})
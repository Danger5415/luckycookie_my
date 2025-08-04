import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface TwitterTweet {
  id: string;
  text: string;
  url: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
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

    // Get environment variables
    const twitterApiKey = Deno.env.get('TWITTER_API_KEY')
    const twitterApiSecret = Deno.env.get('TWITTER_API_SECRET')
    const twitterUsername = Deno.env.get('TWITTER_USERNAME') || 'LuckyCook13'

    if (!twitterApiKey || !twitterApiSecret) {
      // Return fallback response when API credentials are missing
      return new Response(
        JSON.stringify({
          success: true,
          tweet: {
            id: 'fallback_tweet',
            text: 'Follow us for the latest updates and bonus opportunities!',
            url: `https://twitter.com/${twitterUsername}`,
            created_at: new Date().toISOString()
          },
          profile_url: `https://twitter.com/${twitterUsername}`,
          fallback: true,
          reason: 'API credentials not configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Create OAuth 1.0a signature for Twitter API v1.1
    // For simplicity, we'll use a basic approach to get user timeline
    const bearerToken = btoa(`${twitterApiKey}:${twitterApiSecret}`)
    
    // First, get an application-only bearer token
    const tokenResponse = await fetch('https://api.twitter.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${bearerToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Twitter token error:', errorText)
      
      // Return fallback response when authentication fails
      return new Response(
        JSON.stringify({
          success: true,
          tweet: {
            id: 'fallback_tweet',
            text: 'Follow us for the latest updates and bonus opportunities!',
            url: `https://twitter.com/${twitterUsername}`,
            created_at: new Date().toISOString()
          },
          profile_url: `https://twitter.com/${twitterUsername}`,
          fallback: true,
          reason: 'Authentication failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user ID first
    const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${twitterUsername}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('Twitter user lookup error:', errorText)
      
      // Return fallback response when user lookup fails (including rate limiting)
      return new Response(
        JSON.stringify({
          success: true,
          tweet: {
            id: 'fallback_tweet',
            text: 'Follow us for the latest updates and bonus opportunities!',
            url: `https://twitter.com/${twitterUsername}`,
            created_at: new Date().toISOString()
          },
          profile_url: `https://twitter.com/${twitterUsername}`,
          fallback: true,
          reason: 'User lookup failed or rate limited'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const userData = await userResponse.json()
    const userId = userData.data?.id

    if (!userId) {
      // Return fallback response when user ID is not found
      return new Response(
        JSON.stringify({
          success: true,
          tweet: {
            id: 'fallback_tweet',
            text: 'Follow us for the latest updates and bonus opportunities!',
            url: `https://twitter.com/${twitterUsername}`,
            created_at: new Date().toISOString()
          },
          profile_url: `https://twitter.com/${twitterUsername}`,
          fallback: true,
          reason: 'User ID not found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Fetch latest tweet from user timeline
    const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,public_metrics`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text()
      console.error('Twitter tweets error:', errorText)
      
      // Return fallback response when tweets fetch fails
      return new Response(
        JSON.stringify({
          success: true,
          tweet: {
            id: 'fallback_tweet',
            text: 'Follow us for the latest updates and bonus opportunities!',
            url: `https://twitter.com/${twitterUsername}`,
            created_at: new Date().toISOString()
          },
          profile_url: `https://twitter.com/${twitterUsername}`,
          fallback: true,
          reason: 'Failed to fetch tweets'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const tweetsData = await tweetsResponse.json()

    if (!tweetsData.data || tweetsData.data.length === 0) {
      // Return fallback response when no tweets are found
      return new Response(
        JSON.stringify({
          success: true,
          tweet: {
            id: 'fallback_tweet',
            text: 'Follow us for the latest updates and bonus opportunities!',
            url: `https://twitter.com/${twitterUsername}`,
            created_at: new Date().toISOString()
          },
          profile_url: `https://twitter.com/${twitterUsername}`,
          fallback: true,
          reason: 'No tweets found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const latestTweet = tweetsData.data[0]
    const tweetData: TwitterTweet = {
      id: latestTweet.id,
      text: latestTweet.text,
      url: `https://twitter.com/${twitterUsername}/status/${latestTweet.id}`,
      created_at: latestTweet.created_at,
      public_metrics: latestTweet.public_metrics
    }

    return new Response(
      JSON.stringify({
        success: true,
        tweet: tweetData,
        profile_url: `https://twitter.com/${twitterUsername}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Fetch latest tweet error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch latest tweet',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
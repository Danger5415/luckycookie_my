import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface TikTokVideo {
  id: string;
  title: string;
  url: string;
  created_at: string;
  thumbnail?: string;
  stats?: {
    like_count: number;
    view_count: number;
    share_count: number;
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
    const tiktokAccessToken = Deno.env.get('TIKTOK_ACCESS_TOKEN')
    const tiktokUsername = Deno.env.get('TIKTOK_USERNAME') || 'luckycookieio'

    if (!tiktokAccessToken) {
      return new Response(
        JSON.stringify({ 
          error: 'TikTok API configuration missing',
          details: 'TIKTOK_ACCESS_TOKEN must be set'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // TikTok API endpoint for user videos
    const tiktokApiUrl = `https://open-api.tiktok.com/v2/video/list/?fields=id,title,create_time,cover_image_url,like_count,view_count,share_count&max_count=1`

    const response = await fetch(tiktokApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tiktokAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_count: 1,
        cursor: 0
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('TikTok API error:', errorText)
      
      // If TikTok API fails, return a fallback response
      return new Response(
        JSON.stringify({
          success: true,
          video: {
            id: 'fallback_video',
            title: 'Latest TikTok Video',
            url: `https://www.tiktok.com/@${tiktokUsername}`,
            created_at: new Date().toISOString(),
            thumbnail: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          profile_url: `https://www.tiktok.com/@${tiktokUsername}`,
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const data = await response.json()

    if (!data.data || !data.data.videos || data.data.videos.length === 0) {
      // Return fallback if no videos found
      return new Response(
        JSON.stringify({
          success: true,
          video: {
            id: 'fallback_video',
            title: 'Latest TikTok Video',
            url: `https://www.tiktok.com/@${tiktokUsername}`,
            created_at: new Date().toISOString(),
            thumbnail: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400'
          },
          profile_url: `https://www.tiktok.com/@${tiktokUsername}`,
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const latestVideo = data.data.videos[0]
    const videoData: TikTokVideo = {
      id: latestVideo.id,
      title: latestVideo.title || 'Latest TikTok Video',
      url: `https://www.tiktok.com/@${tiktokUsername}/video/${latestVideo.id}`,
      created_at: new Date(latestVideo.create_time * 1000).toISOString(),
      thumbnail: latestVideo.cover_image_url,
      stats: {
        like_count: latestVideo.like_count || 0,
        view_count: latestVideo.view_count || 0,
        share_count: latestVideo.share_count || 0
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        video: videoData,
        profile_url: `https://www.tiktok.com/@${tiktokUsername}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Fetch latest TikTok video error:', error)
    
    // Return fallback on any error
    const tiktokUsername = Deno.env.get('TIKTOK_USERNAME') || 'luckycookieio'
    
    return new Response(
      JSON.stringify({
        success: true,
        video: {
          id: 'fallback_video',
          title: 'Latest TikTok Video',
          url: `https://www.tiktok.com/@${tiktokUsername}`,
          created_at: new Date().toISOString(),
          thumbnail: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        profile_url: `https://www.tiktok.com/@${tiktokUsername}`,
        fallback: true,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})
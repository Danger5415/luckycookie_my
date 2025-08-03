import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnail: string;
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
    const youtubeApiKey = Deno.env.get('VITE_YOUTUBE_API_KEY')
    const channelId = Deno.env.get('VITE_YOUTUBE_CHANNEL_ID')

    if (!youtubeApiKey || !channelId) {
      return new Response(
        JSON.stringify({ 
          error: 'YouTube API configuration missing',
          details: 'VITE_YOUTUBE_API_KEY and VITE_YOUTUBE_CHANNEL_ID must be set'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch latest video from YouTube Data API v3
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}&channelId=${channelId}&part=snippet&order=date&type=video&maxResults=1`

    const response = await fetch(youtubeApiUrl)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('YouTube API error:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch from YouTube API',
          details: `HTTP ${response.status}: ${errorText}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No videos found',
          details: 'No videos found on the specified channel'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const latestVideo = data.items[0]
    const videoData: YouTubeVideo = {
      id: latestVideo.id.videoId,
      title: latestVideo.snippet.title,
      url: `https://www.youtube.com/watch?v=${latestVideo.id.videoId}`,
      publishedAt: latestVideo.snippet.publishedAt,
      thumbnail: latestVideo.snippet.thumbnails.medium?.url || latestVideo.snippet.thumbnails.default?.url
    }

    return new Response(
      JSON.stringify({
        success: true,
        video: videoData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Fetch latest YouTube video error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch latest YouTube video',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
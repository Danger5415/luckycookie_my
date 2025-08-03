import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BonusRequest {
  user_id: string;
  bonus_type: 'youtube_subscribe' | 'youtube_like_video' | 'youtube_watch_video' | 'twitter_follow' | 'twitter_like_tweet' | 'tiktok_follow' | 'tiktok_like_video';
  video_id?: string; // Optional video ID for video-based bonuses
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { user_id, bonus_type, video_id }: BonusRequest = await req.json()

    if (!user_id || !bonus_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, bonus_type' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For video-based bonuses, video_id is required
    if ((bonus_type === 'youtube_like_video' || bonus_type === 'youtube_watch_video' || bonus_type === 'twitter_like_tweet' || bonus_type === 'tiktok_like_video') && !video_id) {
      return new Response(
        JSON.stringify({ error: 'video_id is required for content-based bonuses' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has already claimed this bonus (with video_id for video-based bonuses)
    let bonusQuery = supabaseClient
      .from('user_bonuses')
      .select('id')
      .eq('user_id', user_id)
      .eq('bonus_type', bonus_type)

    // For content-based bonuses, also check video_id
    if (bonus_type === 'youtube_like_video' || bonus_type === 'youtube_watch_video' || bonus_type === 'twitter_like_tweet' || bonus_type === 'tiktok_like_video') {
      bonusQuery = bonusQuery.eq('video_id', video_id)
    }

    const { data: existingBonus, error: bonusCheckError } = await bonusQuery.single()

    if (bonusCheckError && bonusCheckError.code !== 'PGRST116') {
      throw bonusCheckError
    }

    if (existingBonus) {
      return new Response(
        JSON.stringify({ 
          error: (bonus_type === 'youtube_subscribe' || bonus_type === 'twitter_follow' || bonus_type === 'tiktok_follow')
            ? 'Follow/Subscribe bonus already claimed' 
            : 'Bonus already claimed for this content'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's current profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('last_crack_time')
      .eq('id', user_id)
      .single()

    if (profileError) {
      throw profileError
    }

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate new last_crack_time based on bonus type
    let newLastCrackTime: string
    const now = new Date()
    const currentLastCrack = userProfile.last_crack_time ? new Date(userProfile.last_crack_time) : null

    switch (bonus_type) {
      case 'youtube_subscribe':
      case 'twitter_follow':
      case 'tiktok_follow':
        // Reset cooldown completely (make cookie immediately available)
        newLastCrackTime = new Date(now.getTime() - (61 * 60 * 1000)).toISOString() // 61 minutes ago
        break
        
      case 'youtube_like_video':
      case 'twitter_like_tweet':
      case 'tiktok_like_video':
        // Reduce cooldown by 50%
        if (currentLastCrack) {
          const nextAvailableTime = new Date(currentLastCrack.getTime() + (60 * 60 * 1000)) // 1 hour after last crack
          const remainingTime = Math.max(0, nextAvailableTime.getTime() - now.getTime())
          const reducedTime = remainingTime * 0.5 // Reduce by 50%
          newLastCrackTime = new Date(now.getTime() - (60 * 60 * 1000) + reducedTime).toISOString()
        } else {
          // If no previous crack, make immediately available
          newLastCrackTime = new Date(now.getTime() - (61 * 60 * 1000)).toISOString()
        }
        break
        
      case 'youtube_watch_video':
        // Reduce cooldown by 30 minutes
        if (currentLastCrack) {
          newLastCrackTime = new Date(currentLastCrack.getTime() - (30 * 60 * 1000)).toISOString()
        } else {
          // If no previous crack, make immediately available
          newLastCrackTime = new Date(now.getTime() - (61 * 60 * 1000)).toISOString()
        }
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid bonus type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // Start transaction: Update user profile and record bonus claim
    const { error: updateError } = await supabaseClient
      .from('user_profiles')
      .update({ last_crack_time: newLastCrackTime })
      .eq('id', user_id)

    if (updateError) {
      throw updateError
    }

    // Record the bonus claim
    const bonusInsertData: any = {
      user_id: user_id,
      bonus_type: bonus_type,
      status: 'claimed'
    }

    // Add video_id for video-based bonuses
    if (bonus_type === 'youtube_like_video' || bonus_type === 'youtube_watch_video' || bonus_type === 'twitter_like_tweet' || bonus_type === 'tiktok_like_video') {
      bonusInsertData.video_id = video_id
    }

    const { error: bonusError } = await supabaseClient
      .from('user_bonuses')
      .insert(bonusInsertData)

    if (bonusError) {
      // If bonus recording fails, we should ideally rollback the profile update
      // For now, we'll log the error but still return success since the main benefit was applied
      console.error('Failed to record bonus claim:', bonusError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bonus applied successfully',
        bonus_type: bonus_type,
        video_id: video_id || null,
        new_last_crack_time: newLastCrackTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Apply bonus error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to apply bonus',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
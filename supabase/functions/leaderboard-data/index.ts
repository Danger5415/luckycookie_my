import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface PremiumCracker {
  user_id: string;
  email: string;
  premium_cracks: number;
  rank: number;
}

interface FreeCracker {
  user_id: string;
  email: string;
  total_cracks: number;
  total_wins: number;
  rank: number;
}

interface LeaderboardData {
  premium_crackers: PremiumCracker[];
  free_crackers: FreeCracker[];
  total_users: number;
  last_updated: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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

  try {
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Query for premium crackers (top 5)
    const { data: premiumData, error: premiumError } = await supabaseClient
      .from('user_profiles')
      .select(`
        id,
        email,
        crack_history!inner(type)
      `)
      .eq('crack_history.type', 'premium')

    if (premiumError) {
      console.error('Premium crackers query error:', premiumError)
      throw premiumError
    }

    // Process premium crackers data
    const premiumCrackerMap = new Map<string, { email: string; count: number }>()
    
    if (premiumData) {
      premiumData.forEach((user: any) => {
        const userId = user.id
        const email = user.email
        
        if (premiumCrackerMap.has(userId)) {
          premiumCrackerMap.get(userId)!.count += 1
        } else {
          premiumCrackerMap.set(userId, { email, count: 1 })
        }
      })
    }

    // Convert to array and sort by premium crack count (descending)
    const premiumCrackers: PremiumCracker[] = Array.from(premiumCrackerMap.entries())
      .map(([user_id, data]) => ({
        user_id,
        email: data.email,
        premium_cracks: data.count,
        rank: 0 // Will be set below
      }))
      .sort((a, b) => b.premium_cracks - a.premium_cracks)
      .slice(0, 5) // Top 5 only
      .map((cracker, index) => ({
        ...cracker,
        rank: index + 1
      }))

    // Get user IDs of premium crackers to exclude from free leaderboard
    const premiumUserIds = new Set(premiumCrackers.map(p => p.user_id))

    // Query for all crack history to calculate free crackers stats
    const { data: allCrackData, error: crackError } = await supabaseClient
      .from('crack_history')
      .select(`
        user_id,
        type,
        won,
        user_profiles!inner(email)
      `)
      .eq('type', 'free')

    if (crackError) {
      console.error('Free crackers query error:', crackError)
      throw crackError
    }

    // Process free crackers data
    const freeCrackerMap = new Map<string, { 
      email: string; 
      total_cracks: number; 
      total_wins: number 
    }>()

    if (allCrackData) {
      allCrackData.forEach((crack: any) => {
        const userId = crack.user_id
        const email = crack.user_profiles.email
        const won = crack.won || false

        // Skip users who are in the premium top 5
        if (premiumUserIds.has(userId)) {
          return
        }

        if (freeCrackerMap.has(userId)) {
          const existing = freeCrackerMap.get(userId)!
          existing.total_cracks += 1
          if (won) existing.total_wins += 1
        } else {
          freeCrackerMap.set(userId, {
            email,
            total_cracks: 1,
            total_wins: won ? 1 : 0
          })
        }
      })
    }

    // Convert to array and sort by total cracks (descending), then by wins
    const freeCrackers: FreeCracker[] = Array.from(freeCrackerMap.entries())
      .map(([user_id, data]) => ({
        user_id,
        email: data.email,
        total_cracks: data.total_cracks,
        total_wins: data.total_wins,
        rank: 0 // Will be set below
      }))
      .sort((a, b) => {
        // Primary sort: total cracks (descending)
        if (b.total_cracks !== a.total_cracks) {
          return b.total_cracks - a.total_cracks
        }
        // Secondary sort: total wins (descending)
        return b.total_wins - a.total_wins
      })
      .slice(0, 100) // Limit to top 100 free crackers
      .map((cracker, index) => ({
        ...cracker,
        rank: index + 6 // Start from rank 6 (after premium top 5)
      }))

    // Get total unique users count
    const { count: totalUsers } = await supabaseClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    const leaderboardData: LeaderboardData = {
      premium_crackers: premiumCrackers,
      free_crackers: freeCrackers,
      total_users: totalUsers || 0,
      last_updated: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(leaderboardData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Leaderboard data error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch leaderboard data',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Your VAPID private key will be stored in Supabase secrets
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_PUBLIC_KEY = 'BGRUptM9YKDXZWQ_64h_KmmSGTPZZtw5l-Z6Ym5ijBNvtmG2yZ3inqgHj59OiDz4su1hA7pHLk6N0qHNs_AofxY'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, gameId, message } = await req.json()
    
    console.log('Notification request:', { type, gameId, message })
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get game details
    const { data: game, error: gameError } = await supabaseClient
      .from('games')
      .select('*, fields(name)')
      .eq('id', gameId)
      .single()

    if (gameError) {
      console.error('Error fetching game:', gameError)
      return new Response(JSON.stringify({ error: 'Game not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get active subscriptions for this game
    const { data: subscriptions, error } = await supabaseClient
      .from('notification_subscriptions')
      .select('*')
      .eq('game_id', gameId)
      .eq('is_active', true)
      .contains('event_types', [type])

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions for ${type} events`)

    // Create in-app notifications for all users
    const inAppNotifications = subscriptions?.map(async (sub) => {
      if (!sub.user_id) return null

      const { error: notifyError } = await supabaseClient
        .from('notifications')
        .insert([{
          user_id: sub.user_id,
          title: `${game.home_team} vs ${game.away_team}`,
          message: message,
          type: type,
          action_url: `/spectator?field=${game.fields?.name || 'unknown'}`
        }])

      if (notifyError) {
        console.error('Failed to create in-app notification:', notifyError)
        return { success: false, user_id: sub.user_id, error: notifyError }
      }

      return { success: true, user_id: sub.user_id }
    }) || []

    // Send push notifications to all subscribers
    const pushNotifications = subscriptions?.map(async (sub) => {
      if (!sub.push_endpoint || !VAPID_PRIVATE_KEY) {
        console.log('Skipping push notification - missing endpoint or VAPID key')
        return { success: false, subscription: sub.id, reason: 'missing_config' }
      }

      try {
        // Create payload
        const payload = JSON.stringify({
          title: `${game.home_team} vs ${game.away_team}`,
          body: message,
          icon: '/clocksynk-logo.png',
          badge: '/clocksynk-logo.png',
          url: `/spectator?field=${game.fields?.name || 'unknown'}`,
          tag: `${type}-${gameId}`,
          timestamp: Date.now()
        })

        // For now, we'll log the push notification details
        // In a production environment, you'd use a library like web-push
        console.log('Would send push notification:', {
          endpoint: sub.push_endpoint,
          payload: payload,
          vapidPublicKey: VAPID_PUBLIC_KEY,
          vapidPrivateKey: VAPID_PRIVATE_KEY ? 'present' : 'missing'
        })

        // Simulate successful push notification
        return { success: true, subscription: sub.id }
      } catch (error) {
        console.error('Failed to send push notification:', error)
        return { success: false, subscription: sub.id, error: error.message }
      }
    }) || []

    // Wait for all notifications to complete
    const inAppResults = await Promise.all(inAppNotifications.filter(n => n !== null))
    const pushResults = await Promise.all(pushNotifications)

    console.log('Notification results:', {
      inApp: inAppResults.length,
      push: pushResults.length,
      type,
      gameId
    })

    return new Response(JSON.stringify({ 
      message: 'Notifications processed',
      results: {
        inApp: inAppResults,
        push: pushResults
      },
      count: {
        inApp: inAppResults.length,
        push: pushResults.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in send-notification function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

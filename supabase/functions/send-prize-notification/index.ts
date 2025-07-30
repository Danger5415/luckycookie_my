import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NotificationPayload {
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
  timestamp: string;
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

    // Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const recipientEmail = Deno.env.get('NOTIFICATION_EMAIL_RECIPIENT') || 'originaluckycookie.site@gmail.com'
    const senderEmail = Deno.env.get('NOTIFICATION_EMAIL_SENDER') || 'noreply@luckycookie.site'

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const payload: NotificationPayload = await req.json()

    // Generate email content based on notification type
    let subject = ''
    let htmlContent = ''

    switch (payload.type) {
      case 'free_prize_win':
        subject = `🎉 Free Prize Won - ${payload.prize.name}`
        htmlContent = `
          <h2>🍪 Free Prize Won on LuckyCookie.io!</h2>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Prize Details:</h3>
            <ul>
              <li><strong>Prize:</strong> ${payload.prize.name}</li>
              <li><strong>Value:</strong> $${payload.prize.value || 'N/A'}</li>
              <li><strong>Tier:</strong> Free</li>
            </ul>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Winner Details:</h3>
            <ul>
              <li><strong>User Email:</strong> ${payload.user.email}</li>
              <li><strong>User ID:</strong> ${payload.user.id}</li>
              <li><strong>Won At:</strong> ${new Date(payload.timestamp).toLocaleString()}</li>
            </ul>
          </div>
          <p><strong>Action Required:</strong> Check the admin panel to process this free prize win.</p>
        `
        break

      case 'premium_prize_win':
        subject = `👑 Premium Prize Won - ${payload.prize.name} (${payload.prize.tier?.toUpperCase()})`
        htmlContent = `
          <h2>🍪 Premium Prize Won on LuckyCookie.io!</h2>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Prize Details:</h3>
            <ul>
              <li><strong>Prize:</strong> ${payload.prize.name}</li>
              <li><strong>Value:</strong> $${payload.prize.value || 'N/A'}</li>
              <li><strong>Tier:</strong> ${payload.prize.tier?.toUpperCase() || 'Premium'}</li>
            </ul>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Winner Details:</h3>
            <ul>
              <li><strong>User Email:</strong> ${payload.user.email}</li>
              <li><strong>User ID:</strong> ${payload.user.id}</li>
              <li><strong>Won At:</strong> ${new Date(payload.timestamp).toLocaleString()}</li>
            </ul>
          </div>
          <p><strong>Action Required:</strong> User will provide shipping information. Check the admin panel to process this premium prize.</p>
        `
        break

      case 'free_prize_claim':
        subject = `📋 Free Prize Claim Submitted - ${payload.prize.name}`
        htmlContent = `
          <h2>🍪 Free Prize Claim Submitted on LuckyCookie.io!</h2>
          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Prize Details:</h3>
            <ul>
              <li><strong>Prize:</strong> ${payload.prize.name}</li>
              <li><strong>Value:</strong> $${payload.prize.value || 'N/A'}</li>
              <li><strong>Claim Type:</strong> ${payload.details?.claimType || 'N/A'}</li>
            </ul>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Claimant Details:</h3>
            <ul>
              <li><strong>User Email:</strong> ${payload.user.email}</li>
              <li><strong>Account Email:</strong> ${payload.details?.accountEmail || 'N/A'}</li>
              <li><strong>User ID:</strong> ${payload.user.id}</li>
              <li><strong>Claimed At:</strong> ${new Date(payload.timestamp).toLocaleString()}</li>
            </ul>
          </div>
          ${payload.details?.specialInstructions ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Special Instructions:</h3>
              <p>${payload.details.specialInstructions}</p>
            </div>
          ` : ''}
          <p><strong>Action Required:</strong> Process this free prize claim in the admin panel and deliver the prize to the provided account email.</p>
        `
        break

      case 'premium_shipping_info':
        subject = `📦 Premium Prize Shipping Info - ${payload.prize.name}`
        htmlContent = `
          <h2>🍪 Premium Prize Shipping Information Submitted!</h2>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Prize Details:</h3>
            <ul>
              <li><strong>Prize:</strong> ${payload.prize.name}</li>
              <li><strong>Value:</strong> $${payload.prize.value || 'N/A'}</li>
              <li><strong>Tier:</strong> ${payload.prize.tier?.toUpperCase() || 'Premium'}</li>
            </ul>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Winner Details:</h3>
            <ul>
              <li><strong>User Email:</strong> ${payload.user.email}</li>
              <li><strong>User ID:</strong> ${payload.user.id}</li>
              <li><strong>Submitted At:</strong> ${new Date(payload.timestamp).toLocaleString()}</li>
            </ul>
          </div>
          ${payload.details?.shippingAddress ? `
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Shipping Address:</h3>
              <p><strong>Name:</strong> ${payload.details.shippingAddress.full_name}</p>
              <p><strong>Email:</strong> ${payload.details.shippingAddress.email}</p>
              <p><strong>Phone:</strong> ${payload.details.shippingAddress.phone}</p>
              <p><strong>Address:</strong><br>
                ${payload.details.shippingAddress.address_line_1}<br>
                ${payload.details.shippingAddress.address_line_2 ? payload.details.shippingAddress.address_line_2 + '<br>' : ''}
                ${payload.details.shippingAddress.city}, ${payload.details.shippingAddress.state_province} ${payload.details.shippingAddress.postal_code}<br>
                ${payload.details.shippingAddress.country}
              </p>
              ${payload.details.shippingAddress.special_instructions ? `
                <p><strong>Special Instructions:</strong> ${payload.details.shippingAddress.special_instructions}</p>
              ` : ''}
            </div>
          ` : ''}
          <p><strong>Action Required:</strong> Process this premium prize shipment in the admin panel and arrange delivery to the provided address.</p>
        `
        break

      default:
        subject = `🍪 LuckyCookie.io Notification`
        htmlContent = `
          <h2>New notification from LuckyCookie.io</h2>
          <p>A new event occurred that requires your attention.</p>
          <p>Please check the admin panel for details.</p>
        `
    }

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [recipientEmail],
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      throw new Error(`Failed to send email: ${emailResponse.status} ${errorText}`)
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        emailId: emailResult.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Notification error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification',
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
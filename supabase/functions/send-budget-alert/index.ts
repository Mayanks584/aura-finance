// Supabase Edge Function: send-budget-alert
// Deploy with: npx supabase functions deploy send-budget-alert
//
// This function sends a budget alert email when a budget limit is exceeded.
// It uses Supabase's built-in SMTP or can be adapted to use Resend (https://resend.com).
//
// Environment variables needed (set in Supabase Dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY  — Your Resend API key (sign up free at resend.com)
//   FROM_EMAIL      — e.g. alerts@yourdomain.com

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { email, displayName, message, budgetInfo } = await req.json();

        if (!email) {
            return new Response(JSON.stringify({ error: 'email is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@aura-finance.app';

        if (!RESEND_API_KEY) {
            console.warn('RESEND_API_KEY not set — skipping email send');
            return new Response(JSON.stringify({ sent: false, reason: 'no_api_key' }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const name = displayName || email.split('@')[0];
        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 32px 24px; color: white; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .header p { margin: 6px 0 0; opacity: 0.8; font-size: 14px; }
    .body { padding: 28px 32px; }
    .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
    .alert-box p { margin: 0; color: #dc2626; font-size: 14px; line-height: 1.6; }
    .cta { display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; }
    .footer { padding: 16px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Budget Alert</h1>
      <p>FinanceOS — Your personal finance assistant</p>
    </div>
    <div class="body">
      <p>Hi <strong>${name}</strong>,</p>
      <div class="alert-box">
        <p>${message}</p>
        ${budgetInfo ? `<p style="margin-top:8px; font-size:13px; color:#7f1d1d;">${budgetInfo}</p>` : ''}
      </div>
      <p style="font-size:14px; color:#64748b; line-height:1.6;">
        Review your spending and adjust your budget limits to stay on track.
      </p>
      <a href="https://aura-finance.app/budget" class="cta">View Budget →</a>
    </div>
    <div class="footer">
      You're receiving this because you enabled budget alerts in FinanceOS.<br>
      You can disable them in <a href="https://aura-finance.app/profile" style="color:#6366f1;">Profile Settings</a>.
    </div>
  </div>
</body>
</html>`;

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: `FinanceOS <${FROM_EMAIL}>`,
                to: [email],
                subject: '⚠️ Budget Limit Exceeded — FinanceOS Alert',
                html: htmlBody,
            }),
        });

        const result = await res.json();

        if (!res.ok) {
            console.error('Resend error:', result);
            return new Response(JSON.stringify({ sent: false, error: result }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ sent: true, id: result.id }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Edge function error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

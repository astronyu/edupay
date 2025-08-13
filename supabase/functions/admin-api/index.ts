import { createClient } from 'npm:@supabase/supabase-js@2';
import { verify } from 'npm:jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'your-secret-key';
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify admin token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', {
        status: 401,
        headers: corsHeaders,
      });
    }

    const token = authHeader.substring(7);
    let adminUser;
    
    try {
      adminUser = verify(token, jwtSecret);
    } catch {
      return new Response('Invalid token', {
        status: 401,
        headers: corsHeaders,
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.replace('/admin-api/', '');

    // Handle different API endpoints
    if (path === 'payments' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('payment_confirmations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path.startsWith('payments/') && req.method === 'PATCH') {
      const paymentId = path.split('/')[1];
      const { status, notes } = await req.json();

      const { data, error } = await supabase
        .from('payment_confirmations')
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path === 'email-settings' && req.method === 'GET') {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(JSON.stringify(data || {}), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path === 'email-settings' && req.method === 'PUT') {
      const settings = await req.json();

      const { data, error } = await supabase
        .from('email_settings')
        .upsert(settings)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path.startsWith('email-template/') && req.method === 'GET') {
      const templateName = path.split('/')[1];

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', templateName)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (path === 'email-template' && req.method === 'PUT') {
      const template = await req.json();

      const { data, error } = await supabase
        .from('email_templates')
        .upsert(template)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response('Not found', {
      status: 404,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Admin API error:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
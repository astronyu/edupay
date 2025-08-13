import { createClient } from 'npm:@supabase/supabase-js@2';
import { compare } from 'npm:bcryptjs@2.4.3';
import { sign } from 'npm:jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface LoginRequest {
  email: string;
  password: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'your-secret-key';
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return new Response('Email and password are required', {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Find admin user
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !adminUser) {
      return new Response('Invalid credentials', {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Verify password
    const isValidPassword = await compare(password, adminUser.password_hash);
    
    if (!isValidPassword) {
      return new Response('Invalid credentials', {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Generate JWT token
    const token = sign(
      { 
        id: adminUser.id, 
        email: adminUser.email, 
        name: adminUser.name 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
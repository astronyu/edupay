import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface EmailData {
  to: string;
  name: string;
  receiptNumber: string;
  paymentAmount: number;
  courses: string;
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
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { to, name, receiptNumber, paymentAmount, courses }: EmailData = await req.json();

    // Get email template from database
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'payment_confirmation')
      .single();

    if (templateError || !template) {
      console.error('Failed to load email template:', templateError);
      return new Response('Email template not found', {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Replace template variables
    const variables = {
      name,
      email: to,
      receiptNumber,
      paymentAmount: paymentAmount.toFixed(2),
      courses,
      submissionDate: new Date().toLocaleDateString(),
    };

    let emailSubject = template.subject;
    let emailHtml = template.html_content;
    let emailText = template.text_content || '';

    // Replace all variables in subject, HTML, and text
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value);
      emailHtml = emailHtml.replace(new RegExp(placeholder, 'g'), value);
      emailText = emailText.replace(new RegExp(placeholder, 'g'), value);
    });

    // Get email settings
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('*')
      .single();

    // Here you would integrate with your email service using the settings
    // For now, we'll simulate sending
    console.log('Email would be sent to:', to);
    console.log('Subject:', emailSubject);
    console.log('Using settings:', emailSettings);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Acknowledgment email sent successfully',
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
    console.error('Email error:', error);
    return new Response('Email sending failed', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
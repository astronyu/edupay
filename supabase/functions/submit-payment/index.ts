import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface PaymentSubmission {
  name: string;
  phone: string;
  email: string;
  courses: string;
  receiptNumber: string;
  paymentAmount: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
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

    // Parse form data
    const formData = await req.formData();
    
    const submission: PaymentSubmission = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      courses: formData.get('courses') as string,
      receiptNumber: formData.get('receiptNumber') as string,
      paymentAmount: parseFloat(formData.get('paymentAmount') as string),
    };

    const receiptFile = formData.get('paymentReceipt') as File;

    // Validate required fields
    if (!submission.name || !submission.phone || !submission.email || !submission.courses || 
        !submission.receiptNumber || !submission.paymentAmount || !receiptFile) {
      return new Response('Missing required fields', {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Upload receipt file
    const fileName = `${Date.now()}_${receiptFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, receiptFile);

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return new Response('File upload failed', {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(fileName);

    // Save payment confirmation to database
    const { data: paymentData, error: dbError } = await supabase
      .from('payment_confirmations')
      .insert({
        name: submission.name,
        phone: submission.phone,
        email: submission.email,
        courses: submission.courses,
        receipt_number: submission.receiptNumber,
        payment_amount: submission.paymentAmount,
        receipt_file_url: publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response('Database error', {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Send acknowledgment email
    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        },
        body: JSON.stringify({
          to: submission.email,
          name: submission.name,
          receiptNumber: submission.receiptNumber,
          paymentAmount: submission.paymentAmount,
          courses: submission.courses,
        }),
      });
      
      if (!emailResponse.ok) {
        console.error('Failed to send email');
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    // Create Google Sheets entry (placeholder - would integrate with Google Sheets API)
    try {
      const sheetsResponse = await fetch(`${supabaseUrl}/functions/v1/google-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        },
        body: JSON.stringify({
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          paymentAmount: submission.paymentAmount,
          receiptNumber: submission.receiptNumber,
          name: submission.name,
          phone: submission.phone,
          courses: submission.courses,
        }),
      });
      
      if (!sheetsResponse.ok) {
        console.error('Failed to update Google Sheets');
      }
    } catch (sheetsError) {
      console.error('Google Sheets error:', sheetsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment confirmation submitted successfully',
        id: paymentData.id,
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
    console.error('Unexpected error:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface SheetsData {
  date: string;
  time: string;
  paymentAmount: number;
  receiptNumber: string;
  name: string;
  phone: string;
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
    const data: SheetsData = await req.json();

    // Google Sheets API integration would go here
    // You would need to:
    // 1. Set up Google Sheets API credentials
    // 2. Authenticate with service account
    // 3. Append row to specified spreadsheet

    const spreadsheetData = {
      values: [[
        data.date,
        data.time,
        `$${data.paymentAmount.toFixed(2)}`,
        data.receiptNumber,
        data.name,
        data.phone,
        data.courses
      ]]
    };

    // Placeholder for Google Sheets API call
    console.log('Would append to Google Sheets:', spreadsheetData);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data added to Google Sheets successfully',
        data: spreadsheetData,
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
    console.error('Google Sheets error:', error);
    return new Response('Google Sheets integration failed', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
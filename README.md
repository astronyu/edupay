# Payment Confirmation System

A comprehensive payment confirmation system built with React, TypeScript, Supabase, and Tailwind CSS. This application allows users to submit payment confirmations for course enrollments with automatic email notifications and Google Sheets integration.

## Features

### Frontend
- ✅ Beautiful, responsive payment confirmation form
- ✅ Drag-and-drop file upload for payment receipts
- ✅ Real-time form validation with error handling
- ✅ Success/loading states with smooth animations
- ✅ Professional design with Tailwind CSS
- ✅ Mobile-first responsive layout

### Backend & Database
- ✅ Supabase database integration
- ✅ Secure file storage for payment receipts
- ✅ Row Level Security (RLS) policies
- ✅ Serverless edge functions for processing

### Integrations
- 📧 Email acknowledgment system (ready for integration)
- 📊 Google Sheets integration (ready for setup)
- 🔒 Secure file handling and validation

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Getting Started

### Prerequisites

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Environment Setup**: Copy `.env.example` to `.env` and fill in your Supabase credentials

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Click "Connect to Supabase" in the top right of Bolt
   - The database schema will be automatically applied

3. Start the development server:
```bash
npm run dev
```

## Database Schema

### payment_confirmations table
- `id`: Unique identifier (UUID)
- `name`: Student's full name
- `phone`: Contact phone number
- `courses`: Enrolled courses
- `receipt_number`: Payment receipt/transaction number
- `payment_amount`: Payment amount (decimal)
- `receipt_file_url`: URL to uploaded receipt file
- `status`: Payment status (pending/verified/rejected)
- `created_at`: Submission timestamp
- `updated_at`: Last update timestamp

### Storage Bucket
- `payment-receipts`: Stores uploaded payment confirmation files

## API Endpoints

### Edge Functions

1. **submit-payment**: Handles form submissions
   - Validates form data
   - Uploads receipt files
   - Saves to database
   - Triggers email and sheets integration

2. **send-email**: Sends acknowledgment emails
   - Professional email template
   - Payment confirmation details
   - Support contact information

3. **google-sheets**: Google Sheets integration
   - Appends payment data to spreadsheet
   - Includes date, time, amount, receipt number

## Form Validation

The application includes comprehensive validation:
- ✅ Required field validation
- ✅ Phone number format checking
- ✅ File type validation (images, PDFs)
- ✅ File size limits (max 5MB)
- ✅ Payment amount validation

## Security Features

- 🔒 Row Level Security (RLS) on all tables
- 🔐 Secure file upload with type/size validation
- 🛡️ CORS protection on all endpoints
- 📁 Organized storage with public read access

## Customization

### Styling
- Modify `src/index.css` for global styles
- Update color scheme in Tailwind config
- Customize form components in `src/components/`

### Email Templates
- Edit email HTML in `supabase/functions/send-email/index.ts`
- Add your email service API credentials

### Google Sheets Integration
- Add Google Sheets API credentials to environment
- Configure spreadsheet ID and range
- Customize data columns as needed

## Deployment

The application is ready for deployment to any platform supporting Node.js:

- **Frontend**: Build with `npm run build`
- **Backend**: Supabase handles all serverless functions
- **Database**: Fully managed by Supabase

## Support

For questions or issues:
- 📧 Email: support@edupay.com
- 📞 Phone: +1-800-123-4567
- 📚 Documentation: [Supabase Docs](https://supabase.com/docs)

## License

This project is licensed under the MIT License.
# Late Rooms

Last-minute luxury hotel bidding platform for the UK.

## Quick Start (For Deployment)

### Prerequisites
- GitHub account
- Vercel account (connected to GitHub)
- Supabase project already set up

### Deploy to Vercel

1. Push this code to a new GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click "Deploy"

Your site will be live at `https://your-project.vercel.app`

## Project Structure

```
laterooms-app/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Header.js
│   │   ├── RoomCard.js
│   │   └── SecretHotelCard.js
│   ├── lib/
│   │   └── supabase.js # Supabase client
│   ├── pages/          # Next.js pages (routes)
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js    # Homepage
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── secret-hotels.js
│   │   └── room/
│   │       └── [id].js # Individual room page
│   └── styles/
│       └── globals.css
├── public/             # Static files
├── .env.local          # Environment variables (don't commit!)
├── package.json
├── tailwind.config.js
└── next.config.js
```

## Features

- **Hotel Auctions**: Real-time bidding on last-minute rooms
- **Secret Hotels**: Anonymous luxury deals at fixed prices
- **User Authentication**: Sign up, sign in, manage bids
- **UK Coverage**: All regions across the UK
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Hosting**: Vercel
- **Payments**: Stripe (to be integrated)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Support

For issues or questions, contact the development team.

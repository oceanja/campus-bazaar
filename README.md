<div align="center">

# ⬡ CampusBazaar

### The AI-powered marketplace for college students

Buy and sell second-hand items with students at your college — get a fair price in seconds, chat in real-time, and pay via UPI. No middlemen, no fees.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)](https://groq.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

**[▶ Watch Demo](https://drive.google.com/file/d/1Jsy51fRu1Je_X5F-hU3RE4glCilAL23L/view?usp=sharing)**

> **Note:** The live site runs on Supabase's free tier, which automatically pauses the database after a period of inactivity. If the site doesn't load or login fails, the backend may be sleeping — refer to the demo video above to see the full app in action.

---


## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **AI Price Suggestion** | Paste your item details and get a fair resale price calibrated for Indian college campuses, powered by Groq LLM |
| 💬 **Real-time Messaging** | Chat directly with buyers/sellers via Supabase Realtime — no page refresh needed |
| 💳 **UPI Payments** | Seller's UPI ID is shown in the chat header — buyer copies it and pays via PhonePe / GPay |
| 🛍️ **Browse & Buy** | Filter listings by category (Electronics, Books, Furniture, Cycles…), search by name |
| 📋 **Manage Listings** | Post, edit, mark as sold, or delete your listings with image upload to Supabase Storage |
| 👤 **Profile System** | College, year, branch, phone, bio — profile completeness unlocks selling and messaging |
| 🔐 **Auth** | Email/password + Google OAuth via Supabase Auth |
| 📱 **Mobile Responsive** | Fully responsive layout — mobile bottom nav, collapsible message panels |

---

## 🖥️ Tech Stack

```
Frontend   →  React 19 + Vite 7 + Tailwind CSS 4
Backend    →  Supabase (Postgres + Auth + Storage + Realtime)
AI         →  Groq API (llama-3.3-70b-versatile) for price suggestions
Routing    →  React Router v7
Fonts      →  Clash Display · Instrument Serif · DM Sans
```

No custom backend server — everything runs through Supabase's client SDK and Row Level Security policies.

---

## 🗂️ Project Structure

```
college_marketplace/
└── campus-bazaar/
    └── frontend/
        ├── public/
        ├── src/
        │   ├── lib/
        │   │   ├── supabase.js     # Supabase client (auth + realtime config)
        │   │   ├── auth.js         # Login / signup / logout helpers
        │   │   ├── listings.js     # CRUD for listings + image upload
        │   │   ├── messages.js     # Conversations + messages + realtime
        │   │   ├── profile.js      # Profile upsert / fetch / completeness
        │   │   └── ai.js           # Groq price suggestion
        │   ├── pages/
        │   │   ├── Home.jsx        # Landing page with listings grid
        │   │   ├── Dashboard.jsx   # Main app (sell, shop, messages, profile)
        │   │   ├── Login.jsx
        │   │   └── Signup.jsx
        │   └── main.jsx
        ├── .env.example            # Copy to .env and fill your keys
        └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com) project (free tier works)
- A [Groq](https://console.groq.com) API key (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/campus-bazaar.git
cd campus-bazaar/campus-bazaar/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your actual keys:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

### 4. Set up Supabase database

Run the following SQL in your Supabase **SQL Editor**:

```sql
-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  college text,
  year text,
  branch text,
  phone text,
  bio text,
  upi_id text,
  created_at timestamptz default now()
);

-- Listings table
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null,
  original_price numeric,
  category text,
  condition text,
  image_url text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references auth.users(id) on delete cascade,
  user2_id uuid references auth.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  created_at timestamptz default now(),
  unique(user1_id, user2_id, listing_id)
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- Storage bucket for listing images
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict do nothing;
```

Enable **Row Level Security** on all tables and add policies so users can only read/write their own data.

Enable **Realtime** on the `messages` table in the Supabase dashboard.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🌍 Deployment

The app is a standard Vite SPA — deploy to **Vercel**, **Netlify**, or any static host.

**Vercel (recommended):**
1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set root directory to `campus-bazaar/frontend`
4. Add all three env vars in Project Settings → Environment Variables
5. Deploy ✓

---






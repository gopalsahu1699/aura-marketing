# ✨ Aura Marketing

AI-powered marketing platform with campaign management, audience insights, content creation, analytics, and an AI Training Center — built with Next.js 16 and Supabase.

---

## 🛠 Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Framework    | Next.js 16 (App Router)                     |
| Language     | TypeScript 5                                |
| Styling      | Tailwind CSS 4                              |
| UI / Motion  | Framer Motion · Lucide React                |
| Backend / DB | Supabase (PostgreSQL + Auth)                |
| AI           | NVIDIA NIM API (LLaMA 3.1 70B)             |
| Mobile       | Capacitor (Android)                         |

---

## 📁 Project Structure

```
aura_marketing/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── analytics/   # Analytics & reporting
│   │   │   ├── audience/    # Audience management
│   │   │   ├── campaigns/   # Campaign builder
│   │   │   ├── connections/ # Platform connections
│   │   │   ├── content/     # Content studio
│   │   │   ├── settings/    # App settings
│   │   │   └── training/    # AI Training Center
│   │   ├── onboarding/      # User onboarding flow
│   │   ├── LandingPage.tsx  # Marketing landing page
│   │   └── layout.tsx       # Root layout
│   ├── components/          # Shared UI components
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   └── nvidia-api.ts    # NVIDIA AI integration
│   └── styles/              # Global styles
├── android/                 # Capacitor Android project
├── supabase_schema.sql      # Database schema
├── tailwind.config.ts
├── capacitor.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 9
- A **Supabase** project ([supabase.com](https://supabase.com))
- *(Optional)* An **NVIDIA NIM** API key for AI features

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```env
# Supabase – Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up the Database

Run the contents of `supabase_schema.sql` in your Supabase SQL editor to create the required tables.

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## 📱 Android Build (Capacitor)

```bash
npx cap sync android
npx cap open android
```

Build and run from **Android Studio**.

---

## 📜 Available Scripts

| Command          | Description                 |
| ---------------- | --------------------------- |
| `npm run dev`    | Start development server    |
| `npm run build`  | Production build            |
| `npm run start`  | Serve production build      |
| `npm run lint`   | Run ESLint                  |

---

## 📄 License

ISC

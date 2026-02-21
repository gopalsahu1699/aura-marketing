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

# Required for Connections Hub
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up OAuth Credentials (Connections Hub)

To enable real social media data fetching on the dashboard, you must create developer applications on each platform and add the credentials to your `.env.local` file.

#### Meta (Instagram & Facebook)
1. Go to [developers.facebook.com](https://developers.facebook.com), log in, and click **My Apps** → **Create App** (Business).
2. Add the **Facebook Login** product. Under its Settings, add `http://localhost:3000/api/oauth/facebook/callback` to the *Valid OAuth Redirect URIs*.
3. Add the **Instagram Basic Display** product. Under its Settings, add `http://localhost:3000/api/oauth/instagram/callback` to the *Valid OAuth Redirect URIs*.
4. Go to **Settings → Basic** to find your App ID and Secret. Add them to `.env.local`:
   ```env
   FACEBOOK_CLIENT_ID=your-app-id
   FACEBOOK_CLIENT_SECRET=your-app-secret
   INSTAGRAM_CLIENT_ID=same-app-id
   INSTAGRAM_CLIENT_SECRET=same-app-secret
   ```

#### LinkedIn
1. Go to [linkedin.com/developers](https://www.linkedin.com/developers) and click **Create App**.
2. Go to the **Auth** tab. Under *OAuth 2.0 settings*, add `http://localhost:3000/api/oauth/linkedin/callback` to the *Authorized redirect URLs*.
3. Go to the **Products** tab and request access to **Sign In with LinkedIn using OpenID Connect** and **Share on LinkedIn**.
4. Copy the Client ID and Secret and add them to `.env.local`:
   ```env
   LINKEDIN_CLIENT_ID=your-client-id
   LINKEDIN_CLIENT_SECRET=your-client-secret
   ```

#### YouTube (Google)
1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a new project.
2. Under **APIs & Services → Library**, search for and enable the **YouTube Data API v3** and **YouTube Analytics API**.
3. Under **OAuth consent screen**, select **External**, fill in the required fields, and save.
4. Under **Credentials**, click **Create Credentials** → **OAuth client ID** (Web application). Add `http://localhost:3000/api/oauth/youtube/callback` to the *Authorized redirect URIs*.
5. Copy the Client ID and Secret and add them to `.env.local`:
   ```env
   YOUTUBE_CLIENT_ID=your-client-id
   YOUTUBE_CLIENT_SECRET=your-client-secret
   ```

### 4. Set Up the Database


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

# Velamini Project Setup Guide

A comprehensive guide to building a modern AI-powered virtual self platform from scratch.

## 🎯 Project Overview

Velamini is a sophisticated web application that allows users to create AI-powered virtual versions of themselves through interactive training and deployment. The platform features a modern dashboard interface, real-time chat capabilities, and comprehensive user management.

## 🏗️ Architecture & Tech Stack

### Frontend Framework
- **Next.js 16.1.6** - React framework with Turbopack
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS + DaisyUI** - Styling and component library
- **HeroUI** - Advanced React components
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Backend & Database
- **Prisma ORM** - Database management
- **NextAuth.js** - Authentication system
- **PostgreSQL/MySQL** - Primary database
- **Node.js API Routes** - Backend logic

### AI & External Services
- **OpenAI GPT** - AI model integration
- **Twilio** - WhatsApp integration
- **Custom RAG System** - Knowledge retrieval

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── actions.ts               # Server actions
│   ├── globals.css              # Global styles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication
│   │   ├── chat/               # Chat functionality
│   │   ├── training/           # AI training
│   │   ├── organizations/      # Organization management
│   │   └── whatsapp/          # WhatsApp integration
│   ├── Dashboard/              # Dashboard pages
│   ├── auth/                   # Auth pages
│   └── chat/                   # Chat interface
├── components/                   # React components
│   ├── dashboard/              # Dashboard components
│   ├── chat-ui/               # Chat interface
│   ├── layout/                # Layout components
│   └── ui/                    # Reusable UI components
├── lib/                         # Utility libraries
│   ├── ai-config.ts           # AI configuration
│   ├── prisma.ts              # Database client
│   ├── utils.ts               # Utility functions
│   └── rag/                   # RAG system
├── types/                       # TypeScript definitions
└── pages/api/                   # Legacy API routes
```

## 🚀 Getting Started

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest velamini-project --typescript --tailwind --app
cd velamini-project
```

### 2. Install Core Dependencies

```bash
# UI & Styling
npm install @heroui/react framer-motion lucide-react daisyui

# Authentication & Database
npm install next-auth prisma @prisma/client bcryptjs

# AI & External Services
npm install openai twilio

# Utilities
npm install clsx tailwind-merge class-variance-authority

# Development
npm install -D @types/bcryptjs
```

### 3. Configure Tailwind CSS

Update `tailwind.config.js`:

```javascript
import { nextui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require("daisyui"),
    nextui()
  ],
  daisyui: {
    themes: ["light", "dark"],
  },
}
```

### 4. Setup Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/velamini"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Services
OPENAI_API_KEY="your-openai-api-key"

# External Services
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-number"
```

### 5. Setup Prisma Database

Initialize Prisma:

```bash
npx prisma init
```

Create database schema in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  knowledgeBase KnowledgeBase?
  swags         Swag[]

  @@map("users")
}

model KnowledgeBase {
  id                 String   @id @default(cuid())
  userId             String   @unique
  fullName           String?
  birthDate          String?
  birthPlace         String?
  currentLocation    String?
  languages          String?
  relationshipStatus String?
  hobbies            String?
  favoriteFood       String?
  bio                String?
  education          String?
  workExperience     String?
  skills             String?
  projects           String?
  achievements       String?
  awards             String?
  socialLinks        String?
  socialUpdates      String?
  isModelTrained     Boolean  @default(false)
  lastTrainedAt      DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("knowledge_bases")
}

model Swag {
  id        String   @id @default(cuid())
  userId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("swags")
}

// NextAuth Models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 🔐 Authentication Setup

### 1. Configure NextAuth

Create `src/auth.config.ts`:

```typescript
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
} satisfies NextAuthConfig
```

Create `src/auth.ts`:

```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
})
```

### 2. Create API Routes

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

## 🎨 UI Components Development

### 1. Landing Page Component

Create modern, responsive landing page with:
- Hero section with animations
- Feature showcase
- Stats display
- Call-to-action buttons

### 2. Dashboard System

Develop comprehensive dashboard with:
- Responsive sidebar navigation
- Multi-view layout system
- Profile management
- Training interface
- Settings panel
- Chat interface

### 3. Key Component Features

**Sidebar Navigation:**
- Collapsible design
- Theme toggle
- Responsive mobile overlay

**Training System:**
- Multi-step form wizard
- Progress tracking
- Auto-save functionality
- AI model training integration

**Chat Interface:**
- Real-time messaging
- AI response integration
- Message history
- Feedback system

## 🤖 AI Integration

### 1. OpenAI Configuration

Create `src/lib/ai-config.ts`:

```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(
  prompt: string,
  context: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an AI assistant representing this person: ${context}`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || '';
}
```

### 2. RAG System Implementation

Implement retrieval-augmented generation for personalized responses using user's knowledge base data.

## 📱 WhatsApp Integration

### 1. Twilio Setup

Create webhook endpoints for WhatsApp message handling:

```typescript
// src/app/api/whatsapp/webhook/route.ts
import { twilio } from '@/lib/twilio.config';

export async function POST(request: Request) {
  const formData = await request.formData();
  const message = formData.get('Body') as string;
  const from = formData.get('From') as string;
  
  // Process message with AI
  const response = await generateAIResponse(message, userContext);
  
  // Send response via Twilio
  await twilio.messages.create({
    body: response,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: from,
  });
  
  return new Response('OK');
}
```

## 🎯 Development Best Practices

### 1. Component Structure
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Follow responsive design principles
- Maintain consistent naming conventions

### 2. State Management
- Use React hooks for local state
- Implement proper loading states
- Handle error states gracefully
- Optimize re-renders

### 3. Styling Guidelines
- Use Tailwind utility classes
- Implement design system consistency
- Ensure accessibility compliance
- Test across different screen sizes

## 🚀 Deployment

### 1. Production Build

```bash
npm run build
npm run start
```

### 2. Environment Setup

Configure production environment variables for:
- Database connections
- API keys
- Authentication providers
- External service credentials

### 3. Platform Deployment

Deploy to platforms like:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- DigitalOcean

## 📊 Advanced Features

### 1. Analytics Integration
- User interaction tracking
- Performance monitoring
- Error logging
- Usage analytics

### 2. Real-time Features
- WebSocket integration
- Live chat updates
- Notification system
- Real-time collaboration

### 3. Mobile Optimization
- Progressive Web App (PWA)
- Mobile-first design
- Touch-friendly interfaces
- Offline capabilities

## 🔧 Development Tools

### 1. Code Quality
```bash
npm install -D eslint prettier husky lint-staged
```

### 2. Testing Setup
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### 3. Development Workflow
- Git hooks for code quality
- Automated testing pipeline
- Code review process
- Documentation standards

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Guide](https://next-auth.js.org/)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🎉 Conclusion

This guide provides a comprehensive foundation for building a modern AI-powered platform like Velamini. Follow each section carefully, customize based on your specific requirements, and don't hesitate to extend functionality as needed.

Remember to:
- Test thoroughly across different devices
- Implement proper security measures
- Optimize for performance
- Maintain code quality standards
- Document your additions and modifications

Happy coding! 🚀
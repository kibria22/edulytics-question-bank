# Edulytics Question Bank

A Next.js web application for managing an educational question bank with AI-powered question generation, curriculum browsing, and exam paper building.

## Tech Stack

- **Framework**: Next.js 16.4.6 (App Router) with React 19.3.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Database**: MongoDB (Atlas) - optional, demo mode works without it
- **AI**: Vercel AI Gateway with DeepSeek v4.1 Flash (fastest and most cost-effective)
- **Math Rendering**: KaTeX for LaTeX expressions
- **Font**: Inter for UI, Noto Sans Bengali for Bangla text

## Features

### 1. Curriculum Browser
- Navigate hierarchical curriculum structure (country → board → version → level → group → subject → chapter → topic)
- View summaries and learning outcomes in Bangla/English
- Display question counts per curriculum node

### 2. Question Bank
- Browse and search questions with filters (type, difficulty, language, source)
- Paginated results with preview
- Detailed question view with options, parts, and solutions
- Support for MCQ, CQ, SQ, True/False, Short, and Long question types

### 3. Question Editor
- Create and edit questions with live validation
- Multiple question types with appropriate fields
- MCQ options with Bangla keys (ক, খ, গ, ঘ)
- Creative Question (CQ) parts support
- Markdown and LaTeX support for mathematical expressions
- Automatic content hashing and duplicate detection

### 4. AI Question Generator
- Generate questions using AI based on curriculum topics
- Configure type, difficulty, count, and language
- Review and edit before saving
- Fallback to sample data if AI is unavailable

### 5. Solutions & Hints
- Manage answers for MCQ and written questions
- Progressive hints system
- Step-by-step solutions
- Explanation and rubric support
- AI-assisted solution generation

### 6. Paper Builder
- Build exam papers using blueprint specifications
- Define sections with question counts and marks
- Auto-fill from question bank
- Preview printable layout (Bangla exam style)
- Export to PDF (planned)

### 7. Sources Management
- Manage question sources (textbooks, exams, guides)
- Track metadata (board, year, publisher)
- Question counts per source

## Environment Setup

Create a `.env.local` file in the project root:

```env
# MongoDB Connection (optional - demo mode works without it)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edulytics?retryWrites=true&w=majority

# App Password (required for access)
APP_PASSWORD=your_secure_password

# AI Configuration (Vercel AI Gateway)
# Default model: DeepSeek v4.1 Flash (fastest and most cost-effective)
AI_MODEL=deepseek/deepseek-v4.1-flash

# Auth: On Vercel, OIDC is automatic. Locally, provide this key:
AI_GATEWAY_API_KEY=your-vercel-ai-gateway-api-key

# Node Environment
NODE_ENV=development
```

### Getting AI Gateway API Key

1. Visit [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
2. Create a gateway configuration
3. Copy the API key for local development
4. On Vercel deployments, OIDC authentication is automatic (no key needed)

## Installation

```bash
# Install dependencies
npm install

# Seed the database (optional, for development)
# Access the app and use the "Seed Database" button on first run

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Development

The app will be available at `http://localhost:3000` (or the port shown in terminal).

1. First run: Enter the APP_PASSWORD to access
2. If MONGODB_URI is set: Use "Seed Database" to initialize with sample data
3. If no DB: Skip and use the app without persistence (good for UI development)

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Add environment variables in Vercel project settings:
   - `MONGODB_URI` (optional - demo mode works without it)
   - `APP_PASSWORD` (required)
   - `AI_MODEL` (optional, defaults to `deepseek/deepseek-v4.1-flash`)
   - No `AI_GATEWAY_API_KEY` needed - Vercel uses OIDC automatically
4. Deploy

Vercel will automatically:
- Detect Next.js and use the correct build settings
- Authenticate with AI Gateway using OIDC (no API key required)
- Enable Turbopack for faster builds

## Database Schema

### Collections

#### `curriculum_nodes`
Hierarchical tree structure for curriculum organization with types: country, board, version, level, group, subject, chapter, subchapter, topic.

#### `questions` (v2.2)
Questions with support for MCQ (single, multi-statement, situation-based), CQ, SQ, and other types. Includes curriculum tagging, difficulty, language, and content hashing for duplicate detection.

#### `question_solutions`
Answers, hints, step-by-step solutions, and explanations per question or per part (for CQ).

#### `question_sources`
Metadata for textbooks, exams, guides, and other question sources.

## Key Features

- **Bilingual Support**: Bangla and English throughout the UI
- **Math Support**: LaTeX expressions rendered with KaTeX (use `$...$` syntax)
- **Password Protection**: Simple access control for internal tools
- **AI Integration**: DeepSeek v4.1 Flash via Vercel AI Gateway (fastest, most cost-effective question generation)
- **Demo Mode**: Works without MongoDB - uses fixture data for development
- **Responsive Design**: Works on desktop and mobile
- **Type Safety**: Full TypeScript coverage with Zod validation

## Project Structure

```
app/
├── curriculum/         # Curriculum browser page
├── questions/          # Question bank page
├── editor/             # Question editor page
├── ai-generator/       # AI question generator page
├── solutions/          # Solutions & hints page
├── paper-builder/      # Exam paper builder page
├── sources/            # Sources management page
└── api/                # API routes
    ├── auth/           # Authentication
    ├── db/             # Database utilities
    ├── seed/           # Database seeding
    ├── curriculum/     # Curriculum endpoints
    ├── questions/      # Question CRUD
    ├── sources/        # Sources endpoints
    └── ai/             # AI generation
components/
├── ui/                 # shadcn/ui components
├── app-shell.tsx       # Main layout with navigation
├── password-gate.tsx   # Authentication gate
└── setup-screen.tsx    # Database setup screen
lib/
├── db/                 # MongoDB client and seed data
├── types/              # TypeScript types
├── schemas/            # Zod validation schemas
├── utils/              # Utility functions
├── ai/                 # AI provider wrapper
└── auth/               # Password utilities
```

## Notes

- This is an internal testing tool, not production-ready
- Built as reusable components for integration into Edulytics admin portal
- MongoDB schema follows existing validators (do not modify)
- Content hashing ensures duplicate detection
- Scope field supports global, institution, and campus-level questions

## Next.js 16 Conventions

This project uses Next.js 16.4.6 with:
- App Router
- React 19.3.0
- Turbopack for faster builds
- Tailwind CSS v4
- Server Components by default
- Client Components marked with 'use client'

## License

Internal use only - Edulytics

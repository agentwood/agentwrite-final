# HARBOR Platform

Media-native data infrastructure for real-world audio and video AI.

## Project Structure

```
harbor-platform/
├── frontend/           # External website (11 pages, Kled design)
├── dashboard/          # Internal admin dashboard
├── backend/            # TypeScript API server
├── auto-annotator/     # Python ML annotation service
├── cognee-service/     # RAG/Knowledge graph service
└── blog/               # Blog pages
```

## Quick Start

### 1. Frontend Website (Static)

```bash
cd frontend
python3 -m http.server 3000
# Open http://localhost:3000
```

### 2. Dashboard (Static)

```bash
cd dashboard
python3 -m http.server 8080
# Open http://localhost:8080
```

### 3. Backend API (Not yet configured)

```bash
cd backend
npm install
# Configure .env from .env.example
npm run dev
```

### 4. Auto-Annotator (Python ML Service)

```bash
cd auto-annotator
pip install -r requirements.txt
# Configure .env from .env.example
python -m uvicorn src.main:app --reload
```

### 5. Cognee Service (RAG Engine)

```bash
cd cognee-service
pip install -r requirements.txt
# Configure .env from .env.example
python -m uvicorn src.main:app --reload
```

## Environment Variables

Each service has a `.env.example` file. Copy to `.env` and fill in your values:

```bash
cp .env.example .env
```

**IMPORTANT:** Never commit `.env` files. They are in `.gitignore`.

## Pages Built

| Page | URL | Description |
|------|-----|-------------|
| Landing | `/` | Hero, platform pillars, lifecycle |
| Product | `/product.html` | Annotation, curation, APIs |
| Datasets | `/datasets.html` | Marketplace, licensing |
| Infrastructure | `/infrastructure.html` | Layer-1 video network |
| Ads | `/ads.html` | Harbor Ads managed service |
| Pricing | `/pricing.html` | Tier pricing, usage |
| Contact | `/contact.html` | Demo request form |
| About | `/about.html` | Mission, philosophy, team |
| Contributors | `/contributors.html` | Data contribution |
| Engineering | `/engineering.html` | RAG-first datasets |
| Hardware | `/hardware.html` | Future roadmap |

## Tech Stack

- **Frontend:** HTML, Tailwind CSS (CDN), Lucide Icons
- **Backend:** TypeScript, Express (scaffolded)
- **ML Services:** Python, FastAPI, YOLOv11, SAM2, Whisper, CLIP
- **RAG:** Cognee integration (scaffolded)

## What's Next

Deferred items to implement:
- [ ] Database setup (PostgreSQL)
- [ ] n8n workflow orchestration
- [ ] Full annotation pipeline runtime
- [ ] Dashboard redesign to Kled style

## Design Reference

The frontend uses the "Kled" design aesthetic:
- Ultra-dark #050505 background
- Tailwind CSS + Lucide icons
- Glassmorphism effects
- Bento grid layouts
- Numbered feature cards (01, 02, etc)

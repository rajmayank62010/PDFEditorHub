# PDFEditorHub

**Free, Privacy-First Online PDF Toolkit**

A production-ready SaaS application for editing, merging, splitting, compressing, converting, signing, and managing PDF files — all in the browser, with no registration required.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| State | TanStack Query, React Hook Form |
| Backend | ASP.NET Core 9, C#, Clean Architecture |
| PDF Processing | iText7, PdfSharpCore |
| Containerization | Docker, Docker Compose |
| Reverse Proxy | Nginx |

## Features

- **Edit PDF** — Add text, shapes, highlights, annotations
- **Merge PDF** — Combine multiple PDFs with drag-and-drop ordering
- **Split PDF** — Split by page ranges or extract specific pages
- **Compress PDF** — Low/Medium/High compression modes
- **Sign PDF** — Draw, type, or upload signature
- **Watermark PDF** — Text and image watermarks
- **PDF to JPG/PNG** — Convert pages to images
- **JPG to PDF** — Convert images to PDF
- **PDF to Word** — Extract text to DOCX
- **Word to PDF** — Convert DOCX to PDF
- **Page Manager** — Rotate, delete, duplicate pages

## Privacy

- No user registration required
- No permanent file storage
- Files processed in memory
- Auto-deleted after download
- GDPR-friendly architecture

## Quick Start

### Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
dotnet restore
dotnet run --project PDFEditorHub.API
```

### Docker

```bash
cd docker
docker-compose up -d --build
```

Visit `http://localhost:3000`

## Project Structure

```
PDFEditorHub/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable UI components
│   │   │   ├── layout/          # Header, Footer, Layout
│   │   │   ├── seo/             # SEO, Schema.org
│   │   │   └── tools/           # Tool page layouts
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Route pages
│   │   │   └── tools/           # Tool-specific pages
│   │   ├── services/            # API client
│   │   └── types/               # TypeScript types
│   └── public/                  # Static assets, sitemap, robots.txt
│
├── backend/
│   ├── PDFEditorHub.Domain/     # Entities, Enums, Interfaces
│   ├── PDFEditorHub.Application/ # Services, DTOs, Validators
│   ├── PDFEditorHub.Infrastructure/ # PDF Services, File Store
│   └── PDFEditorHub.API/        # Controllers, Middleware, Program.cs
│
├── docker/
│   └── docker-compose.yml
│
├── nginx/
│   └── nginx.conf               # Production Nginx config
│
└── DEPLOYMENT.md                # VPS deployment guide
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pdf/upload` | Upload a file |
| POST | `/api/pdf/edit` | Edit PDF |
| POST | `/api/pdf/merge` | Merge PDFs |
| POST | `/api/pdf/split` | Split PDF |
| POST | `/api/pdf/compress` | Compress PDF |
| POST | `/api/pdf/watermark` | Add watermark |
| POST | `/api/pdf/sign` | Sign PDF |
| POST | `/api/pdf/convert` | Convert format |
| POST | `/api/pdf/manage-pages` | Manage pages |
| GET | `/api/pdf/download/{id}` | Download result |
| DELETE | `/api/pdf/delete-temp/{id}` | Delete temp file |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full VPS deployment instructions including SSL, Docker, and CI/CD setup.

## License

MIT

# ⛳ GolfBuddy

A professional Wolf game scoring application built for AIRealSolutions, deployed on Vercel.

## Overview

GolfBuddy is a full-stack application for managing golf matches and games using the Wolf scoring format. It features:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Serverless functions on Vercel (Node.js)
- **Database**: PostgreSQL on AIRealSolutions Supabase (golfbuddy schema)
- **Deployment**: Vercel/Velcro

## Project Structure

```
golfbuddy/
├── client/                      # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── WolfGame.tsx    # Wolf game component
│   │   ├── styles/
│   │   │   └── WolfGame.css
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # React entry point
│   └── index.html              # HTML template
├── api/
│   └── index.ts                # Vercel API handler (serverless)
├── vercel.json                 # Vercel deployment config
├── vite.config.ts              # Vite build config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies and scripts
└── db-schema-golfbuddy.sql     # Database schema
```

## Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - API proxy: http://localhost:5173/api (proxies to localhost:5000)

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory with:
- `dist/index.html` - Frontend static files
- `api/` - Serverless API functions

## Vercel/Velcro Deployment

### Prerequisites

- GitHub repository: https://github.com/airealsolutions/golfbuddy
- Vercel account linked to GitHub
- Environment variables configured in Vercel

### Environment Variables (Vercel)

Configure these in your Vercel project settings:

```
DATABASE_URL=postgresql://postgres:PASSWORD@db.xqdsmbyealtammgmpsqe.supabase.co:5432/postgres
SUPABASE_URL=https://xqdsmbyealtammgmpsqe.supabase.co
SUPABASE_ANON_KEY=sb_publishable_78q5LVudkA7u2hqsecLmAw_br2XlkUB
SUPABASE_SERVICE_KEY=<jwt_token>
NODE_ENV=production
PORT=5000
VITE_API_URL=https://golfbuddy.vercel.app/api
```

### Deploy Steps

1. **Push to GitHub**:
   ```bash
   git push origin claude/velcro-repo-support-h4qiwa
   ```

2. **Vercel automatically builds and deploys** (configured in vercel.json)

3. **Test deployment**:
   ```bash
   curl https://golfbuddy.vercel.app/api/health
   ```

## API Endpoints

All endpoints require database connection via DATABASE_URL.

### Health Check
- `GET /api/health` - System status

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course with holes

### Players
- `GET /api/players` - List active players
- `POST /api/players` - Create new player

### Matches
- `GET /api/matches` - List all matches
- `POST /api/matches` - Create new match

### Games & Scores
- `POST /api/games` - Create new game
- `GET /api/games/:id` - Get game with scores
- `POST /api/scores` - Record score for hole

### Leaderboards
- `GET /api/leaderboards/yearly/:year` - Yearly standings

## Database Setup

### Initial Schema Creation

1. Go to: https://app.supabase.com/project/xqdsmbyealtammgmpsqe
2. SQL Editor → New Query
3. Copy contents of `db-schema-golfbuddy.sql`
4. Run the script

### Schema Location

All tables are in the `golfbuddy` schema to keep data isolated:
- `golfbuddy.players`
- `golfbuddy.courses`
- `golfbuddy.holes`
- `golfbuddy.matches`
- `golfbuddy.games`
- `golfbuddy.scores`
- `golfbuddy.yearly_leaderboards`
- `golfbuddy.game_results`

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run build:types

# Preview production build
npm preview

# Start API server (local testing)
npm run api
```

## Testing

### Local API Testing

```bash
# Start dev server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:5173/api/health

# Test courses endpoint
curl http://localhost:5173/api/courses
```

### Production Testing

```bash
# Health check
curl https://golfbuddy.vercel.app/api/health

# List courses
curl https://golfbuddy.vercel.app/api/courses

# Get specific course
curl https://golfbuddy.vercel.app/api/courses/1
```

## Configuration Files

### vite.config.ts
- Frontend build configuration
- API proxy for local development
- Environment variable injection
- Path aliases (@/ → client/src/)

### vercel.json
- Vercel deployment settings
- Build and install commands
- Environment variables
- URL rewrites for SPA routing
- Deployment enabled branches

### tsconfig.json
- TypeScript strict mode enabled
- Path aliases configured
- Source maps for debugging
- Support for JSX/TSX

## Performance Optimization

The build includes:
- Code splitting for vendor dependencies (React)
- Terser minification
- Source map generation disabled in production
- Chunk hash naming for cache busting

## Troubleshooting

### Build Fails on Vercel

1. Check Vercel logs in dashboard
2. Verify all environment variables are set
3. Ensure Node.js version >= 18 (check .nvmrc)
4. Verify package.json has all dependencies

### API Returns 500 Error

1. Check database connection string
2. Verify golfbuddy schema exists in Supabase
3. Check Vercel function logs
4. Test connection locally: `psql $DATABASE_URL`

### Frontend Not Loading

1. Verify dist/ directory is created during build
2. Check vercel.json rewrites configuration
3. Ensure client/index.html exists

### Database Connection Issues

```bash
# Test connection from local machine
psql "postgresql://postgres:PASSWORD@db.xqdsmbyealtammgmpsqe.supabase.co:5432/postgres"

# List golfbuddy tables
\dt golfbuddy.*
```

## Production Checklist

- [ ] Database schema created in Supabase
- [ ] All tables verified in golfbuddy schema
- [ ] Environment variables set in Vercel
- [ ] Health endpoint returns 200 OK
- [ ] Courses and holes data populated
- [ ] Frontend loads without errors
- [ ] API calls complete successfully
- [ ] SSL certificate valid (Vercel auto-renews)

## File Documentation

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Frontend build settings |
| `vercel.json` | Vercel deployment config |
| `.env.example` | Environment variable template |
| `api/index.ts` | Serverless API handler |
| `client/index.html` | HTML entry point |
| `client/src/App.tsx` | Root React component |
| `db-schema-golfbuddy.sql` | Database schema creation |

## Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables (local: `.env.local`, Vercel: project settings)
3. Run locally: `npm run dev`
4. Deploy: `git push origin claude/velcro-repo-support-h4qiwa`
5. Monitor deployment in Vercel dashboard

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Verify database connection
3. Test API endpoints locally
4. Review error messages in browser console

---

**Status**: ✅ Ready for Vercel/Velcro deployment
**Last Updated**: 2024
**Environment**: AIRealSolutions Supabase + Vercel

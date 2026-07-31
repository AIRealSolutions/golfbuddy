# 🏢 GolfBuddy - AIRealSolutions Business Setup

Professional cloud app setup using AIRealSolutions infrastructure.

## Architecture

```
AIRealSolutions Supabase Project (xqdsmbyealtammgmpsqe)
├── public schema (existing apps)
├── golfbuddy schema (NEW - isolated)
│   ├── players (3-100 rows)
│   ├── courses (multiple courses)
│   ├── holes (18 per course)
│   ├── matches (historical records)
│   ├── games (individual games)
│   ├── scores (all hole scores)
│   └── leaderboards (yearly standings)
└── other schemas (other business apps)

Vercel Deployment
├── Frontend: React app
├── Backend: Express.js API (uses golfbuddy schema)
└── Database: Connected to AIRealSolutions Supabase
```

## Setup Steps

### Step 1: Apply Schema to AIRealSolutions Database (5 min)

1. Go to: https://app.supabase.com/project/xqdsmbyealtammgmpsqe
2. Click SQL Editor → New Query
3. Copy entire contents of `db-schema-golfbuddy.sql`
4. Paste into SQL Editor
5. Click "Run" button
6. Verify all tables created:
   - [ ] golfbuddy.players
   - [ ] golfbuddy.courses
   - [ ] golfbuddy.holes
   - [ ] golfbuddy.matches
   - [ ] golfbuddy.games
   - [ ] golfbuddy.scores
   - [ ] golfbuddy.yearly_leaderboards
   - [ ] golfbuddy.game_results

### Step 2: Configure Environment Variables

Create `.env` file in golfbuddy project:

```env
# AIRealSolutions Supabase
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xqdsmbyealtammgmpsqe.supabase.co:5432/postgres
SUPABASE_URL=https://xqdsmbyealtammgmpsqe.supabase.co
SUPABASE_ANON_KEY=sb_publishable_78q5LVudkA7u2hqsecLmAw_br2XlkUB
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZHNtYnllYWx0YW1tZ21wc3FlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY4MjYzNiwiZXhwIjoyMTAwMjU4NjM2fQ.Gswv3rmDeDa6oDeoM-RVKlUDyB_gGMEKW2O8bS2Q1gw

# Server
PORT=5000
NODE_ENV=production
VITE_API_URL=https://golfbuddy.airealsolutions.com/api
```

**Note:** Database password is your Supabase password. Get it from Settings → Database.

### Step 3: Create GitHub Repository

```bash
cd golfbuddy
git init
git add .
git commit -m "Initial GolfBuddy cloud app for AIRealSolutions"
git remote add origin https://github.com/airealsolutions/golfbuddy.git
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to: https://vercel.com
2. Import GitHub repo: `airealsolutions/golfbuddy`
3. Framework: **Other**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Install Command: `npm install`

**Environment Variables (add in Vercel):**
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - https://xqdsmbyealtammgmpsqe.supabase.co
- `SUPABASE_ANON_KEY` - sb_publishable_78q5LVudkA7u2hqsecLmAw_br2XlkUB
- `SUPABASE_SERVICE_KEY` - (the JWT you provided)
- `PORT` - 5000
- `NODE_ENV` - production
- `VITE_API_URL` - https://golfbuddy-prod.vercel.app/api

7. Click Deploy ✅

### Step 5: Configure Custom Domain (Optional)

1. In Vercel: Settings → Domains
2. Add: `golfbuddy.airealsolutions.com`
3. Update DNS records in your domain provider
4. Verify SSL certificate

### Step 6: Verify Setup

Test endpoints:

```bash
# Health check
curl https://golfbuddy-prod.vercel.app/api/health

# Get courses
curl https://golfbuddy-prod.vercel.app/api/courses

# Get Glen Dornach
curl https://golfbuddy-prod.vercel.app/api/courses/1
```

Should return Glen Dornach with 18 holes! ✅

---

## Business Benefits

### Data Isolation
- ✅ Separate schema = complete data isolation
- ✅ No conflicts with other AIRealSolutions apps
- ✅ Easy to backup/restore just GolfBuddy data
- ✅ Scales independently

### Security
- ✅ Row-Level Security (RLS) policies enabled
- ✅ Service role restricted to golfbuddy schema
- ✅ Authenticated users can read all public data
- ✅ Insert/Update restricted to authorized users

### Costs
- ✅ Shares database = lower Supabase costs
- ✅ Vercel serverless = pay-as-you-go
- ✅ No separate infrastructure needed
- ✅ Professional production setup

### Maintainability
- ✅ Version controlled on GitHub
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Easy rollback with git
- ✅ Staging/production separation

---

## File Structure

```
golfbuddy/
├── client/              # React frontend
├── server/              # Express backend (references golfbuddy schema)
├── drizzle/             # Database migrations
├── db-schema-golfbuddy.sql  # Schema creation script
├── db-schema.ts         # ORM definitions
├── server-index-golfbuddy.ts # Backend with schema prefix
├── package.json         # Dependencies
├── .env                 # Environment (don't commit!)
├── .env.example         # Template
├── vercel.json          # Vercel config
├── README.md            # Full docs
└── BUSINESS-SETUP.md    # This file
```

---

## Key Differences from Standalone Setup

| Aspect | Standalone | AIRealSolutions |
|--------|-----------|-----------------|
| Database | New project | Shared golfbuddy schema |
| Schema | `public.*` | `golfbuddy.*` |
| URL | `*.vercel.app` | `golfbuddy.airealsolutions.com` |
| Cost | Full Supabase | Shared/divided |
| Isolation | None | Complete |
| Access Control | Custom | Built-in RLS |

---

## Monitoring & Maintenance

### Supabase Dashboard
1. Go to project → golfbuddy schema
2. View real-time stats
3. Check query performance
4. Monitor storage usage

### Vercel Dashboard
1. Check deployment status
2. View analytics (requests, errors)
3. Review environment variables
4. Monitor performance

### GitHub
1. Track commits
2. Review pull requests
3. Check Actions CI/CD
4. Manage releases

---

## Common Tasks

### Add a New Course

```sql
INSERT INTO golfbuddy.courses (name, location, city, state, par, course_rating, slope_rating)
VALUES ('Dunes Golf Club', 'Murrells Inlet', 'Murrells Inlet', 'SC', 72, 74.2, 138);

-- Get the new course ID
SELECT id FROM golfbuddy.courses WHERE name = 'Dunes Golf Club';

-- Add holes (repeat for each hole 1-18)
INSERT INTO golfbuddy.holes (course_id, hole_number, par, handicap, length, yards_white, yards_blue, yards_black)
VALUES (2, 1, 4, 3, 385, 370, 405, 425);
```

### Add Players

```bash
curl -X POST https://golfbuddy-prod.vercel.app/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "handicap": 5,
    "team": "black_belt"
  }'
```

### View Leaderboards

```bash
# Yearly standings for 2024
curl https://golfbuddy-prod.vercel.app/api/leaderboards/yearly/2024

# Player statistics
curl https://golfbuddy-prod.vercel.app/api/leaderboards/player-stats/1
```

---

## Production Checklist

- [ ] Schema created in AIRealSolutions database
- [ ] All tables verified in Supabase
- [ ] GitHub repository created
- [ ] Vercel project deployed
- [ ] Environment variables configured
- [ ] Custom domain set up (if using)
- [ ] SSL certificate verified
- [ ] Health check endpoint working
- [ ] Database connectivity confirmed
- [ ] First Wolf game tested in production

---

## Support & Troubleshooting

### Can't Connect to Database
```bash
# Test connection string
psql "postgresql://postgres:PASSWORD@db.xqdsmbyealtammgmpsqe.supabase.co:5432/postgres" -c "SELECT * FROM golfbuddy.players;"
```

### Schema Not Found
1. Verify SQL script ran successfully
2. Check Supabase SQL Editor → Queries → History
3. Run script again if needed

### Vercel Deployment Failed
1. Check build logs in Vercel dashboard
2. Verify all environment variables set
3. Ensure package.json has all dependencies
4. Check Node version matches (18+)

### API Returning 500 Error
1. Check Vercel function logs
2. Verify database connection string
3. Confirm golfbuddy schema exists
4. Test with curl from local machine

---

## Future Enhancements

- [ ] User authentication (Supabase Auth)
- [ ] Admin dashboard for business
- [ ] Advanced leaderboard visualizations
- [ ] Email notifications on matches
- [ ] Mobile app (React Native)
- [ ] Integration with other AIRealSolutions apps
- [ ] API key management
- [ ] Usage analytics & reporting

---

This is now a professional cloud app running on AIRealSolutions infrastructure! 🚀⛳

**Next Step:** Run the SQL schema script in Supabase!

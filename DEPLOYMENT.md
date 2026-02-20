# Deployment Guide - B.Tech Entrance Exams 2026

This guide covers deployment to production with SEO optimization.

## 🎯 Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All exams data is up-to-date in `data/exams-data.json`
- [ ] Build completes without errors: `npm run build`
- [ ] Environment variables are set (if any)
- [ ] Domain name is ready (if using custom domain)
- [ ] Google Search Console account created
- [ ] Google Analytics setup (optional)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Optimized for Next.js
- Automatic deployments
- Free SSL certificates
- Global CDN
- Excellent performance
- Zero configuration needed

#### Steps:

1. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub/GitLab/Bitbucket

2. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

3. **Deploy via CLI**:
   ```bash
   cd entrance-exams
   vercel
   ```
   - Follow prompts
   - Confirm project settings
   - Deploy completes in ~2 minutes

4. **Or Deploy via Git**:
   - Push code to GitHub
   - Import project in Vercel dashboard
   - Connect repository
   - Auto-deploy on every push

5. **Production URL**:
   - You'll get: `https://your-project.vercel.app`
   - Add custom domain in Vercel dashboard settings

#### Vercel Configuration

The project is already configured for Vercel. No additional config needed.

**Environment Variables** (if needed):
- Go to Project Settings → Environment Variables
- Add any secrets or API keys
- Redeploy

---

### Option 2: Netlify

Good alternative for static sites.

#### Steps:

1. **Sign up for Netlify**: [netlify.com](https://netlify.com)

2. **Deploy via CLI**:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod
   ```

3. **Or Deploy via Git**:
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Configure**:
   - Add `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

---

### Option 3: Railway / Render

For Node.js hosting with databases (if needed later).

#### Railway:

1. Sign up at [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repo
4. Railway auto-detects Next.js
5. Deploy automatically

#### Render:

1. Sign up at [render.com](https://render.com)
2. Create new Web Service
3. Connect repo
4. Build: `npm run build`
5. Start: `npm run start`

---

### Option 4: Self-Hosted (VPS)

For full control on your own server.

#### Requirements:
- Ubuntu 20.04+ / Linux server
- Node.js 16+
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

#### Steps:

1. **Server Setup**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

2. **Deploy Application**:
   ```bash
   # Clone or upload project
   cd /var/www
   git clone <your-repo> entrance-exams
   cd entrance-exams

   # Install dependencies
   npm install

   # Build
   npm run build

   # Start with PM2
   pm2 start npm --name "entrance-exams" -- start
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🔍 Post-Deployment SEO Setup

### 1. Google Search Console

**Purpose**: Monitor search performance, submit sitemap

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your domain: `https://your-domain.com`
3. Verify ownership:
   - DNS verification (recommended)
   - Or HTML file upload
4. **Submit Sitemap**:
   - Go to Sitemaps section
   - Enter: `https://your-domain.com/sitemap.xml`
   - Submit

### 2. Update metadata in code

Update `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  // ... existing metadata
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // From Search Console
  },
  alternates: {
    canonical: 'https://your-actual-domain.com', // Update this
  },
  openGraph: {
    // ... existing openGraph
    url: 'https://your-actual-domain.com', // Update this
  },
}
```

Update `app/sitemap.ts`:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-actual-domain.com' // Update this

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
```

### 3. Bing Webmaster Tools (Optional)

1. Go to [bing.com/webmasters](https://bing.com/webmasters)
2. Import from Google Search Console
3. Or add site manually

### 4. Google Analytics (Optional)

**To track visitors**:

1. Create account: [analytics.google.com](https://analytics.google.com)
2. Get tracking ID
3. Add to `app/layout.tsx`:

```typescript
// In <head> section
<script
  async
  src={`https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID`}
/>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'YOUR_GA_ID');
    `,
  }}
/>
```

---

## 📊 Monitoring & Maintenance

### Performance Monitoring

**Vercel Analytics** (if using Vercel):
- Automatically enabled
- View in dashboard

**Lighthouse** (Manual checks):
```bash
# Install
npm install -g lighthouse

# Run audit
lighthouse https://your-domain.com --view
```

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Regular Updates

**Monthly**:
- [ ] Update exam dates/deadlines
- [ ] Verify all links work
- [ ] Check for broken images
- [ ] Review analytics data

**Quarterly**:
- [ ] Update placement statistics
- [ ] Refresh college information
- [ ] Update application fees
- [ ] Add new exams if relevant

### Backup Strategy

**Automatic** (if using Vercel/Netlify):
- Every deployment is versioned
- Can rollback anytime

**Manual**:
```bash
# Backup data file
cp data/exams-data.json backups/exams-data-$(date +%Y%m%d).json
```

---

## 🐛 Troubleshooting

### Build Errors

**Issue**: `npm run build` fails

**Solution**:
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Deployment Issues

**Issue**: Site not loading after deployment

**Solutions**:
1. Check deployment logs
2. Verify build completed
3. Check environment variables
4. Review server logs

### SEO Issues

**Issue**: Site not appearing in Google

**Solutions**:
1. Wait 1-2 weeks for indexing
2. Submit sitemap in Search Console
3. Check robots.txt is accessible
4. Verify sitemap.xml loads correctly
5. Use "URL Inspection" tool in Search Console

---

## 🎯 Domain Setup

### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Add your domain: `your-domain.com`
3. Follow DNS configuration:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5 min - 24 hours)
5. SSL certificate issued automatically

### Custom Domain on Netlify

1. Go to Domain Settings
2. Add custom domain
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

---

## 📧 Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Google Search Console**: [support.google.com/webmasters](https://support.google.com/webmasters)

---

**Ready to deploy?** Start with Vercel for the easiest experience!

```bash
npm i -g vercel
cd entrance-exams
vercel
```

Your site will be live in minutes! 🚀

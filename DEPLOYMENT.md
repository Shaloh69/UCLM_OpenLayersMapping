# Deployment Guide for UCLM OpenLayers Mapping

## Overview

This project consists of two components:
- **Web Application** (Next.js) - Hosted on Render at https://uclm-openlayersmapping.onrender.com
- **Kiosk Application** (Electron) - Runs locally on kiosk hardware, displays the web app

## Web Application Deployment (Render.com)

### Prerequisites
- GitHub repository connected to Render
- Render account (free tier works)

### Deployment Steps

#### Option 1: Using Render Dashboard (Recommended)

1. **Login to Render**: https://render.com
2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `Shaloh69/UCLM_OpenLayersMapping`

3. **Configure Service**
   ```
   Name: uclm-openlayersmapping
   Region: Oregon (or closest to your users)
   Branch: main (or your default branch)
   Root Directory: (leave empty - render.yaml handles this)
   Environment: Node
   Build Command: cd web && npm install && npm run build
   Start Command: cd web && npm start
   ```

4. **Environment Variables**
   ```
   NODE_VERSION=20.11.0
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Your app will be available at: https://uclm-openlayersmapping.onrender.com

#### Option 2: Using render.yaml (Infrastructure as Code)

The repository already includes `render.yaml` at the root. Render will automatically detect and use it.

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Create Web Service from Dashboard**
   - Render will auto-detect `render.yaml`
   - Review and approve the configuration
   - Deploy!

### Automatic Deployments

- Render automatically redeploys when you push to your main branch
- Each deployment takes ~2-3 minutes on free tier
- Monitor deployments in the Render dashboard

### Important Notes

⚠️ **Free Tier Limitations**:
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- For production kiosks, consider upgrading to paid tier ($7/month) for always-on service

## Kiosk Application Configuration

### Current Setup

The kiosk is already configured to point to Render:
```json
// kiosk_Electron/config.json
{
  "url": "https://uclm-openlayersmapping.onrender.com"
}
```

### Running the Kiosk

1. **Install Dependencies** (first time only)
   ```bash
   cd kiosk_Electron
   npm install
   ```

2. **Start Kiosk**
   ```bash
   npm start
   ```

3. **Kiosk will automatically**:
   - Launch in fullscreen
   - Load the Render-hosted web app
   - Enable geolocation permissions
   - Display the campus navigation interface

### Kiosk Keyboard Shortcuts

- **Ctrl+Shift+C** - Open configuration panel
- **Ctrl+Shift+R** - Reload web app
- **Ctrl+Shift+F** - Toggle fullscreen
- **Ctrl+Shift+I** - Open developer tools (debugging)
- **Ctrl+Shift+Q** - Quit application

### Changing the Server URL

If you need to change where the kiosk points:

1. Press **Ctrl+Shift+C** to open config panel
2. Enter new URL
3. Click "Save & Launch"

OR edit directly:
```bash
cd kiosk_Electron
nano config.json  # or use any text editor
# Change "url" to your desired endpoint
```

## Testing Locally Before Deployment

### Test Web App Locally

```bash
cd web
npm install
npm run dev
```
- Opens at http://localhost:3000
- Test all features (map, navigation, QR codes)

### Test Kiosk with Local Web App

```bash
# Terminal 1: Run web app
cd web
npm run dev

# Terminal 2: Configure kiosk for local testing
cd kiosk_Electron
# Edit config.json to: {"url": "http://localhost:3000"}
npm start
```

### Test Production Build Locally

```bash
cd web
npm install
npm run build
npm start
```
- Tests the exact build that will run on Render
- Catches production-only issues

## Troubleshooting

### Web App Issues

**Build fails on Render:**
- Check Render logs in dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

**App loads but map doesn't work:**
- Check browser console for errors
- Verify GeoJSON files are in `web/public/`
- Ensure OpenLayers loaded correctly

**Slow initial load:**
- Normal on Render free tier (cold start)
- Upgrade to paid tier for instant loads

### Kiosk Issues

**Kiosk shows blank screen:**
- Check if Render app is deployed and accessible
- Open DevTools (Ctrl+Shift+I) to see errors
- Verify config.json has correct URL

**"Site can't be reached" error:**
- Check internet connection
- Verify Render URL is correct
- Check if Render service is running (dashboard)

**Features don't work in kiosk:**
- Ensure web app is built for production
- Check that geolocation permissions are granted
- Verify electron preload security settings

## Custom GeoJSON Configuration

The kiosk supports loading custom campus maps:

1. Press **Ctrl+Shift+C** in kiosk
2. Upload your GeoJSON files:
   - Buildings.geojson (required)
   - RoadSystem.geojson (required)
   - Points.geojson (optional)
3. Files are stored in `kiosk_Electron/custom_geojson/`

See `web/KIOSK_CONFIGURATION.md` for detailed GeoJSON format specs.

## Monitoring & Maintenance

### Render Dashboard
- Monitor deployments: https://dashboard.render.com
- View logs in real-time
- Check service health and metrics

### Updates Workflow

1. Make changes to web app locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Render auto-deploys (2-3 minutes)
5. Kiosks automatically load new version on next refresh

### Manual Kiosk Updates

If kiosks don't pick up changes:
- Press **Ctrl+Shift+R** to reload
- Or restart kiosk application

## Production Checklist

- [ ] Web app deployed to Render
- [ ] Custom domain configured (optional)
- [ ] Environment variables set
- [ ] All GeoJSON files uploaded
- [ ] Kiosk config.json points to Render URL
- [ ] Kiosk tested with production URL
- [ ] Keyboard shortcuts documented for staff
- [ ] Backup of custom GeoJSON files created

## Performance Optimization

### Already Configured:
- ✅ Gzip compression enabled
- ✅ Image optimization with WebP
- ✅ React strict mode
- ✅ Static optimization where possible

### Future Enhancements:
- Consider CDN for static assets
- Implement service worker for offline support
- Add Redis caching for API routes (if added)
- Enable Render's "Always On" for instant loads

## Support & Documentation

- **Render Docs**: https://render.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Electron Docs**: https://www.electronjs.org/docs
- **OpenLayers Docs**: https://openlayers.org/doc/

## Last Updated
November 30, 2025

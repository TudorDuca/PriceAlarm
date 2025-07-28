# 🚀 Solana Price Alarms - Deployment Guide

## 📋 **Quick Start (Local Testing)**

### **Option 1: Run Locally (Easiest for Testing)**
```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
# Go to: http://localhost:3000
```

Your friends can access it on your local network using your IP address:
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)  
- Share URL: `http://YOUR_IP_ADDRESS:3000`

---

## 🌐 **Deploy for Friends (Internet Access)**

### **Option 1: Heroku (Free Tier Available)**

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Prepare for Heroku**:
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-solana-alarms

# Set environment
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy Solana Price Alarms"
git push heroku main
```

3. **Your app will be available at**: `https://your-solana-alarms.herokuapp.com`

### **Option 2: Railway (Recommended - Simple)**

1. **Go to**: https://railway.app
2. **Connect GitHub**: Link your GitHub account
3. **Deploy from GitHub**: Select your repository
4. **Auto-deploy**: Railway handles the rest!
5. **Custom domain**: Available in settings

### **Option 3: Vercel (Frontend Focus)**

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Deploy**: 
```bash
vercel
```
3. **Follow prompts** for deployment
4. **Custom domain**: Available in dashboard

### **Option 4: DigitalOcean App Platform**

1. **Go to**: https://cloud.digitalocean.com/apps
2. **Create App**: Connect GitHub repository
3. **Configure**: Select Node.js
4. **Deploy**: Automatic deployment

---

## 💻 **VPS Deployment (Advanced)**

### **Option 1: DigitalOcean Droplet**

```bash
# 1. Create Ubuntu droplet ($6/month)
# 2. SSH into server
ssh root@your-server-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2 (Process manager)
npm install -g pm2

# 5. Clone your repository
git clone https://github.com/yourusername/PriceAlarm.git
cd PriceAlarm

# 6. Install dependencies
npm install

# 7. Start with PM2
pm2 start index.js --name "solana-alarms"
pm2 startup
pm2 save

# 8. Install Nginx (reverse proxy)
sudo apt install nginx

# 9. Configure Nginx
sudo nano /etc/nginx/sites-available/solana-alarms
```

**Nginx Config**:
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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/solana-alarms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Install SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📱 **Mobile App Distribution**

### **PWA Installation (Recommended)**
1. **Share URL**: Send friends the deployed URL
2. **Install Instructions**: 
   - **Android**: Chrome → Menu → "Add to Home Screen"
   - **iOS**: Safari → Share → "Add to Home Screen"

### **APK Creation (Advanced)**
```bash
# Using Capacitor
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/android

# Initialize Capacitor
npx cap init

# Add Android platform
npx cap add android

# Build
npm run build
npx cap sync

# Open in Android Studio
npx cap open android
```

---

## ⚙️ **Environment Configuration**

### **Production Environment Variables**
```bash
# .env file
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Optional: Database URLs, API keys, etc.
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "echo 'No build step required'",
    "test": "echo 'No tests specified'"
  }
}
```

---

## 🔒 **Security & Production Ready**

### **Basic Security**
- [ ] HTTPS enabled
- [ ] Rate limiting
- [ ] Input validation
- [ ] File upload limits
- [ ] CORS configuration

### **Monitoring**
- [ ] Error logging
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Backup strategy

---

## 💰 **Cost Breakdown**

### **Free Options**:
- **Railway**: 500 hours/month free
- **Heroku**: Limited free tier
- **Vercel**: Hobby plan free
- **Netlify**: Starter plan free

### **Paid Options**:
- **DigitalOcean Droplet**: $6/month
- **Railway Pro**: $5/month
- **Heroku Hobby**: $7/month
- **AWS EC2**: $3.50/month (t2.nano)

---

## 👥 **Sharing with Friends**

### **Simple Sharing**:
1. **Deploy to free platform** (Railway/Vercel)
2. **Share URL**: `https://your-app-name.railway.app`
3. **Installation guide**: Send PWA installation instructions

### **Custom Domain** (Optional):
1. **Buy domain**: Namecheap, GoDaddy ($10-15/year)
2. **Configure DNS**: Point to your deployment
3. **Share**: `https://solana-alarms.com`

---

## 🆘 **Troubleshooting**

### **Common Issues**:
- **Port conflicts**: Change port in index.js
- **File upload fails**: Check directory permissions
- **Sound not working**: Ensure HTTPS for mobile
- **PWA not installing**: Check manifest.json

### **Getting Help**:
- **Logs**: Check application logs for errors
- **Network**: Use browser dev tools
- **Mobile testing**: Use Chrome remote debugging

---

## 🎯 **Next Steps**

1. **Choose deployment method** based on your needs
2. **Test thoroughly** before sharing
3. **Create user guide** for friends
4. **Monitor usage** and performance
5. **Add features** based on feedback

**Recommended for beginners**: Start with Railway or Vercel for easiest deployment!

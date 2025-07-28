# 🚀 Solana Price Alarms

A futuristic Progressive Web App (PWA) that monitors Solana token prices and market caps, creating powerful browser-based alarms when your targets are reached.

## 🌟 Features

- 🚨 **Loud Browser Alarms**: Creates actual alarm sounds that can wake you up
- 💰 **Solana Token Monitoring**: Direct Solana address input using Jupiter & DexScreener APIs
- 🔊 **Multiple Sound Types**: Choose from beep, siren, horn, or bell sounds
- 📱 **PWA Support**: Install as mobile app for better background functionality
- 🎨 **Futuristic Dark UI**: Material design inspired interface with Solana branding
- � **Cross-Platform**: Works on desktop and mobile browsers

## 🎯 How It Works

1. **Add Alarms**: Enter any Solana token address (contract address)
2. **Set Targets**: Choose price or market cap triggers
3. **Continuous Monitoring**: App checks prices every minute via Solana APIs
4. **Instant Alerts**: Loud alarm page opens automatically when triggered
5. **Wake Up**: Impossible-to-ignore alarms with sound, vibration, and visual effects

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Application**:
   ```bash
   npm start
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

4. **Install as PWA** (Mobile):
   - On Android: Chrome menu → "Add to Home Screen"
   - On iOS: Safari share → "Add to Home Screen"

## 📱 Mobile Setup (Android)

### Option 1: PWA (Recommended - Easiest)
1. Open the app in Chrome
2. Tap the menu (3 dots) → "Add to Home Screen"
3. The app will behave like a native app
4. Keep the server running on your computer

### Option 2: APK Development (Advanced)
If you want a full native Android app:
1. Use Apache Cordova or Capacitor to wrap the web app
2. Build APK with alarm permissions
3. Enable background processing and wake locks

**Note**: PWA is recommended as it's much simpler and works well for most use cases.

## 💡 Adding Token Alarms

1. **Get Token Address**: 
   - Find any Solana token on Solscan.io, DEXTools, or DexScreener
   - Copy the contract address (e.g., `So11111111111111111111111111111111111111112`)

2. **Create Alarm**:
   - Paste the token address
   - Choose Price or Market Cap trigger
   - Set your target value
   - Select alarm sound

3. **Wait for Alerts**: The app monitors automatically

## 🔊 Sound Types

- **🔔 Beep**: Classic alarm beep (default)
- **🚨 Siren**: Wailing siren sound  
- **📯 Horn**: Car horn-like honking
- **🔔 Bell**: Bell chiming sound

## 📱 Mobile Optimization Tips

1. **Enable Notifications**: Grant permission when prompted
2. **Keep App Open**: Add to home screen and keep in recent apps
3. **Disable Battery Optimization**: In Android settings for better background
4. **Test Volume**: Ensure media volume is up
5. **Wifi/Data**: Ensure stable internet connection

## 🔧 Advanced Setup

### Background Functionality
The PWA includes a service worker for:
- Offline functionality
- Background sync (when supported)
- Push notifications (when implemented)

### For Better Mobile Performance
Add these to your phone settings:
- **Battery**: Exclude app from battery optimization
- **Notifications**: Allow all notifications from the browser
- **Background App Refresh**: Enable for your browser

## 🐛 Troubleshooting

- **No sound**: Check browser audio permissions and device volume
- **Alarm doesn't trigger**: Verify token address is correct
- **Mobile issues**: Try installing as PWA for better functionality
- **Background stops**: Keep the browser/PWA in recent apps

## 🔗 Where to Find Solana Token Addresses

- **Solscan**: `https://solscan.io` (search token → copy address)
- **DexScreener**: `https://dexscreener.com/solana` 
- **Jupiter**: `https://jup.ag` 
- **CoinGecko**: Token page → Contract address

## 🚀 Why This Beats Traditional Apps

- ✅ **No App Store**: Works immediately in any browser
- ✅ **Always Updated**: No need to download updates
- ✅ **Cross-Platform**: Same experience on all devices
- ✅ **Privacy**: No personal data collection
- ✅ **Free**: No subscription fees or API costs

## 🔮 Future Enhancements

- Push notifications for better background alerts
- Multiple token watchlists
- Price history charts
- Social alerts (Discord/Telegram integration)
- Portfolio tracking

Enjoy your automated Solana price alarms! 🌟

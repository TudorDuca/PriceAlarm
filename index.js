const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// Built-in alarm sounds - no file upload needed
const builtInSounds = [
    { value: 'alarm-beep.mp3', label: '🚨 Classic Alarm' },
    { value: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp', label: '📢 Siren' },
    { value: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp', label: '🔔 Bell' },
    { value: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp', label: '📯 Horn' }
];

let alarms = [];
let nextId = 1;

// --- Routes ---

app.get('/', (req, res) => {
    res.render('index', { alarms });
});

app.post('/add', (req, res) => {
    const { tokenAddress, price, sound, triggerType, marketCap } = req.body;
    console.log('Received form data:', { tokenAddress, price, sound, triggerType, marketCap });
    
    if (tokenAddress && (price || marketCap)) {
        const newAlarm = {
            id: nextId++,
            tokenAddress,
            sound: sound || 'beep',
            triggerType: triggerType || 'price',
        };
        if (newAlarm.triggerType === 'price') {
            newAlarm.price = parseFloat(price);
        } else {
            newAlarm.marketCap = parseFloat(marketCap);
        }
        alarms.push(newAlarm);
        console.log('Added new alarm:', newAlarm);
        console.log('Total alarms:', alarms.length);
    } else {
        console.log('Invalid alarm data - missing required fields');
    }
    res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
    const alarm = alarms.find(a => a.id === parseInt(req.params.id));
    if (alarm) {
        res.render('edit', { alarm });
    } else {
        res.redirect('/');
    }
});

app.post('/edit/:id', (req, res) => {
    const { tokenAddress, price, sound, triggerType, marketCap } = req.body;
    const alarm = alarms.find(a => a.id === parseInt(req.params.id));
    if (alarm) {
        alarm.tokenAddress = tokenAddress;
        alarm.sound = sound;
        alarm.triggerType = triggerType || 'price';
        if (alarm.triggerType === 'price') {
            alarm.price = parseFloat(price);
            delete alarm.marketCap;
        } else {
            alarm.marketCap = parseFloat(marketCap);
            delete alarm.price;
        }
    }
    res.redirect('/');
});

app.get('/delete/:id', (req, res) => {
    alarms = alarms.filter(a => a.id !== parseInt(req.params.id));
    res.redirect('/');
});

// Alarm page that plays sound
app.get('/alarm/:id', (req, res) => {
    const alarmId = parseInt(req.params.id);
    const alarm = triggeredAlarms.find(a => a.id === alarmId);
    if (alarm) {
        res.render('alarm', { alarm });
    } else {
        res.redirect('/');
    }
});

// Stop alarm
app.post('/stop-alarm/:id', (req, res) => {
    const alarmId = parseInt(req.params.id);
    triggeredAlarms = triggeredAlarms.filter(a => a.id !== alarmId);
    res.json({ success: true });
});

// API endpoint for background price checking
app.get('/api/check-prices-background', async (req, res) => {
    try {
        await checkPrices();
        res.json({ success: true, checked: alarms.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get current alarms status
app.get('/api/alarms', (req, res) => {
    res.json({ 
        alarms: alarms.length, 
        triggered: triggeredAlarms.length,
        active: alarms.map(a => ({
            id: a.id,
            tokenAddress: a.tokenAddress.substring(0, 8) + '...',
            triggerType: a.triggerType,
            target: a.triggerType === 'price' ? a.price : a.marketCap
        }))
    });
});

// Debug route to show current alarms
app.get('/debug', (req, res) => {
    res.json({ 
        alarms: alarms,
        count: alarms.length,
        triggered: triggeredAlarms
    });
});

let triggeredAlarms = [];

// --- Price Checking Logic ---

async function getTokenInfo(tokenAddress) {
    try {
        // First try to get token info from Jupiter API
        const jupiterResponse = await axios.get(`https://price.jup.ag/v4/price?ids=${tokenAddress}`);
        if (jupiterResponse.data && jupiterResponse.data.data && jupiterResponse.data.data[tokenAddress]) {
            const tokenData = jupiterResponse.data.data[tokenAddress];
            return {
                price: tokenData.price,
                marketCap: tokenData.mintSymbol ? tokenData.price * 1000000000 : null // Estimate if no MC data
            };
        }
    } catch (error) {
        console.log('Jupiter API failed, trying DexScreener...');
    }

    try {
        // Fallback to DexScreener API
        const dexResponse = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
        if (dexResponse.data && dexResponse.data.pairs && dexResponse.data.pairs.length > 0) {
            const pair = dexResponse.data.pairs[0];
            return {
                price: parseFloat(pair.priceUsd),
                marketCap: parseFloat(pair.fdv) || parseFloat(pair.marketCap)
            };
        }
    } catch (error) {
        console.log('DexScreener API failed');
    }

    return null;
}

async function checkPrices() {
    if (alarms.length === 0) {
        return;
    }

    console.log(`Checking prices for ${alarms.length} alarms...`);

    for (const alarm of alarms) {
        try {
            const tokenData = await getTokenInfo(alarm.tokenAddress);
            if (!tokenData) {
                console.log(`No data found for token: ${alarm.tokenAddress}`);
                continue;
            }

            const currentPrice = tokenData.price;
            const currentMarketCap = tokenData.marketCap;
            let triggered = false;
            let message = '';

            if (alarm.triggerType === 'price' && currentPrice && currentPrice >= alarm.price) {
                triggered = true;
                message = `Token ${alarm.tokenAddress.substring(0, 8)}... has reached your target price of $${alarm.price}! Current price: $${currentPrice}`;
            } else if (alarm.triggerType === 'marketCap' && currentMarketCap && currentMarketCap >= alarm.marketCap) {
                triggered = true;
                message = `Token ${alarm.tokenAddress.substring(0, 8)}... has reached your target market cap of $${alarm.marketCap.toLocaleString()}! Current market cap: $${currentMarketCap.toLocaleString()}`;
            }

            if (triggered) {
                // Add to triggered alarms
                const triggeredAlarm = {
                    id: alarm.id,
                    tokenAddress: alarm.tokenAddress,
                    message: message,
                    timestamp: new Date().toLocaleString(),
                    sound: alarm.sound
                };
                triggeredAlarms.push(triggeredAlarm);

                // Try to open browser automatically (Windows)
                const url = `http://localhost:${port}/alarm/${alarm.id}`;
                exec(`start ${url}`, (error) => {
                    if (error) {
                        console.log('Could not auto-open browser:', error.message);
                    }
                });

                console.log('ALARM TRIGGERED:', message);
                
                // Remove alarm after it triggers
                alarms = alarms.filter(a => a.id !== alarm.id);
            }
        } catch (error) {
            console.error(`Error checking price for ${alarm.tokenAddress}:`, error.message);
        }

        // Add small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Check prices every 15 seconds
setInterval(checkPrices, 15000);

// Get available alarm sounds
app.get('/api/sounds', (req, res) => {
    res.json(builtInSounds);
});

app.listen(port, () => {
    console.log(`Price alarm app listening at http://localhost:${port}`);
    console.log('Alarms will automatically open in your browser when triggered.');
});

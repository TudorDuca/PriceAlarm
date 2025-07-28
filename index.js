const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/custom-sounds/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'custom-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept only audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Create custom sounds directory if it doesn't exist
if (!fs.existsSync('public/custom-sounds')) {
    fs.mkdirSync('public/custom-sounds', { recursive: true });
}

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

// Upload custom sound
app.post('/upload-sound', upload.single('soundFile'), (req, res) => {
    if (req.file) {
        const customSoundPath = '/custom-sounds/' + req.file.filename;
        res.json({ 
            success: true, 
            soundPath: customSoundPath,
            filename: req.file.filename,
            originalName: req.file.originalname
        });
    } else {
        res.status(400).json({ success: false, error: 'No file uploaded' });
    }
});

// Get list of custom sounds
app.get('/api/custom-sounds', (req, res) => {
    const customSoundsDir = 'public/custom-sounds';
    if (fs.existsSync(customSoundsDir)) {
        const files = fs.readdirSync(customSoundsDir)
            .filter(file => /\.(mp3|wav|ogg|m4a)$/i.test(file))
            .map(file => ({
                filename: file,
                path: '/custom-sounds/' + file,
                name: file.replace(/^custom-\d+-\d+-/, '').replace(/\.[^.]+$/, '')
            }));
        res.json(files);
    } else {
        res.json([]);
    }
});

app.listen(port, () => {
    console.log(`Price alarm app listening at http://localhost:${port}`);
    console.log('Alarms will automatically open in your browser when triggered.');
});

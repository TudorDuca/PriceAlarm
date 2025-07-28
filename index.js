const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const port = 3000;

// Session configuration for user-specific alarms
app.use(session({
    secret: 'solana-price-alarm-secret-key-fixed',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: false, // Allow HTTP for development
        httpOnly: true
    }
}));

// File to store all user alarms
const ALARMS_FILE = 'user-alarms.json';

// Load all user alarms from file
function loadAllUserAlarms() {
    try {
        if (fs.existsSync(ALARMS_FILE)) {
            const data = fs.readFileSync(ALARMS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('Error loading user alarms:', error.message);
    }
    return {};
}

// Save all user alarms to file
function saveAllUserAlarms() {
    try {
        fs.writeFileSync(ALARMS_FILE, JSON.stringify(allUserAlarms, null, 2));
    } catch (error) {
        console.log('Error saving user alarms:', error.message);
    }
}

// Get user ID from session
function getUserId(req) {
    if (!req.session.userId) {
        req.session.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    return req.session.userId;
}

// Get alarms for specific user
function getUserAlarms(userId) {
    if (!allUserAlarms[userId]) {
        allUserAlarms[userId] = [];
    }
    return allUserAlarms[userId];
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// Built-in alarm sounds - no file upload needed
const builtInSounds = [
    { value: 'alarm-beep.mp3', label: '🚨 Classic Alarm' },
    { value: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp
    { value: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp', label: '🔔 Bell' },
    { value: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmkbBz2O0fLNeSsFJXfH8N2QQAoUXrTp', label: '📯 Horn' }
];

// Global storage for all user alarms
let allUserAlarms = loadAllUserAlarms();

// Get next available ID across all users
function getNextId() {
    let maxId = 0;
    Object.values(allUserAlarms).forEach(userAlarms => {
        userAlarms.forEach(alarm => {
            if (alarm.id > maxId) maxId = alarm.id;
        });
    });
    return maxId + 1;
}

let triggeredAlarms = [];

// --- Routes ---

// Debug route to check session
app.get('/debug-session', (req, res) => {
    const userId = getUserId(req);
    const userAlarms = getUserAlarms(userId);
    res.json({
        sessionId: req.sessionID,
        userId: userId,
        userAlarms: userAlarms,
        totalUsers: Object.keys(allUserAlarms).length,
        allUserAlarms: allUserAlarms
    });
});

app.get('/', (req, res) => {
    const userId = getUserId(req);
    const userAlarms = getUserAlarms(userId);
    console.log(`Rendering index for user ${userId} with ${userAlarms.length} alarms`);
    res.render('index', { alarms: userAlarms });
});

app.post('/add', (req, res) => {
    const { tokenAddress, price, sound, triggerType, marketCap } = req.body;
    const userId = getUserId(req);
    console.log(`User ${userId} adding alarm:`, { tokenAddress, price, sound, triggerType, marketCap });
    
    if (tokenAddress && (price || marketCap)) {
        const userAlarms = getUserAlarms(userId);
        const newAlarm = {
            id: getNextId(),
            tokenAddress,
            sound: sound || 'alarm-beep.mp3',
            triggerType: triggerType || 'price',
            userId: userId
        };
        if (newAlarm.triggerType === 'price') {
            newAlarm.price = parseFloat(price);
        } else {
            newAlarm.marketCap = parseFloat(marketCap);
        }
        userAlarms.push(newAlarm);
        saveAllUserAlarms();
        console.log(`Added new alarm for user ${userId}:`, newAlarm);
        console.log(`User ${userId} total alarms:`, userAlarms.length);
    } else {
        console.log('Invalid alarm data - missing required fields');
    }
    res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
    const userId = getUserId(req);
    const userAlarms = getUserAlarms(userId);
    const alarm = userAlarms.find(a => a.id === parseInt(req.params.id));
    if (alarm) {
        res.render('edit', { alarm });
    } else {
        res.redirect('/');
    }
});

app.post('/edit/:id', (req, res) => {
    const { tokenAddress, price, sound, triggerType, marketCap } = req.body;
    const userId = getUserId(req);
    const userAlarms = getUserAlarms(userId);
    const alarm = userAlarms.find(a => a.id === parseInt(req.params.id));
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
        saveAllUserAlarms();
    }
    res.redirect('/');
});

app.get('/delete/:id', (req, res) => {
    const userId = getUserId(req);
    const userAlarms = getUserAlarms(userId);
    const index = userAlarms.findIndex(a => a.id === parseInt(req.params.id));
    if (index !== -1) {
        userAlarms.splice(index, 1);
        saveAllUserAlarms();
    }
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
    // Get all alarms from all users
    const allAlarms = [];
    Object.values(allUserAlarms).forEach(userAlarms => {
        allAlarms.push(...userAlarms);
    });

    if (allAlarms.length === 0) {
        return;
    }

    console.log(`Checking prices for ${allAlarms.length} alarms across all users...`);

    for (const alarm of allAlarms) {
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
                saveAlarms();
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

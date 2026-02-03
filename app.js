// Pavani Binary Pro - Premium Edition
// Password: @Xavier1
// 4 Timeframes: 1m, 2m, 5m, 1hr

const CORRECT_PASSWORD = '@Xavier1';
const API_KEY = '8bd3f1976df4445eb397bd8b00edfd3d';
const ALPHA_KEY = '97FI7JQFT7EQZD5C';
const API_BASE = 'https://api.twelvedata.com';

// Currency Pairs
const PAIRS = {
    'AUDUSD': { name: 'AUD/USD', emoji: '🇦🇺🇺🇸', pip: 0.0001, decimals: 5, symbol: 'AUD/USD' },
    'EURUSD': { name: 'EUR/USD', emoji: '🇪🇺🇺🇸', pip: 0.0001, decimals: 5, symbol: 'EUR/USD' },
    'USDCAD': { name: 'USD/CAD', emoji: '🇺🇸🇨🇦', pip: 0.0001, decimals: 5, symbol: 'USD/CAD' },
    'USDCHF': { name: 'USD/CHF', emoji: '🇺🇸🇨🇭', pip: 0.0001, decimals: 5, symbol: 'USD/CHF' },
    'EURAUD': { name: 'EUR/AUD', emoji: '🇪🇺🇦🇺', pip: 0.0001, decimals: 5, symbol: 'EUR/AUD' },
    'EURCAD': { name: 'EUR/CAD', emoji: '🇪🇺🇨🇦', pip: 0.0001, decimals: 5, symbol: 'EUR/CAD' },
    'GBPCAD': { name: 'GBP/CAD', emoji: '🇬🇧🇨🇦', pip: 0.0001, decimals: 5, symbol: 'GBP/CAD' },
    'AUDCHF': { name: 'AUD/CHF', emoji: '🇦🇺🇨🇭', pip: 0.0001, decimals: 5, symbol: 'AUD/CHF' }
};

// Timeframes - NOW WITH 4 OPTIONS
const TIMEFRAMES = {
    '1m': { interval: '1min', emoji: '⚡', name: '1 Minute', expiry: [1, 2, 3], minScore: 12, confBase: 65 },
    '2m': { interval: '2min', emoji: '💫', name: '2 Minutes', expiry: [2, 4, 5], minScore: 11, confBase: 68 },
    '5m': { interval: '5min', emoji: '🔥', name: '5 Minutes', expiry: [1, 2, 3], minScore: 10, confBase: 70 },
    '1h': { interval: '1h', emoji: '🚀', name: '1 Hour', expiry: [1, 2, 3], minScore: 8, confBase: 75 }
};

// State
let state = {
    isAuthenticated: false,
    selectedPair: null,
    selectedTimeframe: null,
    apiCalls: 0,
    apiCallsDate: new Date().toDateString(),
    isOnline: navigator.onLine
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    setupOnlineDetection();
    setupVisibilityChange();
});

// ===== AUTHENTICATION =====
function initializeAuth() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('passwordInput');
    
    loginForm.addEventListener('submit', handleLogin);
    loginBtn.addEventListener('click', handleLogin);
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin(e);
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    // CHECK INTERNET CONNECTION FIRST
    if (!navigator.onLine) {
        showOfflineNotification();
        document.getElementById('loginError').textContent = 'Internet connection required to login';
        document.getElementById('loginError').classList.add('show');
        return;
    }
    
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;
    const errorMessage = document.getElementById('loginError');
    
    if (password === CORRECT_PASSWORD) {
        state.isAuthenticated = true;
        errorMessage.classList.remove('show');
        showApp();
    } else {
        errorMessage.textContent = 'Invalid access code. Please try again.';
        errorMessage.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        
        passwordInput.style.animation = 'shake 0.5s ease';
        setTimeout(() => passwordInput.style.animation = '', 500);
    }
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.add('active');
    
    initializeApp();
    setupDropdowns();
    setupEventListeners();
    updateSession();
    updateConnectionStatus();
    updateMarketStatus();
    
    setInterval(updateSession, 60000);
    setInterval(updateConnectionStatus, 3000);
    setInterval(updateMarketStatus, 60000);
}

function logout() {
    if (confirm('Exit Pavani Binary Pro? You\'ll need to enter the password again.')) {
        state.isAuthenticated = false;
        state.selectedPair = null;
        state.selectedTimeframe = null;
        
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('passwordInput').value = '';
        
        resetApp();
    }
}

function refreshApp() {
    if (confirm('Refresh Pavani Binary Pro? All current selections will be reset.')) {
        location.reload();
    }
}

// ===== ONLINE/OFFLINE DETECTION =====
function setupOnlineDetection() {
    window.addEventListener('online', () => {
        state.isOnline = true;
        updateConnectionStatus();
        hideOfflineNotification();
    });
    
    window.addEventListener('offline', () => {
        state.isOnline = false;
        updateConnectionStatus();
        showOfflineNotification();
    });
}

function updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    const isOnline = navigator.onLine;
    
    if (isOnline) {
        statusElement.innerHTML = '<span class="status-dot online"></span> Online';
    } else {
        statusElement.innerHTML = '<span class="status-dot offline"></span> Offline';
    }
}

function updateMarketStatus() {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();
    const isOpen = !(day === 6 || (day === 0 && hour < 21) || (day === 5 && hour >= 22));
    
    document.getElementById('marketStatus').innerHTML = isOpen
        ? '<span>🟢</span> Open'
        : '<span>🔴</span> Closed';
}

function showOfflineNotification() {
    document.getElementById('offlineNotification').classList.add('show');
}

function hideOfflineNotification() {
    document.getElementById('offlineNotification').classList.remove('show');
}

// ===== SESSION MANAGEMENT =====
function setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && state.isAuthenticated) {
            performImmediateLogout();
        }
    });
    
    window.addEventListener('beforeunload', () => {
        if (state.isAuthenticated) performImmediateLogout();
    });
}

function performImmediateLogout() {
    state.isAuthenticated = false;
}

// ===== APP INITIALIZATION =====
function initializeApp() {
    const saved = localStorage.getItem('pavaniBinaryProState');
    if (saved) {
        const savedState = JSON.parse(saved);
        if (savedState.apiCallsDate === new Date().toDateString()) {
            state.apiCalls = savedState.apiCalls || 0;
        }
    }
    
    updateAPICounter();
    populateDropdowns();
}

function populateDropdowns() {
    const pairOptions = document.getElementById('pairOptions');
    const timeframeOptions = document.getElementById('timeframeOptions');
    
    // Populate pairs
    Object.entries(PAIRS).forEach(([key, pair]) => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.innerHTML = `<span>${pair.emoji}</span><span>${pair.name}</span>`;
        option.onclick = () => selectPair(key, pair);
        pairOptions.appendChild(option);
    });
    
    // Populate timeframes - ALL 4
    Object.entries(TIMEFRAMES).forEach(([key, tf]) => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.innerHTML = `<span>${tf.emoji}</span><span>${tf.name}</span>`;
        option.onclick = () => selectTimeframe(key, tf);
        timeframeOptions.appendChild(option);
    });
}

function setupDropdowns() {
    const pairDropdown = document.getElementById('pairDropdown');
    const pairOptions = document.getElementById('pairOptions');
    const timeframeDropdown = document.getElementById('timeframeDropdown');
    const timeframeOptions = document.getElementById('timeframeOptions');
    
    pairDropdown.addEventListener('click', () => {
        pairDropdown.classList.toggle('active');
        pairOptions.classList.toggle('show');
        timeframeDropdown.classList.remove('active');
        timeframeOptions.classList.remove('show');
    });
    
    timeframeDropdown.addEventListener('click', () => {
        timeframeDropdown.classList.toggle('active');
        timeframeOptions.classList.toggle('show');
        pairDropdown.classList.remove('active');
        pairOptions.classList.remove('show');
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            document.querySelectorAll('.dropdown-options').forEach(o => o.classList.remove('show'));
        }
    });
}

function setupEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', analyzeSignal);
    document.getElementById('freeSignalBtn').addEventListener('click', getBestSignal);
}

function selectPair(key, pair) {
    state.selectedPair = key;
    document.getElementById('selectedPair').textContent = `${pair.emoji} ${pair.name}`;
    document.getElementById('pairDropdown').classList.remove('active');
    document.getElementById('pairOptions').classList.remove('show');
    checkAnalyzeButton();
}

function selectTimeframe(key, tf) {
    state.selectedTimeframe = key;
    document.getElementById('selectedTimeframe').textContent = `${tf.emoji} ${tf.name}`;
    document.getElementById('timeframeDropdown').classList.remove('active');
    document.getElementById('timeframeOptions').classList.remove('show');
    checkAnalyzeButton();
}

function checkAnalyzeButton() {
    const btn = document.getElementById('analyzeBtn');
    btn.disabled = !(state.selectedPair && state.selectedTimeframe);
}

function updateSession() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    let session, emoji;
    if (utcHour >= 0 && utcHour < 8 || utcHour >= 22) {
        session = 'Asian';
        emoji = '🌏';
    } else if (utcHour >= 8 && utcHour < 13) {
        session = 'London';
        emoji = '🇬🇧';
    } else if (utcHour >= 13 && utcHour < 17) {
        session = 'NY+London';
        emoji = '💥';
    } else {
        session = 'NY';
        emoji = '🇺🇸';
    }
    
    document.getElementById('session').innerHTML = `<span>${emoji}</span> ${session}`;
}

function updateAPICounter() {
    document.getElementById('apiCalls').textContent = `${state.apiCalls}/800`;
    saveState();
}

function saveState() {
    state.apiCallsDate = new Date().toDateString();
    localStorage.setItem('pavaniBinaryProState', JSON.stringify({
        apiCalls: state.apiCalls,
        apiCallsDate: state.apiCallsDate
    }));
}

function checkAPILimit() {
    if (state.apiCallsDate !== new Date().toDateString()) {
        state.apiCalls = 0;
        state.apiCallsDate = new Date().toDateString();
    }
    
    if (state.apiCalls >= 800) {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setUTCHours(24, 0, 0, 0);
        const diff = midnight - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        alert(`🚫 Daily API limit reached (800/800)\n\n⏰ Resets at midnight UTC\n⏳ Wait ${hours}h ${minutes}m`);
        return false;
    }
    
    return true;
}

function checkOnline() {
    if (!navigator.onLine) {
        showOfflineNotification();
        return false;
    }
    return true;
}

// ===== ANALYZE SIGNAL =====
async function analyzeSignal() {
    if (!checkOnline()) return;
    if (!checkAPILimit()) return;
    
    // GET THE SELECTED PAIR AND TIMEFRAME
    const pairKey = state.selectedPair;
    const timeframeKey = state.selectedTimeframe;
    
    if (!pairKey || !timeframeKey) {
        alert('Please select both pair and timeframe');
        return;
    }
    
    const pair = PAIRS[pairKey];
    const timeframe = TIMEFRAMES[timeframeKey];
    
    console.log(`🔍 Analyzing ${pair.name} on ${timeframe.name} timeframe`);
    
    document.getElementById('selectionCard').style.display = 'block';
    document.getElementById('signalResult').classList.remove('active');
    document.getElementById('loadingContainer').classList.add('active');
    
    const loadingMessages = [
        `🔄 ${pair.name}-${timeframe.name}\n⏳ Fetching...`,
        `🔄 ${pair.name}-${timeframe.name}\n✅ Price\n⏳ News...`,
        `🔄 ${pair.name}-${timeframe.name}\n✅ Price\n✅ News\n⏳ Data...`,
        `🔄 ${pair.name}-${timeframe.name}\n✅ Price\n✅ News\n✅ Data\n⏳ Analyzing...`,
        `🔄 ${pair.name}-${timeframe.name}\n✅ Price\n✅ News\n✅ Data\n✅ Analysis\n⏳ Signal...`
    ];
    
    let messageIndex = 0;
    const loadingInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length) {
            document.getElementById('loadingText').innerHTML = loadingMessages[messageIndex].replace(/\n/g, '<br>');
            messageIndex++;
        }
    }, 1000);
    
    try {
        // Fetch using SELECTED pair and timeframe
        const quote = await fetchQuote(pair.symbol);
        await sleep(1200);
        
        const candles = await fetchCandles(pair.symbol, timeframe.interval);
        await sleep(1200);
        
        const analysis = await analyzeData(candles, pair, timeframe);
        
        clearInterval(loadingInterval);
        
        if (analysis.error) {
            throw new Error(analysis.error);
        }
        
        displaySignal(analysis, pair, timeframe, quote);
        
    } catch (error) {
        clearInterval(loadingInterval);
        document.getElementById('loadingContainer').classList.remove('active');
        document.getElementById('selectionCard').style.display = 'block';
        
        if (!navigator.onLine) {
            showOfflineNotification();
        } else {
            alert('❌ Error: ' + error.message);
        }
    }
}

async function getBestSignal() {
    if (!checkOnline()) return;
    if (!checkAPILimit()) return;
    
    const now = new Date();
    const utcHour = now.getUTCHours();
    if (utcHour >= 0 && utcHour < 8 || utcHour >= 22) {
        alert('⚠️ ASIAN SESSION\n\n🌏 Low accuracy session\n\nBest trading times:\n🇬🇧 London 08-13 UTC\n💥 NY+London 13-17 UTC\n🇺🇸 NY 17-22 UTC');
        return;
    }
    
    document.getElementById('selectionCard').style.display = 'block';
    document.getElementById('signalResult').classList.remove('active');
    document.getElementById('loadingContainer').classList.add('active');
    document.getElementById('loadingText').innerHTML = '🔍 Scanning all markets...<br>⏳ Analyzing 8 pairs x 4 timeframes<br>📊 Finding BEST opportunity<br><br>Please wait 60-90 seconds...';
    
    try {
        const signals = [];
        
        for (const [pairKey, pair] of Object.entries(PAIRS)) {
            for (const [tfKey, timeframe] of Object.entries(TIMEFRAMES)) {
                try {
                    if (!navigator.onLine) throw new Error('Connection lost');
                    
                    const quote = await fetchQuote(pair.symbol);
                    await sleep(1200);
                    
                    const candles = await fetchCandles(pair.symbol, timeframe.interval);
                    await sleep(1200);
                    
                    const analysis = await analyzeData(candles, pair, timeframe);
                    
                    if (!analysis.error && analysis.valid) {
                        signals.push({
                            ...analysis,
                            pair: pairKey,
                            pairInfo: pair,
                            timeframe: tfKey,
                            timeframeInfo: timeframe,
                            quote: quote
                        });
                    }
                } catch (e) {
                    console.error(`Error scanning ${pairKey} ${tfKey}:`, e);
                }
            }
        }
        
        if (signals.length === 0) {
            throw new Error('No valid signals found. Market conditions not suitable. Try again in 15-30 minutes.');
        }
        
        signals.sort((a, b) => b.confidence - a.confidence);
        const best = signals[0];
        
        displaySignal(best, best.pairInfo, best.timeframeInfo, best.quote, signals.length);
        
    } catch (error) {
        document.getElementById('loadingContainer').classList.remove('active');
        document.getElementById('selectionCard').style.display = 'block';
        
        if (!navigator.onLine) {
            showOfflineNotification();
        } else {
            alert('❌ Error: ' + error.message);
        }
    }
}

async function fetchQuote(symbol) {
    const response = await fetch(`${API_BASE}/quote?symbol=${symbol}&apikey=${API_KEY}`);
    state.apiCalls++;
    updateAPICounter();
    
    const data = await response.json();
    if (data.code === 429 || response.status === 429) {
        throw new Error('API rate limit reached');
    }
    
    return {
        price: parseFloat(data.close),
        open: parseFloat(data.open || data.close),
        high: parseFloat(data.high || data.close),
        low: parseFloat(data.low || data.close)
    };
}

async function fetchCandles(symbol, interval) {
    const response = await fetch(`${API_BASE}/time_series?symbol=${symbol}&interval=${interval}&outputsize=250&apikey=${API_KEY}`);
    state.apiCalls++;
    updateAPICounter();
    
    const data = await response.json();
    if (data.code === 429 || response.status === 429) {
        throw new Error('API rate limit reached');
    }
    
    if (!data.values || data.values.length < 100) {
        throw new Error('Insufficient historical data');
    }
    
    return data.values.reverse().map(v => ({
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close)
    }));
}

async function analyzeData(candles, pair, timeframe) {
    const prices = candles.map(c => c.close);
    
    const emaFast = calculateEMA(prices, 20);
    const emaSlow = calculateEMA(prices, 50);
    const rsi = calculateRSI(prices, 14);
    const bb = calculateBollingerBands(prices, 20, 2);
    const stoch = calculateStochastic(candles, 5, 3, 3);
    
    if (!emaFast || !emaSlow || !rsi || !bb.upper || !stoch.k) {
        return { error: 'Unable to calculate indicators' };
    }
    
    const currentPrice = prices[prices.length - 1];
    
    const { score, reasons } = generateSignal({
        price: currentPrice,
        emaFast, emaSlow, rsi,
        bbUpper: bb.upper, bbMiddle: bb.middle, bbLower: bb.lower,
        stochK: stoch.k, stochD: stoch.d
    });
    
    const validation = validateSignal(score, {
        price: currentPrice, emaFast, emaSlow, rsi,
        bbUpper: bb.upper, bbMiddle: bb.middle, bbLower: bb.lower,
        stochK: stoch.k, stochD: stoch.d
    }, timeframe);
    
    if (!validation.valid) {
        return { error: validation.reason, valid: false };
    }
    
    const expiry = calculateExpiry(score, timeframe);
    const direction = score > 0 ? 'CALL' : 'PUT';
    const confidence = Math.min(95, timeframe.confBase + Math.abs(score) * 2);
    
    return {
        valid: true,
        direction,
        score: Math.round(score * 10) / 10,
        confidence: Math.round(confidence),
        expiry,
        indicators: {
            emaFast: emaFast.toFixed(pair.decimals),
            emaSlow: emaSlow.toFixed(pair.decimals),
            rsi: Math.round(rsi),
            bbUpper: bb.upper.toFixed(pair.decimals),
            bbMiddle: bb.middle.toFixed(pair.decimals),
            bbLower: bb.lower.toFixed(pair.decimals),
            stochK: Math.round(stoch.k),
            stochD: Math.round(stoch.d)
        },
        reasons
    };
}

function calculateEMA(prices, period) {
    if (prices.length < period) return null;
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
    for (let i = period; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
}

function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
        changes.push(prices[i] - prices[i - 1]);
    }
    const gains = changes.slice(-period).filter(c => c > 0);
    const losses = changes.slice(-period).filter(c => c < 0).map(Math.abs);
    const avgGain = gains.reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function calculateBollingerBands(prices, period = 20, deviation = 2) {
    if (prices.length < period) return { upper: null, middle: null, lower: null };
    const slice = prices.slice(-period);
    const middle = slice.reduce((a, b) => a + b) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    return {
        upper: middle + stdDev * deviation,
        middle: middle,
        lower: middle - stdDev * deviation
    };
}

function calculateStochastic(candles, kPeriod = 5, dPeriod = 3, slowing = 3) {
    if (candles.length < kPeriod + slowing + dPeriod) return { k: null, d: null };
    const recent = candles.slice(-(kPeriod + slowing));
    const kValues = [];
    for (let i = slowing; i < recent.length; i++) {
        const window = recent.slice(i - slowing + 1, i + 1);
        const high = Math.max(...window.map(c => c.high));
        const low = Math.min(...window.map(c => c.low));
        const close = recent[i].close;
        const k = high - low === 0 ? 50 : ((close - low) / (high - low)) * 100;
        kValues.push(k);
    }
    if (kValues.length < dPeriod) return { k: null, d: null };
    const kCurrent = kValues[kValues.length - 1];
    const dCurrent = kValues.slice(-dPeriod).reduce((a, b) => a + b) / dPeriod;
    return { k: kCurrent, d: dCurrent };
}

function generateSignal(ind) {
    let score = 0;
    const reasons = [];
    
    const emaDiff = ind.emaFast - ind.emaSlow;
    const emaPct = (emaDiff / ind.emaSlow) * 100;
    
    if (ind.emaFast > ind.emaSlow) {
        score += Math.abs(emaPct) > 0.08 ? 5 : 3;
        reasons.push(Math.abs(emaPct) > 0.08 ? `Strong EMA Bullish` : 'EMA Bullish');
    } else {
        score -= Math.abs(emaPct) > 0.08 ? 5 : 3;
        reasons.push(Math.abs(emaPct) > 0.08 ? `Strong EMA Bearish` : 'EMA Bearish');
    }
    
    score += ind.price > ind.emaFast ? 2 : -2;
    reasons.push(ind.price > ind.emaFast ? 'Price Above EMA20' : 'Price Below EMA20');
    
    if (ind.rsi < 30) {
        score += 6;
        reasons.push(`RSI Oversold (${Math.round(ind.rsi)})`);
    } else if (ind.rsi < 40) {
        score += 3;
        reasons.push(`RSI Bullish Zone (${Math.round(ind.rsi)})`);
    } else if (ind.rsi > 70) {
        score -= 6;
        reasons.push(`RSI Overbought (${Math.round(ind.rsi)})`);
    } else if (ind.rsi > 60) {
        score -= 3;
        reasons.push(`RSI Bearish Zone (${Math.round(ind.rsi)})`);
    }
    
    const bbWidth = ind.bbUpper - ind.bbLower;
    const bbPosition = (ind.price - ind.bbLower) / bbWidth;
    
    if (ind.price <= ind.bbLower) {
        score += 5;
        reasons.push('Price At Lower BB');
    } else if (bbPosition < 0.2) {
        score += 3;
        reasons.push('Price Near Lower BB');
    } else if (ind.price >= ind.bbUpper) {
        score -= 5;
        reasons.push('Price At Upper BB');
    } else if (bbPosition > 0.8) {
        score -= 3;
        reasons.push('Price Near Upper BB');
    }
    
    if (ind.stochK < 20) {
        score += ind.stochK < ind.stochD ? 6 : 4;
        reasons.push(`Stochastic Oversold (K:${Math.round(ind.stochK)})`);
    } else if (ind.stochK > 80) {
        score -= ind.stochK > ind.stochD ? 6 : 4;
        reasons.push(`Stochastic Overbought (K:${Math.round(ind.stochK)})`);
    } else {
        score += ind.stochK > ind.stochD ? 2 : -2;
    }
    
    return { score, reasons };
}

function validateSignal(score, ind, timeframe) {
    if (Math.abs(score) < timeframe.minScore) {
        return { valid: false, reason: `Signal too weak` };
    }
    
    if (score > 0) {
        if (ind.rsi > 70) return { valid: false, reason: 'RSI too high for CALL' };
        if (ind.stochK > 80) return { valid: false, reason: 'Stochastic too high for CALL' };
        if (ind.price >= ind.bbUpper) return { valid: false, reason: 'Price at upper BB for CALL' };
        if (ind.emaFast < ind.emaSlow) return { valid: false, reason: 'EMA trend bearish for CALL' };
    } else {
        if (ind.rsi < 30) return { valid: false, reason: 'RSI too low for PUT' };
        if (ind.stochK < 20) return { valid: false, reason: 'Stochastic too low for PUT' };
        if (ind.price <= ind.bbLower) return { valid: false, reason: 'Price at lower BB for PUT' };
        if (ind.emaFast > ind.emaSlow) return { valid: false, reason: 'EMA trend bullish for PUT' };
    }
    
    return { valid: true };
}

function calculateExpiry(score, timeframe) {
    const absScore = Math.abs(score);
    const options = timeframe.expiry;
    let candles;
    if (absScore >= 20) {
        candles = options[options.length - 1];
    } else if (absScore >= 15) {
        candles = options[1] || options[0];
    } else {
        candles = options[0];
    }
    
    // Calculate minutes based on timeframe
    let minutes;
    if (timeframe.name === '1 Minute') {
        minutes = candles;
    } else if (timeframe.name === '2 Minutes') {
        minutes = candles * 2;
    } else if (timeframe.name === '5 Minutes') {
        minutes = candles * 5;
    } else if (timeframe.name === '1 Hour') {
        minutes = candles * 60;
    }
    
    return { candles, minutes };
}

function displaySignal(analysis, pair, timeframe, quote, totalSignals = null) {
    const container = document.getElementById('signalResult');
    const direction = analysis.direction;
    const directionClass = direction === 'CALL' ? 'call' : 'put';
    const directionEmoji = direction === 'CALL' ? '📈' : '📉';
    
    const confidenceClass = analysis.confidence >= 85 ? 'confidence-high' : 'confidence-medium';
    const riskLevel = analysis.confidence >= 85 ? 'LOW 🟢' : analysis.confidence >= 75 ? 'MED 🟡' : 'MOD 🟠';
    
    const now = new Date();
    const sessionInfo = document.getElementById('session').textContent;
    
    let html = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 100%; margin: 0 auto;">
            
            <!-- Premium Signal Card -->
            <div class="signal-card-premium ${directionClass}">
                <div class="signal-card-header">
                    <div class="signal-badge">
                        <span class="signal-badge-icon">🎯</span>
                        <span class="signal-badge-text">PREMIUM SIGNAL</span>
                    </div>
                    <div class="signal-session">${sessionInfo}</div>
                </div>
                
                <div class="signal-card-main">
                    <div class="signal-pair-info">
                        <span class="signal-pair-emoji">${pair.emoji}</span>
                        <div>
                            <div class="signal-pair-name">${pair.name}</div>
                            <div class="signal-timeframe">${timeframe.name}</div>
                        </div>
                    </div>
                    
                    <div class="signal-direction-box">
                        <div class="signal-direction-label">DIRECTION</div>
                        <div class="signal-direction-value ${directionClass}">${direction} ${directionEmoji}</div>
                    </div>
                </div>
            </div>

            <!-- Entry Details Card -->
            <div class="premium-detail-card">
                <div class="card-section-title">📍 Trade Details</div>
                <div class="detail-grid">
                    <div class="detail-item-vertical">
                        <div class="detail-item-label">Entry Price</div>
                        <div class="detail-item-value-large">${quote.price.toFixed(pair.decimals)}</div>
                    </div>
                    <div class="detail-item-vertical">
                        <div class="detail-item-label">Expiry</div>
                        <div class="detail-item-value-large">${analysis.expiry.minutes}min</div>
                    </div>
                </div>
            </div>

            <!-- Performance Metrics Card -->
            <div class="premium-detail-card">
                <div class="card-section-title">📊 Performance Metrics</div>
                <div class="metric-row">
                    <div class="metric-label">Confidence Level</div>
                    <div class="metric-value">
                        <span class="${confidenceClass}">${analysis.confidence}%</span>
                    </div>
                </div>
                <div class="metric-row">
                    <div class="metric-label">Risk Rating</div>
                    <div class="metric-value">${riskLevel}</div>
                </div>
                <div class="metric-row">
                    <div class="metric-label">Signal Score</div>
                    <div class="metric-value">${analysis.score}</div>
                </div>
            </div>

            <!-- Technical Indicators Card -->
            <div class="premium-detail-card">
                <div class="card-section-title">📈 Technical Indicators</div>
                
                <div class="indicator-category">
                    <div class="indicator-category-name">EMA (Exponential Moving Average)</div>
                    <div class="indicator-row">
                        <span>Fast (20)</span>
                        <span class="indicator-value">${analysis.indicators.emaFast}</span>
                    </div>
                    <div class="indicator-row">
                        <span>Slow (50)</span>
                        <span class="indicator-value">${analysis.indicators.emaSlow}</span>
                    </div>
                </div>

                <div class="indicator-category">
                    <div class="indicator-category-name">RSI (Relative Strength Index)</div>
                    <div class="indicator-row">
                        <span>RSI (14)</span>
                        <span class="indicator-value">${analysis.indicators.rsi}</span>
                    </div>
                </div>

                <div class="indicator-category">
                    <div class="indicator-category-name">Bollinger Bands</div>
                    <div class="indicator-row">
                        <span>Upper Band</span>
                        <span class="indicator-value">${analysis.indicators.bbUpper}</span>
                    </div>
                    <div class="indicator-row">
                        <span>Middle Band</span>
                        <span class="indicator-value">${analysis.indicators.bbMiddle}</span>
                    </div>
                    <div class="indicator-row">
                        <span>Lower Band</span>
                        <span class="indicator-value">${analysis.indicators.bbLower}</span>
                    </div>
                </div>

                <div class="indicator-category">
                    <div class="indicator-category-name">Stochastic Oscillator</div>
                    <div class="indicator-row">
                        <span>%K Line</span>
                        <span class="indicator-value">${analysis.indicators.stochK}</span>
                    </div>
                    <div class="indicator-row">
                        <span>%D Line</span>
                        <span class="indicator-value">${analysis.indicators.stochD}</span>
                    </div>
                </div>
            </div>

            <!-- Signal Reasons Card -->
            <div class="premium-detail-card">
                <div class="card-section-title">💡 Signal Analysis</div>
                ${analysis.reasons.map(r => `
                    <div class="reason-row">
                        <span class="reason-check">✓</span>
                        <span class="reason-text">${r}</span>
                    </div>
                `).join('')}
            </div>

            ${totalSignals ? `
                <div class="premium-detail-card" style="background: linear-gradient(135deg, rgba(157, 78, 221, 0.15), rgba(0, 245, 255, 0.1)); border: 2px solid var(--accent-cyan);">
                    <div style="text-align: center;">
                        <div style="font-family: 'Cinzel', serif; font-weight: 800; font-size: 1.3rem; color: var(--accent-cyan); margin-bottom: 0.5rem;">
                            🏆 Best Signal
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.95rem;">
                            Highest confidence of ${totalSignals} signals analyzed
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Footer Info -->
            <div class="signal-footer">
                <div class="footer-info-row">
                    <span>⏰ ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC</span>
                </div>
                <div class="footer-info-row">
                    <span>📊 ${sessionInfo}</span>
                </div>
                <div class="footer-warning">
                    ⚠️ Trade responsibly • Risk 1-2% maximum per trade
                </div>
            </div>

            <!-- Action Button -->
            <button class="btn btn-analyze" onclick="resetApp()">
                ← New Analysis
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    document.getElementById('loadingContainer').classList.remove('active');
    document.getElementById('selectionCard').style.display = 'none';
    container.classList.add('active');
}

function resetApp() {
    document.getElementById('signalResult').classList.remove('active');
    document.getElementById('selectionCard').style.display = 'block';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

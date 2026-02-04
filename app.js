// Pavani Binary Pro - Complete Version
// Password: @Xavier1

const CORRECT_PASSWORD = '@Xavier1';
const API_KEY = '8bd3f1976df4445eb397bd8b00edfd3d';
const API_BASE = 'https://api.twelvedata.com';
const SHARED_STORAGE_KEY = 'pavani_binary_pro_global_api_counter';
const SHARED_DATE_KEY = 'pavani_binary_pro_global_date';

const PAIRS = {
    'AUDUSD': { name: 'AUD/USD', emoji: '🇦🇺🇺🇸', decimals: 5, symbol: 'AUD/USD' },
    'EURUSD': { name: 'EUR/USD', emoji: '🇪🇺🇺🇸', decimals: 5, symbol: 'EUR/USD' },
    'USDCAD': { name: 'USD/CAD', emoji: '🇺🇸🇨🇦', decimals: 5, symbol: 'USD/CAD' },
    'USDCHF': { name: 'USD/CHF', emoji: '🇺🇸🇨🇭', decimals: 5, symbol: 'USD/CHF' },
    'EURAUD': { name: 'EUR/AUD', emoji: '🇪🇺🇦🇺', decimals: 5, symbol: 'EUR/AUD' },
    'EURCAD': { name: 'EUR/CAD', emoji: '🇪🇺🇨🇦', decimals: 5, symbol: 'EUR/CAD' },
    'GBPCAD': { name: 'GBP/CAD', emoji: '🇬🇧🇨🇦', decimals: 5, symbol: 'GBP/CAD' },
    'AUDCHF': { name: 'AUD/CHF', emoji: '🇦🇺🇨🇭', decimals: 5, symbol: 'AUD/CHF' }
};

const TIMEFRAMES = {
    '1m': { interval: '1min', emoji: '⚡', name: '1 Minute', displayName: '1min', expiry: [1,2,3], minScore: 12, confBase: 65 },
    '2m': { interval: '2min', emoji: '💫', name: '2 Minutes', displayName: '2min', expiry: [2,4,5], minScore: 11, confBase: 68 },
    '5m': { interval: '5min', emoji: '🔥', name: '5 Minutes', displayName: '5min', expiry: [1,2,3], minScore: 10, confBase: 70 },
    '1h': { interval: '1h', emoji: '🚀', name: '1 Hour', displayName: '1hr', expiry: [1,2,3], minScore: 8, confBase: 75 }
};

let state = {
    isAuthenticated: false,
    selectedPair: null,
    selectedTimeframe: null,
    apiCalls: 0,
    isOnline: navigator.onLine
};

document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
    setupOnlineDetection();
    setupVisibilityChange();
    setInterval(syncAPICounter, 2000);
});

function getSharedAPICount() {
    try {
        const stored = localStorage.getItem(SHARED_STORAGE_KEY);
        const storedDate = localStorage.getItem(SHARED_DATE_KEY);
        const today = new Date().toDateString();
        if (storedDate !== today) {
            localStorage.setItem(SHARED_STORAGE_KEY, '0');
            localStorage.setItem(SHARED_DATE_KEY, today);
            return 0;
        }
        return parseInt(stored || '0');
    } catch(e) { return 0; }
}

function incrementSharedAPICount() {
    try {
        const current = getSharedAPICount();
        const newCount = current + 1;
        localStorage.setItem(SHARED_STORAGE_KEY, newCount.toString());
        localStorage.setItem(SHARED_DATE_KEY, new Date().toDateString());
        state.apiCalls = newCount;
        updateAPICounter();
        return newCount;
    } catch(e) { return state.apiCalls + 1; }
}

function syncAPICounter() {
    const sharedCount = getSharedAPICount();
    if (sharedCount !== state.apiCalls) {
        state.apiCalls = sharedCount;
        updateAPICounter();
    }
}

function updateAPICounter() {
    const elem = document.getElementById('apiCalls');
    if (elem) elem.textContent = `${state.apiCalls}/800`;
}

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
    if (!navigator.onLine) {
        showOfflineNotification();
        document.getElementById('loginError').textContent = 'Internet required';
        document.getElementById('loginError').classList.add('show');
        return;
    }
    
    const password = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('loginError');
    
    if (password === CORRECT_PASSWORD) {
        state.isAuthenticated = true;
        errorMsg.classList.remove('show');
        showApp();
    } else {
        errorMsg.textContent = 'Invalid password';
        errorMsg.classList.add('show');
        document.getElementById('passwordInput').value = '';
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
    if (confirm('Exit app?')) {
        state.isAuthenticated = false;
        document.getElementById('appContainer').classList.remove('active');
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('passwordInput').value = '';
        resetApp();
    }
}

function refreshApp() {
    if (confirm('Refresh?')) location.reload();
}

function showStatus() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    let session = 'Asian';
    if (utcHour >= 8 && utcHour < 13) session = 'London';
    else if (utcHour >= 13 && utcHour < 17) session = 'NY+London';
    else if (utcHour >= 17 && utcHour < 22) session = 'NY';
    
    const count = getSharedAPICount();
    const remaining = 800 - count;
    const midnight = new Date(now);
    midnight.setUTCHours(24,0,0,0);
    const diff = midnight - now;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    
    const html = `━━━━━━━━━━━━━━━
📊 <b>PAVANI BINARY PRO</b>
━━━━━━━━━━━━━━━

🤖 Status: Active ✅
🌐 Connection: ${navigator.onLine ? 'Online 🟢' : 'Offline 🔴'}

━━━━━━━━━━━━━━━
📈 FEATURES
━━━━━━━━━━━━━━━

💹 Pairs: 8 Currency Pairs
⏱ Timeframes: 1m, 2m, 5m, 1hr
📊 Indicators: EMA, RSI, BB, Stoch
🎯 Analysis: 4 Technical Indicators

━━━━━━━━━━━━━━━
🕐 CURRENT SESSION
━━━━━━━━━━━━━━━

📍 Session: ${session}
⏰ Time: ${now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',hour12:false})} UTC

Trading Sessions:
🌏 Asian: 00-08 UTC (Blocked)
🇬🇧 London: 08-13 UTC (Good)
💥 NY+London: 13-17 UTC (Best)
🇺🇸 NY: 17-22 UTC (Good)

━━━━━━━━━━━━━━━
📊 API USAGE
━━━━━━━━━━━━━━━

📈 Used: ${count}/800
📉 Remaining: ${remaining}
⏰ Resets in: ${hours}h ${mins}m

━━━━━━━━━━━━━━━
⚠️ TRADING RULES
━━━━━━━━━━━━━━━

✅ Trade ONLY 85%+ confidence
✅ Use 5min or 1hr timeframes
✅ Risk 1-2% max per trade
✅ Trade during London/NY sessions

❌ Avoid Asian session
❌ Don't overtrade
❌ Don't use Pocket Option

━━━━━━━━━━━━━━━
🏦 BROKERS
━━━━━━━━━━━━━━━

✅ Deriv.com (Licensed)
✅ IC Markets (Regulated)
✅ Nadex (CFTC - US)

❌ Avoid: Pocket Option

━━━━━━━━━━━━━━━

Password: @Xavier1
Version: 2.0.0`;

    const container = document.getElementById('signalResult');
    container.innerHTML = `<div style="font-size:14px;line-height:1.8;white-space:pre-wrap;font-family:'Courier New',monospace;">${html}</div>
    <button class="btn btn-analyze" onclick="resetApp()" style="margin-top:1.5rem;">← Back</button>`;
    
    document.getElementById('selectionCard').style.display = 'none';
    document.getElementById('loadingContainer').classList.remove('active');
    container.classList.add('active');
}

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
    const elem = document.getElementById('connectionStatus');
    if (elem) {
        elem.innerHTML = navigator.onLine 
            ? '<span class="status-dot online"></span> Online'
            : '<span class="status-dot offline"></span> Offline';
    }
}

function updateMarketStatus() {
    const now = new Date();
    const day = now.getUTCDay();
    const hour = now.getUTCHours();
    const isOpen = !(day === 6 || (day === 0 && hour < 21) || (day === 5 && hour >= 22));
    const elem = document.getElementById('marketStatus');
    if (elem) elem.innerHTML = isOpen ? '<span>🟢</span> Open' : '<span>🔴</span> Closed';
}

function showOfflineNotification() {
    document.getElementById('offlineNotification').classList.add('show');
}

function hideOfflineNotification() {
    document.getElementById('offlineNotification').classList.remove('show');
}

function setupVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && state.isAuthenticated) state.isAuthenticated = false;
    });
}

function initializeApp() {
    state.apiCalls = getSharedAPICount();
    updateAPICounter();
    populateDropdowns();
}

function populateDropdowns() {
    const pairOpts = document.getElementById('pairOptions');
    const tfOpts = document.getElementById('timeframeOptions');
    pairOpts.innerHTML = '';
    tfOpts.innerHTML = '';
    
    Object.entries(PAIRS).forEach(([key, pair]) => {
        const opt = document.createElement('div');
        opt.className = 'dropdown-option';
        opt.innerHTML = `<span>${pair.emoji}</span><span>${pair.name}</span>`;
        opt.onclick = () => selectPair(key, pair);
        pairOpts.appendChild(opt);
    });
    
    Object.entries(TIMEFRAMES).forEach(([key, tf]) => {
        const opt = document.createElement('div');
        opt.className = 'dropdown-option';
        opt.innerHTML = `<span>${tf.emoji}</span><span>${tf.name}</span>`;
        opt.onclick = () => selectTimeframe(key, tf);
        tfOpts.appendChild(opt);
    });
}

function setupDropdowns() {
    const pairDD = document.getElementById('pairDropdown');
    const pairOpts = document.getElementById('pairOptions');
    const tfDD = document.getElementById('timeframeDropdown');
    const tfOpts = document.getElementById('timeframeOptions');
    
    pairDD.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = pairDD.classList.contains('active');
        closeAllDropdowns();
        if (!active) {
            pairDD.classList.add('active');
            pairOpts.classList.add('show');
        }
    });
    
    tfDD.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = tfDD.classList.contains('active');
        closeAllDropdowns();
        if (!active) {
            tfDD.classList.add('active');
            tfOpts.classList.add('show');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) closeAllDropdowns();
    });
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
    document.querySelectorAll('.dropdown-options').forEach(o => o.classList.remove('show'));
}

function setupEventListeners() {
    document.getElementById('analyzeBtn').addEventListener('click', analyzeSignal);
    document.getElementById('freeSignalBtn').addEventListener('click', getBestSignal);
    document.getElementById('statusBtn').addEventListener('click', showStatus);
}

function selectPair(key, pair) {
    state.selectedPair = key;
    document.getElementById('selectedPair').textContent = `${pair.emoji} ${pair.name}`;
    closeAllDropdowns();
    checkAnalyzeButton();
}

function selectTimeframe(key, tf) {
    state.selectedTimeframe = key;
    document.getElementById('selectedTimeframe').textContent = `${tf.emoji} ${tf.name}`;
    closeAllDropdowns();
    checkAnalyzeButton();
}

function checkAnalyzeButton() {
    document.getElementById('analyzeBtn').disabled = !(state.selectedPair && state.selectedTimeframe);
}

function updateSession() {
    const hour = new Date().getUTCHours();
    let session, emoji;
    if (hour >= 0 && hour < 8 || hour >= 22) { session = 'Asian'; emoji = '🌏'; }
    else if (hour >= 8 && hour < 13) { session = 'London'; emoji = '🇬🇧'; }
    else if (hour >= 13 && hour < 17) { session = 'NY+London'; emoji = '💥'; }
    else { session = 'NY'; emoji = '🇺🇸'; }
    
    const elem = document.getElementById('session');
    if (elem) elem.innerHTML = `<span>${emoji}</span> ${session}`;
}

function checkAPILimit() {
    const count = getSharedAPICount();
    const today = new Date().toDateString();
    const stored = localStorage.getItem(SHARED_DATE_KEY);
    
    if (stored !== today) {
        localStorage.setItem(SHARED_STORAGE_KEY, '0');
        localStorage.setItem(SHARED_DATE_KEY, today);
        state.apiCalls = 0;
        updateAPICounter();
        return true;
    }
    
    if (count >= 800) {
        alert('API limit reached (800/800). Resets at midnight UTC.');
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

function checkSession() {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 8 || hour >= 22) {
        return { valid: false, reason: '⚠️ ASIAN SESSION BLOCKED\n\n🌏 Low accuracy\n\n✅ Best times:\n🇬🇧 London: 08-13 UTC\n💥 NY+London: 13-17 UTC\n🇺🇸 NY: 17-22 UTC' };
    }
    return { valid: true };
}

async function analyzeSignal() {
    if (!checkOnline()) return;
    if (!checkAPILimit()) return;
    
    const sessionCheck = checkSession();
    if (!sessionCheck.valid) {
        alert(sessionCheck.reason);
        return;
    }
    
    if (!state.selectedPair || !state.selectedTimeframe) {
        alert('Select pair and timeframe');
        return;
    }
    
    const pair = PAIRS[state.selectedPair];
    const tf = TIMEFRAMES[state.selectedTimeframe];
    
    document.getElementById('selectionCard').style.display = 'block';
    document.getElementById('signalResult').classList.remove('active');
    document.getElementById('loadingContainer').classList.add('active');
    
    const msgs = [
        `🔄 ${pair.name}-${tf.displayName}\n⏳ Fetching...`,
        `🔄 ${pair.name}-${tf.displayName}\n✅ Price\n⏳ News...`,
        `🔄 ${pair.name}-${tf.displayName}\n✅ Price\n✅ News\n⏳ Data...`,
        `🔄 ${pair.name}-${tf.displayName}\n✅ Price\n✅ News\n✅ Data\n⏳ Analyzing...`,
        `🔄 ${pair.name}-${tf.displayName}\n✅ Price\n✅ News\n✅ Data\n✅ Analysis\n⏳ Signal...`
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < msgs.length) {
            document.getElementById('loadingText').innerHTML = msgs[i].replace(/\n/g, '<br>');
            i++;
        }
    }, 1000);
    
    try {
        const quote = await fetchQuote(pair.symbol);
        await sleep(1200);
        const candles = await fetchCandles(pair.symbol, tf.interval);
        await sleep(1200);
        const analysis = await analyzeData(candles, pair, tf);
        
        clearInterval(interval);
        
        if (analysis.error) throw new Error(analysis.error);
        
        displaySignal(analysis, pair, tf, quote);
    } catch(error) {
        clearInterval(interval);
        document.getElementById('loadingContainer').classList.remove('active');
        document.getElementById('selectionCard').style.display = 'block';
        alert('Error: ' + error.message);
    }
}

async function getBestSignal() {
    if (!checkOnline()) return;
    if (!checkAPILimit()) return;
    
    const sessionCheck = checkSession();
    if (!sessionCheck.valid) {
        alert(sessionCheck.reason);
        return;
    }
    
    document.getElementById('selectionCard').style.display = 'block';
    document.getElementById('signalResult').classList.remove('active');
    document.getElementById('loadingContainer').classList.add('active');
    document.getElementById('loadingText').innerHTML = '🔍 Scanning...<br>⏳ 8 pairs x 4 timeframes<br>Wait 60-90s...';
    
    try {
        const signals = [];
        
        for (const [pk, pair] of Object.entries(PAIRS)) {
            for (const [tk, tf] of Object.entries(TIMEFRAMES)) {
                try {
                    if (!navigator.onLine) throw new Error('Connection lost');
                    const quote = await fetchQuote(pair.symbol);
                    await sleep(1200);
                    const candles = await fetchCandles(pair.symbol, tf.interval);
                    await sleep(1200);
                    const analysis = await analyzeData(candles, pair, tf);
                    
                    if (!analysis.error && analysis.valid) {
                        signals.push({
                            ...analysis,
                            pair: pk,
                            pairInfo: pair,
                            timeframe: tk,
                            timeframeInfo: tf,
                            quote: quote
                        });
                    }
                } catch(e) {
                    console.error(`Error ${pk} ${tk}:`, e);
                }
            }
        }
        
        if (signals.length === 0) throw new Error('No valid signals');
        
        signals.sort((a,b) => b.confidence - a.confidence);
        const best = signals[0];
        
        displaySignal(best, best.pairInfo, best.timeframeInfo, best.quote, signals.length);
    } catch(error) {
        document.getElementById('loadingContainer').classList.remove('active');
        document.getElementById('selectionCard').style.display = 'block';
        alert('Error: ' + error.message);
    }
}

async function fetchQuote(symbol) {
    const res = await fetch(`${API_BASE}/quote?symbol=${symbol}&apikey=${API_KEY}`);
    incrementSharedAPICount();
    const data = await res.json();
    if (data.code === 429) throw new Error('API limit');
    return {
        price: parseFloat(data.close),
        open: parseFloat(data.open || data.close),
        high: parseFloat(data.high || data.close),
        low: parseFloat(data.low || data.close)
    };
}

async function fetchCandles(symbol, interval) {
    const res = await fetch(`${API_BASE}/time_series?symbol=${symbol}&interval=${interval}&outputsize=250&apikey=${API_KEY}`);
    incrementSharedAPICount();
    const data = await res.json();
    if (data.code === 429) throw new Error('API limit');
    if (!data.values || data.values.length < 100) throw new Error('Insufficient data');
    return data.values.reverse().map(v => ({
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close)
    }));
}

async function analyzeData(candles, pair, tf) {
    const prices = candles.map(c => c.close);
    const emaF = calculateEMA(prices, 20);
    const emaS = calculateEMA(prices, 50);
    const rsi = calculateRSI(prices, 14);
    const bb = calculateBB(prices, 20, 2);
    const stoch = calculateStoch(candles, 5, 3, 3);
    
    if (!emaF || !emaS || !rsi || !bb.upper || !stoch.k) {
        return { error: 'Calc failed' };
    }
    
    const price = prices[prices.length - 1];
    const { score, reasons } = generateSignal({ price, emaFast: emaF, emaSlow: emaS, rsi, bbUpper: bb.upper, bbMiddle: bb.middle, bbLower: bb.lower, stochK: stoch.k, stochD: stoch.d });
    const valid = validateSignal(score, { price, emaFast: emaF, emaSlow: emaS, rsi, bbUpper: bb.upper, bbMiddle: bb.middle, bbLower: bb.lower, stochK: stoch.k, stochD: stoch.d }, tf);
    
    if (!valid.valid) return { error: valid.reason, valid: false };
    
    const expiry = calcExpiry(score, tf);
    const dir = score > 0 ? 'CALL' : 'PUT';
    const conf = Math.min(95, tf.confBase + Math.abs(score) * 2);
    
    return {
        valid: true,
        direction: dir,
        score: Math.round(score * 10) / 10,
        confidence: Math.round(conf),
        expiry,
        indicators: {
            emaFast: emaF.toFixed(pair.decimals),
            emaSlow: emaS.toFixed(pair.decimals),
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
    let ema = prices.slice(0, period).reduce((a,b) => a + b) / period;
    for (let i = period; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
}

function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    const changes = [];
    for (let i = 1; i < prices.length; i++) changes.push(prices[i] - prices[i-1]);
    const gains = changes.slice(-period).filter(c => c > 0);
    const losses = changes.slice(-period).filter(c => c < 0).map(Math.abs);
    const avgGain = gains.reduce((a,b) => a + b, 0) / period;
    const avgLoss = losses.reduce((a,b) => a + b, 0) / period;
    if (avgLoss === 0) return 100;
    return 100 - (100 / (1 + avgGain / avgLoss));
}

function calculateBB(prices, period = 20, dev = 2) {
    if (prices.length < period) return { upper: null, middle: null, lower: null };
    const slice = prices.slice(-period);
    const mid = slice.reduce((a,b) => a + b) / period;
    const variance = slice.reduce((a,b) => a + Math.pow(b - mid, 2), 0) / period;
    const std = Math.sqrt(variance);
    return { upper: mid + std * dev, middle: mid, lower: mid - std * dev };
}

function calculateStoch(candles, kPer = 5, dPer = 3, slow = 3) {
    if (candles.length < kPer + slow + dPer) return { k: null, d: null };
    const recent = candles.slice(-(kPer + slow));
    const kVals = [];
    for (let i = slow; i < recent.length; i++) {
        const win = recent.slice(i - slow + 1, i + 1);
        const high = Math.max(...win.map(c => c.high));
        const low = Math.min(...win.map(c => c.low));
        const close = recent[i].close;
        const k = high - low === 0 ? 50 : ((close - low) / (high - low)) * 100;
        kVals.push(k);
    }
    if (kVals.length < dPer) return { k: null, d: null };
    const kCur = kVals[kVals.length - 1];
    const dCur = kVals.slice(-dPer).reduce((a,b) => a + b) / dPer;
    return { k: kCur, d: dCur };
}

function generateSignal(ind) {
    let score = 0;
    const reasons = [];
    
    const diff = ind.emaFast - ind.emaSlow;
    const pct = (diff / ind.emaSlow) * 100;
    
    if (ind.emaFast > ind.emaSlow) {
        score += Math.abs(pct) > 0.08 ? 5 : 3;
        reasons.push(Math.abs(pct) > 0.08 ? 'Strong EMA Bullish' : 'EMA Bullish');
    } else {
        score -= Math.abs(pct) > 0.08 ? 5 : 3;
        reasons.push(Math.abs(pct) > 0.08 ? 'Strong EMA Bearish' : 'EMA Bearish');
    }
    
    score += ind.price > ind.emaFast ? 2 : -2;
    reasons.push(ind.price > ind.emaFast ? 'Price Above EMA20' : 'Price Below EMA20');
    
    if (ind.rsi < 30) { score += 6; reasons.push(`RSI Oversold (${Math.round(ind.rsi)})`); }
    else if (ind.rsi < 40) { score += 3; reasons.push(`RSI Bullish (${Math.round(ind.rsi)})`); }
    else if (ind.rsi > 70) { score -= 6; reasons.push(`RSI Overbought (${Math.round(ind.rsi)})`); }
    else if (ind.rsi > 60) { score -= 3; reasons.push(`RSI Bearish (${Math.round(ind.rsi)})`); }
    
    const bbW = ind.bbUpper - ind.bbLower;
    const bbPos = (ind.price - ind.bbLower) / bbW;
    
    if (ind.price <= ind.bbLower) { score += 5; reasons.push('At Lower BB'); }
    else if (bbPos < 0.2) { score += 3; reasons.push('Near Lower BB'); }
    else if (ind.price >= ind.bbUpper) { score -= 5; reasons.push('At Upper BB'); }
    else if (bbPos > 0.8) { score -= 3; reasons.push('Near Upper BB'); }
    
    if (ind.stochK < 20) {
        score += ind.stochK < ind.stochD ? 6 : 4;
        reasons.push(`Stoch Oversold (K:${Math.round(ind.stochK)})`);
    } else if (ind.stochK > 80) {
        score -= ind.stochK > ind.stochD ? 6 : 4;
        reasons.push(`Stoch Overbought (K:${Math.round(ind.stochK)})`);
    } else {
        score += ind.stochK > ind.stochD ? 2 : -2;
    }
    
    return { score, reasons };
}

function validateSignal(score, ind, tf) {
    if (Math.abs(score) < tf.minScore) {
        return { valid: false, reason: 'Signal too weak' };
    }
    
    if (score > 0) {
        if (ind.rsi > 70) return { valid: false, reason: 'RSI too high for CALL' };
        if (ind.stochK > 80) return { valid: false, reason: 'Stoch too high for CALL' };
        if (ind.price >= ind.bbUpper) return { valid: false, reason: 'At upper BB' };
        if (ind.emaFast < ind.emaSlow) return { valid: false, reason: 'EMA bearish' };
    } else {
        if (ind.rsi < 30) return { valid: false, reason: 'RSI too low for PUT' };
        if (ind.stochK < 20) return { valid: false, reason: 'Stoch too low for PUT' };
        if (ind.price <= ind.bbLower) return { valid: false, reason: 'At lower BB' };
        if (ind.emaFast > ind.emaSlow) return { valid: false, reason: 'EMA bullish' };
    }
    
    return { valid: true };
}

function calcExpiry(score, tf) {
    const abs = Math.abs(score);
    const opts = tf.expiry;
    let candles;
    if (abs >= 20) candles = opts[opts.length - 1];
    else if (abs >= 15) candles = opts[1] || opts[0];
    else candles = opts[0];
    
    let mins;
    if (tf.displayName === '1min') mins = candles;
    else if (tf.displayName === '2min') mins = candles * 2;
    else if (tf.displayName === '5min') mins = candles * 5;
    else if (tf.displayName === '1hr') mins = candles * 60;
    
    return { candles, minutes: mins };
}

function displaySignal(analysis, pair, tf, quote, total = null) {
    const dir = analysis.direction;
    const emoji = dir === 'CALL' ? '📈' : '📉';
    const conf = analysis.confidence;
    
    let risk, riskE;
    if (conf >= 85) { risk = 'LOW'; riskE = '🟢'; }
    else if (conf >= 75) { risk = 'MEDIUM'; riskE = '🟡'; }
    else { risk = 'MODERATE'; riskE = '🟠'; }
    
    const now = new Date();
    const sess = document.getElementById('session').textContent;
    
    const html = `━━━━━━━━━━━━━━━
🎯 <b>${dir} ${emoji} SIGNAL</b>
━━━━━━━━━━━━━━━

${pair.emoji} <b>${pair.name}</b>
⏱ <b>${tf.displayName}</b>

━━━━━━━━━━━━━━━
📊 <b>ENTRY DETAILS</b>
━━━━━━━━━━━━━━━

📍 <b>Entry:</b> ${quote.price.toFixed(pair.decimals)}
⏰ <b>Expiry:</b> ${analysis.expiry.minutes}min
✅ <b>Confidence:</b> ${conf}%
⚠️ <b>Risk:</b> ${risk} ${riskE}
📊 <b>Score:</b> ${analysis.score}

━━━━━━━━━━━━━━━
📈 <b>INDICATORS</b>
━━━━━━━━━━━━━━━

<b>EMA (20):</b> ${analysis.indicators.emaFast}
<b>EMA (50):</b> ${analysis.indicators.emaSlow}
<b>RSI (14):</b> ${analysis.indicators.rsi}
<b>BB Upper:</b> ${analysis.indicators.bbUpper}
<b>BB Middle:</b> ${analysis.indicators.bbMiddle}
<b>BB Lower:</b> ${analysis.indicators.bbLower}
<b>Stoch %K:</b> ${analysis.indicators.stochK}
<b>Stoch %D:</b> ${analysis.indicators.stochD}

━━━━━━━━━━━━━━━
💡 <b>REASONS</b>
━━━━━━━━━━━━━━━

${analysis.reasons.map(r => `✓ ${r}`).join('\n')}

${total ? `━━━━━━━━━━━━━━━
🏆 <b>BEST SIGNAL</b>
━━━━━━━━━━━━━━━

Highest of ${total} analyzed

` : ''}━━━━━━━━━━━━━━━
ℹ️ <b>INFO</b>
━━━━━━━━━━━━━━━

⏰ ${now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})} UTC
📍 ${sess}
📊 TwelveData API

━━━━━━━━━━━━━━━
⚠️ <b>WARNINGS</b>
━━━━━━━━━━━━━━━

✅ DO:
• Enter within 5s
• Risk 1-2% max
• Use regulated brokers

❌ DON'T:
• Overtrade
• Use Pocket Option
• Ignore risk rules

━━━━━━━━━━━━━━━
🏦 <b>BROKERS</b>
━━━━━━━━━━━━━━━

✅ Deriv.com
✅ IC Markets
✅ Nadex (US)

❌ Avoid: Pocket Option

━━━━━━━━━━━━━━━

⚠️ Risk warning: Binary options
involve significant risk.
No profit guarantee.`;

    const container = document.getElementById('signalResult');
    container.innerHTML = `<div style="font-size:14px;line-height:1.8;white-space:pre-wrap;font-family:'Courier New',monospace;">${html}</div>
    <button class="btn btn-analyze" onclick="resetApp()" style="margin-top:1.5rem;">← New Analysis</button>`;
    
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

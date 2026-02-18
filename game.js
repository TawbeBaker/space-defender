// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to fullscreen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game State
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let level = 1;
let enemySpawnRate = 2000;
let lastEnemySpawn = 0;
let killCount = 0;
let powerupsCollected = 0;
let isBossLevel = false;
let bossActive = false;
let coins = 0;
let coinsEarned = 0;

let screenShake = { x: 0, y: 0, intensity: 0 };

// Sensitivity multiplier for player movement
let sensitivityMultiplier = 1.0;

// Combo System
let comboCount = 0;
let comboTimer = 0;
let lastKillTime = 0;
const COMBO_TIMEOUT = 3000; // 3 seconds to maintain combo

// Player data with localStorage
let playerData = {
    totalCoins: 0,
    ownedSkins: ['default'],
    equippedSkin: 'default',
    ownedMusic: ['theme1'],
    equippedMusic: 'theme1',
    musicEnabled: true,
    settings: {
        sensitivity: 1.0,
        fullscreen: false
    },
    inventoryPowerups: {
        shield: 0,
        rapidFire: 0,
        multiShot: 0,
        health: 0,
        bomb: 0
    },
    upgrades: {
        damageBoost: 0,
        speedBoost: 0,
        healthBoost: 0,
        coinMultiplier: 0
    },
    stats: {
        gamesPlayed: 0,
        highScore: 0,
        maxLevel: 0,
        totalKills: 0,
        bossesKilled: 0,
        totalCoinsEarned: 0
    }
};

// Music system
let currentMusicOscillators = [];
let musicGainNode = null;
let isMusicPlaying = false;

const musicThemes = {
    theme1: {
        name: 'Space Odyssey',
        price: 0,
        description: 'Thème par défaut',
        melody: [262, 294, 330, 349, 392, 440, 494, 523]
    },
    theme2: {
        name: 'Cyber Warfare',
        price: 800,
        description: 'Rythme électronique',
        melody: [220, 247, 277, 294, 330, 370, 415, 440]
    },
    theme3: {
        name: 'Cosmic Journey',
        price: 1200,
        description: 'Ambiance spatiale',
        melody: [196, 220, 247, 262, 294, 330, 349, 392]
    },
    theme4: {
        name: 'Epic Battle',
        price: 1500,
        description: 'Combat intense',
        melody: [165, 185, 208, 220, 247, 277, 311, 330]
    }
};

// Skins database
const skins = {
    default: {
        name: 'Vaisseau Classique',
        price: 0,
        color: '#4ade80',
        accentColor: '#22c55e',
        description: 'Le vaisseau de base'
    },
    red: {
        name: 'Chasseur Rouge',
        price: 500,
        color: '#ef4444',
        accentColor: '#dc2626',
        description: 'Vitesse et puissance'
    },
    blue: {
        name: 'Croiseur Bleu',
        price: 750,
        color: '#3b82f6',
        accentColor: '#2563eb',
        description: 'Défense améliorée'
    },
    purple: {
        name: 'Vaisseau Plasma',
        price: 1000,
        color: '#a855f7',
        accentColor: '#9333ea',
        description: 'Tir énergétique'
    },
    gold: {
        name: 'Croiseur Doré',
        price: 1500,
        color: '#fbbf24',
        accentColor: '#f59e0b',
        description: '+25% de coins'
    },
    cyan: {
        name: 'Intercepteur Cyan',
        price: 2000,
        color: '#06b6d4',
        accentColor: '#0891b2',
        description: 'Vitesse maximale'
    },
    rainbow: {
        name: 'Vaisseau Arc-en-ciel',
        price: 5000,
        color: '#ec4899',
        accentColor: '#d946ef',
        description: 'Légendaire!'
    }
};

// Load saved data
function loadPlayerData() {
    const saved = localStorage.getItem('spaceDefenderData');
    if (saved) {
        const data = JSON.parse(saved);
        playerData = { ...playerData, ...data };
        coins = playerData.totalCoins;
    }
}

// Save player data
function savePlayerData() {
    playerData.totalCoins = coins;
    localStorage.setItem('spaceDefenderData', JSON.stringify(playerData));
}

// Power-ups state
let activeShield = false;
let shieldDuration = 0;
let activeRapidFire = false;
let rapidFireDuration = 0;
let activeMultiShot = false;
let multiShotDuration = 0;

// Audio Context for sound effects and music
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Music Functions
function startMusic() {
    if (!playerData.musicEnabled || isMusicPlaying) return;
    
    stopMusic();
    isMusicPlaying = true;
    
    const theme = musicThemes[playerData.equippedMusic];
    if (!theme) return;
    
    musicGainNode = audioCtx.createGain();
    musicGainNode.gain.value = 0.1;
    musicGainNode.connect(audioCtx.destination);
    
    let noteIndex = 0;
    
    function playNote() {
        if (!isMusicPlaying) return;
        
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = theme.melody[noteIndex];
        
        const noteGain = audioCtx.createGain();
        noteGain.gain.value = 0;
        noteGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
        noteGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
        
        osc.connect(noteGain);
        noteGain.connect(musicGainNode);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
        
        currentMusicOscillators.push(osc);
        
        noteIndex = (noteIndex + 1) % theme.melody.length;
        
        setTimeout(playNote, 500);
    }
    
    playNote();
}

function stopMusic() {
    isMusicPlaying = false;
    currentMusicOscillators.forEach(osc => {
        try {
            osc.stop();
        } catch (e) {}
    });
    currentMusicOscillators = [];
    if (musicGainNode) {
        musicGainNode.disconnect();
    }
}

function toggleMusic() {
    playerData.musicEnabled = !playerData.musicEnabled;
    savePlayerData();
    
    if (playerData.musicEnabled && gameRunning) {
        startMusic();
    } else {
        stopMusic();
    }
    
    updateMusicButton();
}

function updateMusicButton() {
    const btn = document.getElementById('musicToggle');
    if (btn) {
        btn.textContent = playerData.musicEnabled ? '🔊 Musique' : '🔇 Musique';
    }
}

function playSound(type) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    switch(type) {
        case 'shoot':
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'explosion':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
            break;
        case 'powerup':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;
        case 'hit':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;
        case 'levelUp':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;
        case 'boss':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(60, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 1);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 1);
            break;
    }
}

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 7,
    baseSpeed: 7,
    color: '#4ade80',
    accentColor: '#22c55e',
    movingLeft: false,
    movingRight: false,
    
    updateColors() {
        const skin = skins[playerData.equippedSkin];
        if (skin) {
            this.color = skin.color;
            this.accentColor = skin.accentColor;
        }
        // Update speed based on upgrades and sensitivity
        this.speed = this.baseSpeed * (1 + (playerData.upgrades.speedBoost || 0) * 0.15) * (playerData.settings?.sensitivity || 1.0);
    },
    
    draw() {
        ctx.save();
        
        // Shield effect
        if (activeShield) {
            const shieldGradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2, 20,
                this.x + this.width / 2, this.y + this.height / 2, 40
            );
            shieldGradient.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
            shieldGradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.5)');
            shieldGradient.addColorStop(1, 'rgba(96, 165, 250, 0.1)');
            
            ctx.fillStyle = shieldGradient;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 38, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#60a5fa';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 38, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Spaceship body with gradient
        const bodyGradient = ctx.createLinearGradient(
            this.x, this.y, this.x, this.y + this.height
        );
        bodyGradient.addColorStop(0, this.color);
        bodyGradient.addColorStop(1, this.accentColor);
        
        ctx.fillStyle = bodyGradient;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 15);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Cockpit with glow
        const cockpitGradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + 20, 2,
            this.x + this.width / 2, this.y + 20, 10
        );
        cockpitGradient.addColorStop(0, '#ffffff');
        cockpitGradient.addColorStop(0.5, '#60a5fa');
        cockpitGradient.addColorStop(1, this.accentColor);
        
        ctx.fillStyle = cockpitGradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 20, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine flames with gradient
        const flameGradient1 = ctx.createLinearGradient(
            this.x + 15, this.y + this.height,
            this.x + 20, this.y + this.height + 15
        );
        flameGradient1.addColorStop(0, '#fbbf24');
        flameGradient1.addColorStop(0.5, '#f97316');
        flameGradient1.addColorStop(1, 'rgba(249, 115, 22, 0)');
        
        ctx.fillStyle = flameGradient1;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + this.height);
        ctx.lineTo(this.x + 20, this.y + this.height + 12 + Math.random() * 8);
        ctx.lineTo(this.x + 15, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        const flameGradient2 = ctx.createLinearGradient(
            this.x + this.width - 15, this.y + this.height,
            this.x + this.width - 20, this.y + this.height + 15
        );
        flameGradient2.addColorStop(0, '#fbbf24');
        flameGradient2.addColorStop(0.5, '#f97316');
        flameGradient2.addColorStop(1, 'rgba(249, 115, 22, 0)');
        
        ctx.fillStyle = flameGradient2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width - 10, this.y + this.height);
        ctx.lineTo(this.x + this.width - 20, this.y + this.height + 12 + Math.random() * 8);
        ctx.lineTo(this.x + this.width - 15, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Wings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + 25);
        ctx.lineTo(this.x - 5, this.y + 35);
        ctx.lineTo(this.x + 10, this.y + 40);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width - 5, this.y + 25);
        ctx.lineTo(this.x + this.width + 5, this.y + 35);
        ctx.lineTo(this.x + this.width - 10, this.y + 40);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    },
    
    update() {
        if (this.movingLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (this.movingRight && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }
};

// Projectiles
const projectiles = [];

class Projectile {
    constructor(x, y, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        // Progressive difficulty: both player and enemy projectiles get faster with level
        const levelSpeedBoost = 1 + (level * 0.15);
        this.speed = isEnemy ? (5 + level * 0.5) * levelSpeedBoost : (-10 - level * 0.3) * levelSpeedBoost;
        this.isEnemy = isEnemy;
        this.color = isEnemy ? '#f87171' : '#4ade80';
    }
    
    draw() {
        ctx.save();
        
        // Projectile with gradient and trail
        const gradient = ctx.createLinearGradient(
            this.x, this.y, this.x, this.y + this.height
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Main projectile
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Core glow
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 1, this.y + 2, this.width - 2, this.height - 8);
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    update() {
        this.y += this.speed;
    }
}

// Enemies
const enemies = [];

class Enemy {
    constructor(isBoss = false) {
        this.isBoss = isBoss;
        this.width = isBoss ? 80 : 40;
        this.height = isBoss ? 80 : 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        // Progressive difficulty: enemies get faster with each level
        const levelMultiplier = 1 + (level * 0.5);
        this.speed = isBoss ? (0.5 + level * 0.2) : (1 + Math.random() * 2 + (level * 0.5)) * levelMultiplier;
        this.health = isBoss ? 50 + (level * 15) : (1 + Math.floor(level / 3));
        this.maxHealth = this.health;
        this.shootCooldown = 0;
        this.type = Math.floor(Math.random() * 3);
        
        if (isBoss) {
            this.x = canvas.width / 2 - this.width / 2;
            this.directionX = 2 + level * 0.3;
        }
    }
    
    draw() {
        ctx.save();
        
        if (this.isBoss) {
            // Boss appearance with enhanced graphics
            const bossGradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2, 10,
                this.x + this.width / 2, this.y + this.height / 2, this.width / 2
            );
            bossGradient.addColorStop(0, '#ff0000');
            bossGradient.addColorStop(0.5, '#8b0000');
            bossGradient.addColorStop(1, '#4a0000');
            
            ctx.fillStyle = bossGradient;
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 30;
            
            // Boss body
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, 
                        this.width / 2, this.height / 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Boss spikes
            ctx.fillStyle = '#a00000';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x = this.x + this.width / 2 + Math.cos(angle) * (this.width / 2.5);
                const y = this.y + this.height / 2 + Math.sin(angle) * (this.height / 3);
                
                ctx.beginPath();
                ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
                ctx.lineTo(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10);
                ctx.lineTo(x + Math.cos(angle + 0.3) * 5, y + Math.sin(angle + 0.3) * 5);
                ctx.closePath();
                ctx.fill();
            }
            
            // Boss eyes with glow
            const eyeGradient = ctx.createRadialGradient(this.x + 25, this.y + 30, 2, this.x + 25, this.y + 30, 10);
            eyeGradient.addColorStop(0, '#ffffff');
            eyeGradient.addColorStop(0.5, '#ff0000');
            eyeGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = eyeGradient;
            ctx.beginPath();
            ctx.arc(this.x + 25, this.y + 30, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.x + 55, this.y + 30, 10, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        } else {
            const colors = ['#f87171', '#fb923c', '#a78bfa'];
            const color = colors[this.type];
            
            // Alien ship body with gradient
            const alienGradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2 - 5, 5,
                this.x + this.width / 2, this.y + this.height / 2, this.width / 2
            );
            alienGradient.addColorStop(0, color);
            alienGradient.addColorStop(1, color + '80');
            
            ctx.fillStyle = alienGradient;
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, 
                        this.width / 2, this.height / 3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            // Dome with reflection
            const domeGradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2 - 8, 2,
                this.x + this.width / 2, this.y + this.height / 2 - 5, 12
            );
            domeGradient.addColorStop(0, '#ffffff');
            domeGradient.addColorStop(0.3, '#60a5fa');
            domeGradient.addColorStop(1, '#2563eb');
            
            ctx.fillStyle = domeGradient;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2 - 5, 10, Math.PI, 0);
            ctx.fill();
            
            // Alien details
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, 
                        this.width / 2, this.height / 3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Health bar with gradient
        if (this.health < this.maxHealth) {
            const barWidth = this.isBoss ? this.width : this.width;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(this.x - 2, this.y - 12, barWidth + 4, 9);
            
            // Border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x - 2, this.y - 12, barWidth + 4, 9);
            
            // Health
            const healthPercent = this.health / this.maxHealth;
            const healthGradient = ctx.createLinearGradient(this.x, 0, this.x + barWidth, 0);
            
            if (this.isBoss) {
                healthGradient.addColorStop(0, '#ff0000');
                healthGradient.addColorStop(1, '#ff6666');
            } else {
                if (healthPercent > 0.5) {
                    healthGradient.addColorStop(0, '#4ade80');
                    healthGradient.addColorStop(1, '#22c55e');
                } else if (healthPercent > 0.25) {
                    healthGradient.addColorStop(0, '#fbbf24');
                    healthGradient.addColorStop(1, '#f59e0b');
                } else {
                    healthGradient.addColorStop(0, '#f87171');
                    healthGradient.addColorStop(1, '#ef4444');
                }
            }
            
            ctx.fillStyle = healthGradient;
            ctx.fillRect(this.x, this.y - 10, barWidth * healthPercent, 5);
        }
        
        ctx.restore();
    }
    
    update() {
        if (this.isBoss) {
            // Boss movement pattern
            this.x += this.directionX;
            if (this.x <= 0 || this.x >= canvas.width - this.width) {
                this.directionX *= -1;
                this.y += 10;
            }
            // Boss shoots more frequently
            this.shootCooldown--;
            if (this.shootCooldown <= 0) {
                projectiles.push(new Projectile(this.x + this.width / 2 - 2, this.y + this.height, true));
                projectiles.push(new Projectile(this.x + 20, this.y + this.height, true));
                projectiles.push(new Projectile(this.x + this.width - 20, this.y + this.height, true));
                this.shootCooldown = 40;
            }
        } else {
            this.y += this.speed;
            
            // Enemy shooting - more aggressive with level
            this.shootCooldown--;
            if (this.shootCooldown <= 0 && Math.random() < 0.005 * level * (1 + level * 0.1)) {
                projectiles.push(new Projectile(this.x + this.width / 2 - 2, this.y + this.height, true));
                this.shootCooldown = Math.max(40, 60 - level * 2);
            }
        }
    }
}

// Power-ups
const powerups = [];

class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.rotation = 0;
        
        // Power-up types: shield, rapidFire, multiShot, health, bomb
        const types = ['shield', 'rapidFire', 'multiShot', 'health', 'bomb'];
        const weights = [20, 25, 20, 15, 20];
        let random = Math.random() * 100;
        let cumulative = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                this.type = types[i];
                break;
            }
        }
        
        this.colors = {
            shield: '#60a5fa',
            rapidFire: '#fbbf24',
            multiShot: '#a78bfa',
            health: '#f87171',
            bomb: '#fb923c'
        };
        
        this.icons = {
            shield: '🛡️',
            rapidFire: '⚡',
            multiShot: '🔱',
            health: '❤️',
            bomb: '💥'
        };
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Glow effect
        ctx.shadowColor = this.colors[this.type];
        ctx.shadowBlur = 15;
        
        // Power-up box
        ctx.fillStyle = this.colors[this.type];
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        ctx.shadowBlur = 0;
        
        // Icon
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.icons[this.type], 0, 0);
        
        ctx.restore();
    }
    
    update() {
        this.y += this.speed;
        this.rotation += 0.05;
    }
}

// Explosions
const explosions = [];

class Explosion {
    constructor(x, y, isBig = false) {
        this.x = x;
        this.y = y;
        this.particles = [];
        const particleCount = isBig ? 30 : 15;
        const speedMultiplier = isBig ? 1.5 : 1;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8 * speedMultiplier,
                vy: (Math.random() - 0.5) * 8 * speedMultiplier,
                life: 30,
                maxLife: 30,
                size: Math.random() * 3 + 2,
                color: ['#f97316', '#fbbf24', '#ef4444', '#fff'][Math.floor(Math.random() * 4)]
            });
        }
    }
    
    draw() {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
    
    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    isDead() {
        return this.particles.length === 0;
    }
}

// Screen Shake Functions
function applyScreenShake(intensity) {
    screenShake.intensity = intensity;
}

function updateScreenShake() {
    if (screenShake.intensity > 0) {
        screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.intensity *= 0.9; // Decay
        
        if (screenShake.intensity < 0.5) {
            screenShake.intensity = 0;
            screenShake.x = 0;
            screenShake.y = 0;
        }
    }
}

// Combo System Functions
function updateCombo(timestamp) {
    if (comboCount > 0 && timestamp - lastKillTime > COMBO_TIMEOUT) {
        comboCount = 0;
    }
}

function addKillToCombo(timestamp) {
    lastKillTime = timestamp;
    comboCount++;
    
    if (comboCount > 1) {
        // Show combo text effect
        const comboBonus = Math.floor(50 * comboCount);
        score += comboBonus;
        playSound('powerup');
    }
}

function getComboMultiplier() {
    return 1 + (comboCount * 0.1);
}

function drawCombo() {
    if (comboCount > 1) {
        const comboAlpha = Math.min(1, (COMBO_TIMEOUT - (Date.now() - lastKillTime)) / 1000);
        ctx.globalAlpha = comboAlpha;
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        
        const text = `COMBO x${comboCount}!`;
        const textWidth = ctx.measureText(text).width;
        const x = canvas.width - textWidth - 20;
        const y = 100;
        
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.globalAlpha = 1;
    }
}

// Stars background
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 2 + 0.5
    });
}

function drawStars() {
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.globalAlpha = Math.random() * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
    ctx.globalAlpha = 1;
}

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        player.movingLeft = true;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        player.movingRight = true;
    }
    if (e.code === 'Space' && gameRunning && !gamePaused) {
        shoot();
        e.preventDefault();
    }
    if (e.code === 'KeyP' && gameRunning) {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        player.movingLeft = false;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        player.movingRight = false;
    }
});

let canShoot = true;
function shoot() {
    if (!canShoot) return;
    
    if (activeMultiShot) {
        // Triple shot
        projectiles.push(new Projectile(player.x + player.width / 2 - 2, player.y));
        projectiles.push(new Projectile(player.x + 10, player.y + 10));
        projectiles.push(new Projectile(player.x + player.width - 10, player.y + 10));
    } else {
        projectiles.push(new Projectile(player.x + player.width / 2 - 2, player.y));
    }
    
    playSound('shoot');
    
    canShoot = false;
    const cooldown = activeRapidFire ? 100 : 200;
    setTimeout(() => canShoot = true, cooldown);
}

function togglePause() {
    gamePaused = !gamePaused;
    document.getElementById('pauseScreen').classList.toggle('hidden', !gamePaused);
}

// Fullscreen functionality
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Update sensitivity value
function updateSensitivity(value) {
    playerData.settings.sensitivity = Math.max(0.5, Math.min(2.0, parseFloat(value)));
    player.updateColors();
    savePlayerData();
    const sensitivityDisplay = document.getElementById('sensitivityValue');
    if (sensitivityDisplay) {
        sensitivityDisplay.textContent = (playerData.settings.sensitivity * 100).toFixed(0) + '%';
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('coins').textContent = coins;
    
    const maxLives = 3 + (playerData.upgrades.healthBoost || 0);
    let heartsHTML = '';
    for (let i = 0; i < lives; i++) {
        heartsHTML += '❤️';
    }
    document.getElementById('lives').textContent = heartsHTML || '💔';
    
    // Update progress bar
    const scoreThreshold = level * 500;
    const prevThreshold = (level - 1) * 500;
    const progress = score - prevThreshold;
    const progressPercentage = (progress / (scoreThreshold - prevThreshold)) * 100;
    
    document.getElementById('progressBar').style.width = Math.min(progressPercentage, 100) + '%';
    document.getElementById('nextLevel').textContent = level + 1;
    document.getElementById('currentProgress').textContent = progress;
    document.getElementById('progressGoal').textContent = scoreThreshold - prevThreshold;
    
    // Update power-up timers
    updatePowerupUI();
}

function updatePowerupUI() {
    if (activeShield) {
        document.getElementById('activeShield').classList.remove('hidden');
        document.getElementById('shieldTime').textContent = Math.ceil(shieldDuration / 60);
    } else {
        document.getElementById('activeShield').classList.add('hidden');
    }
    
    if (activeRapidFire) {
        document.getElementById('activeRapidFire').classList.remove('hidden');
        document.getElementById('rapidFireTime').textContent = Math.ceil(rapidFireDuration / 60);
    } else {
        document.getElementById('activeRapidFire').classList.add('hidden');
    }
    
    if (activeMultiShot) {
        document.getElementById('activeMultiShot').classList.remove('hidden');
        document.getElementById('multiShotTime').textContent = Math.ceil(multiShotDuration / 60);
    } else {
        document.getElementById('activeMultiShot').classList.add('hidden');
    }
}

function getCoinMultiplier() {
    let multiplier = 1;
    if (playerData.equippedSkin === 'gold') {
        multiplier += 0.25;
    }
    multiplier += (playerData.upgrades.coinMultiplier || 0) * 0.1;
    return multiplier;
}

function activatePowerup(type) {
    powerupsCollected++;
    playSound('powerup');
    
    switch(type) {
        case 'shield':
            activeShield = true;
            shieldDuration = 600;
            break;
        case 'rapidFire':
            activeRapidFire = true;
            rapidFireDuration = 480;
            break;
        case 'multiShot':
            activeMultiShot = true;
            multiShotDuration = 480;
            break;
        case 'health':
            const maxLives = 5 + (playerData.upgrades.healthBoost || 0);
            if (lives < maxLives) {
                lives++;
            }
            score += 50;
            break;
        case 'bomb':
            enemies.forEach(enemy => {
                explosions.push(new Explosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                if (!enemy.isBoss) {
                    const baseScore = 50;
                    score += baseScore;
                    const coinsAwarded = Math.floor(baseScore / 20) * getCoinMultiplier();
                    coins += coinsAwarded;
                    coinsEarned += coinsAwarded;
                    killCount++;
                } else {
                    const bossScore = 100;
                    score += bossScore;
                    const coinsAwarded = Math.floor(bossScore / 10) * getCoinMultiplier();
                    coins += coinsAwarded;
                    coinsEarned += coinsAwarded;
                    killCount++;
                    playerData.stats.bossesKilled++;
                    bossActive = false;
                }
            });
            enemies.length = 0;
            playSound('explosion');
            break;
    }
    updateUI();
}

function updatePowerupTimers() {
    if (activeShield) {
        shieldDuration--;
        if (shieldDuration <= 0) {
            activeShield = false;
            shieldDuration = 0;
        }
    }
    
    if (activeRapidFire) {
        rapidFireDuration--;
        if (rapidFireDuration <= 0) {
            activeRapidFire = false;
            rapidFireDuration = 0;
        }
    }
    
    if (activeMultiShot) {
        multiShotDuration--;
        if (multiShotDuration <= 0) {
            activeMultiShot = false;
            multiShotDuration = 0;
        }
    }
}

function spawnEnemy(timestamp) {
    if (bossActive) return;
    
    if (timestamp - lastEnemySpawn > enemySpawnRate) {
        enemies.push(new Enemy());
        lastEnemySpawn = timestamp;
    }
}

function trySpawnPowerup(x, y) {
    if (Math.random() < 0.15) {
        powerups.push(new Powerup(x, y));
    }
}

function checkLevelUp() {
    const scoreThreshold = level * 500;
    if (score >= scoreThreshold) {
        level++;
        // Progressive difficulty: spawn rate increases significantly per level
        enemySpawnRate = Math.max(300, 2000 - (level * 200));
        playSound('levelUp');
        
        if (level % 5 === 0) {
            triggerBossFight();
        }
    }
}

function triggerBossFight() {
    isBossLevel = true;
    bossActive = true;
    enemies.length = 0;
    
    document.getElementById('bossLevel').textContent = level;
    document.getElementById('bossScreen').classList.remove('hidden');
    playSound('boss');
    
    stopMusic();
    setTimeout(() => {
        document.getElementById('bossScreen').classList.add('hidden');
        enemies.push(new Enemy(true));
    }, 3000);
}

function gameOver() {
    gameRunning = false;
    
    playerData.stats.gamesPlayed++;
    if (score > playerData.stats.highScore) {
        playerData.stats.highScore = score;
    }
    if (level > playerData.stats.maxLevel) {
        playerData.stats.maxLevel = level;
    }
    playerData.stats.totalKills += killCount;
    playerData.stats.totalCoinsEarned += coinsEarned;
    
    savePlayerData();
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('finalKills').textContent = killCount;
    document.getElementById('finalPowerups').textContent = powerupsCollected;
    document.getElementById('coinsEarned').textContent = coinsEarned;
    document.getElementById('totalCoinsEnd').textContent = coins;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function resetGame() {
    score = 0;
    lives = 3 + (playerData.upgrades.healthBoost || 0);
    level = 1;
    killCount = 0;
    powerupsCollected = 0;
    coinsEarned = 0;
    enemySpawnRate = 2000;
    isBossLevel = false;
    bossActive = false;
    activeShield = false;
    shieldDuration = 0;
    activeRapidFire = false;
    rapidFireDuration = 0;
    activeMultiShot = false;
    multiShotDuration = 0;
    comboCount = 0;
    lastKillTime = 0;
    screenShake = { x: 0, y: 0, intensity: 0 };
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 80;
    player.updateColors();
    projectiles.length = 0;
    enemies.length = 0;
    explosions.length = 0;
    powerups.length = 0;
    updateUI();
}

function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    if (!gamePaused) {
        // Update combo timer
        updateCombo(timestamp);
        
        // Update screen shake
        updateScreenShake();
        
        // Apply screen shake to context
        ctx.save();
        ctx.translate(screenShake.x, screenShake.y);
        
        ctx.fillStyle = 'rgba(0, 0, 17, 0.3)';
        ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
        
        drawStars();
        updatePowerupTimers();
        spawnEnemy(timestamp);
        
        player.update();
        player.draw();
        
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            proj.update();
            proj.draw();
            
            if (proj.y < -20 || proj.y > canvas.height + 20) {
                projectiles.splice(i, 1);
                continue;
            }
            
            if (proj.isEnemy && checkCollision(proj, player)) {
                projectiles.splice(i, 1);
                
                if (!activeShield) {
                    lives--;
                    applyScreenShake(10);
                    playSound('hit');
                    updateUI();
                    
                    if (lives <= 0) {
                        gameOver();
                        return;
                    }
                } else {
                    // Shield deflected hit
                    applyScreenShake(3);
                }
            }
        }
        
        for (let i = powerups.length - 1; i >= 0; i--) {
            const powerup = powerups[i];
            powerup.update();
            powerup.draw();
            
            if (powerup.y > canvas.height) {
                powerups.splice(i, 1);
                continue;
            }
            
            if (checkCollision(powerup, player)) {
                activatePowerup(powerup.type);
                powerups.splice(i, 1);
            }
        }
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            enemy.update();
            enemy.draw();
            
            if (enemy.y > canvas.height + 50) {
                enemies.splice(i, 1);
                continue;
            }
            
            if (checkCollision(enemy, player)) {
                explosions.push(new Explosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                applyScreenShake(enemy.isBoss ? 20 : 8);
                enemies.splice(i, 1);
                
                if (enemy.isBoss) {
                    bossActive = false;
                }
                
                if (!activeShield) {
                    lives--;
                    playSound('hit');
                    updateUI();
                    
                    if (lives <= 0) {
                        gameOver();
                        return;
                    }
                }
                continue;
            }
            
            for (let j = projectiles.length - 1; j >= 0; j--) {
                const proj = projectiles[j];
                if (!proj.isEnemy && checkCollision(proj, enemy)) {
                    projectiles.splice(j, 1);
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        explosions.push(new Explosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.isBoss));
                        
                        // Apply screen shake
                        applyScreenShake(enemy.isBoss ? 15 : 5);
                        
                        // Add to combo
                        addKillToCombo(timestamp);
                        
                        const baseScore = enemy.isBoss ? 1000 : (100 * enemy.maxHealth);
                        const comboMultiplier = getComboMultiplier();
                        score += Math.floor(baseScore * comboMultiplier);
                        
                        const coinsAwarded = Math.floor(baseScore / (enemy.isBoss ? 10 : 20)) * getCoinMultiplier() * comboMultiplier;
                        coins += Math.floor(coinsAwarded);
                        coinsEarned += Math.floor(coinsAwarded);
                        
                        killCount++;
                        
                        if (enemy.isBoss) {
                            bossActive = false;
                            isBossLevel = false;
                            playerData.stats.bossesKilled++;
                            powerups.push(new Powerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                        } else {
                            trySpawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        }
                        
                        enemies.splice(i, 1);
                        playSound('explosion');
                        updateUI();
                        checkLevelUp();
                    }
                    break;
                }
            }
        }
        
        for (let i = explosions.length - 1; i >= 0; i--) {
            explosions[i].update();
            explosions[i].draw();
            
            if (explosions[i].isDead()) {
                explosions.splice(i, 1);
            }
        }
        
        // Draw combo indicator
        drawCombo();
        
        // Restore context after screen shake
        ctx.restore();
    }
    
    requestAnimationFrame(gameLoop);
}

function updateCoinsDisplay() {
    document.getElementById('menuCoins').textContent = coins;
    document.getElementById('shopCoins').textContent = coins;
    document.getElementById('inventoryCoins').textContent = coins;
}

function renderShop() {
    const skinsGrid = document.getElementById('skinsGrid');
    skinsGrid.innerHTML = '';
    
    Object.keys(skins).forEach(skinId => {
        const skin = skins[skinId];
        const owned = playerData.ownedSkins.includes(skinId);
        const equipped = playerData.equippedSkin === skinId;
        
        const item = document.createElement('div');
        item.className = `shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;
        
        item.innerHTML = `
            ${equipped ? '<div class="shop-item-badge">ÉQUIPÉ</div>' : ''}
            <div class="shop-item-preview">
                <canvas width="50" height="50" id="preview-${skinId}"></canvas>
            </div>
            <div class="shop-item-name">${skin.name}</div>
            <div class="shop-item-description">${skin.description}</div>
            <div class="shop-item-price">${owned ? 'Possédé' : `💰 ${skin.price}`}</div>
            ${!owned ? `<button class="shop-item-btn" onclick="buySkin('${skinId}')" ${coins < skin.price ? 'disabled' : ''}>Acheter</button>` : ''}
            ${owned && !equipped ? `<button class="shop-item-btn" onclick="equipSkin('${skinId}')">Équiper</button>` : ''}
        `;
        
        skinsGrid.appendChild(item);
        
        setTimeout(() => {
            const previewCanvas = document.getElementById(`preview-${skinId}`);
            if (previewCanvas) {
                const pCtx = previewCanvas.getContext('2d');
                pCtx.fillStyle = skin.color;
                pCtx.beginPath();
                pCtx.moveTo(25, 5);
                pCtx.lineTo(45, 45);
                pCtx.lineTo(25, 35);
                pCtx.lineTo(5, 45);
                pCtx.closePath();
                pCtx.fill();
                
                pCtx.fillStyle = skin.accentColor;
                pCtx.beginPath();
                pCtx.arc(25, 20, 6, 0, Math.PI * 2);
                pCtx.fill();
            }
        }, 0);
    });
    
    const powerupsGrid = document.getElementById('powerupsGrid');
    powerupsGrid.innerHTML = '';
    
    const powerupShop = [
        { type: 'shield', name: 'Bouclier', icon: '🛡️', price: 100, description: 'Protection 10s' },
        { type: 'rapidFire', name: 'Tir Rapide', icon: '⚡', price: 100, description: 'Cadence x2 - 8s' },
        { type: 'multiShot', name: 'Multi-Tir', icon: '🔱', price: 150, description: 'Tir triple - 8s' },
        { type: 'health', name: 'Vie', icon: '❤️', price: 200, description: '+1 vie' },
        { type: 'bomb', name: 'Bombe', icon: '💥', price: 250, description: 'Détruit tout' }
    ];
    
    powerupShop.forEach(item => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';
        
        shopItem.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-price">💰 ${item.price}</div>
            <button class="shop-item-btn" onclick="buyPowerup('${item.type}', ${item.price})" ${coins < item.price ? 'disabled' : ''}>Acheter</button>
        `;
        
        powerupsGrid.appendChild(shopItem);
    });
    
    const upgradesGrid = document.getElementById('upgradesGrid');
    upgradesGrid.innerHTML = '';
    
    const upgradeShop = [
        { type: 'damageBoost', name: 'Boost Dégâts', icon: '⚔️', basePrice: 300, description: '+10% dégâts', maxLevel: 5 },
        { type: 'speedBoost', name: 'Boost Vitesse', icon: '🚀', basePrice: 250, description: '+15% vitesse', maxLevel: 5 },
        { type: 'healthBoost', name: 'Vie Maximum', icon: '💪', basePrice: 400, description: '+1 vie max', maxLevel: 3 },
        { type: 'coinMultiplier', name: 'Aimant à Coins', icon: '🧲', basePrice: 500, description: '+10% coins', maxLevel: 5 }
    ];
    
    upgradeShop.forEach(item => {
        const currentLevel = playerData.upgrades[item.type] || 0;
        const price = item.basePrice * (currentLevel + 1);
        const maxed = currentLevel >= item.maxLevel;
        
        const shopItem = document.createElement('div');
        shopItem.className = `shop-item ${maxed ? 'owned' : ''}`;
        
        shopItem.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-description">Niveau: ${currentLevel}/${item.maxLevel}</div>
            <div class="shop-item-price">${maxed ? 'MAX' : `💰 ${price}`}</div>
            ${!maxed ? `<button class="shop-item-btn" onclick="buyUpgrade('${item.type}', ${price})" ${coins < price ? 'disabled' : ''}>Améliorer</button>` : ''}
        `;
        
        upgradesGrid.appendChild(shopItem);
    });
    
    // Render music shop
    const musicGrid = document.createElement('div');
    musicGrid.className = 'shop-grid';
    musicGrid.id = 'musicGrid';
    
    Object.keys(musicThemes).forEach(musicId => {
        const music = musicThemes[musicId];
        const owned = playerData.ownedMusic.includes(musicId);
        const equipped = playerData.equippedMusic === musicId;
        
        const item = document.createElement('div');
        item.className = `shop-item ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''}`;
        
        item.innerHTML = `
            ${equipped ? '<div class="shop-item-badge">EN COURS</div>' : ''}
            <div class="shop-item-icon">🎵</div>
            <div class="shop-item-name">${music.name}</div>
            <div class="shop-item-description">${music.description}</div>
            <div class="shop-item-price">${owned ? 'Possédé' : `💰 ${music.price}`}</div>
            ${!owned ? `<button class="shop-item-btn" onclick="buyMusic('${musicId}')" ${coins < music.price ? 'disabled' : ''}>Acheter</button>` : ''}
            ${owned && !equipped ? `<button class="shop-item-btn" onclick="equipMusic('${musicId}')">Sélectionner</button>` : ''}
        `;
        
        musicGrid.appendChild(item);
    });
    
    // Check if music tab exists, if not create it
    if (!document.getElementById('musicTab')) {
        const musicTab = document.createElement('div');
        musicTab.className = 'shop-content hidden';
        musicTab.id = 'musicTab';
        musicTab.innerHTML = '<h2>Musiques d\'Ambiance</h2>';
        musicTab.appendChild(musicGrid);
        document.getElementById('upgradesTab').parentNode.appendChild(musicTab);
    } else {
        const existingMusicGrid = document.getElementById('musicGrid');
        if (existingMusicGrid) {
            existingMusicGrid.parentNode.replaceChild(musicGrid, existingMusicGrid);
        }
    }
}

function buyMusic(musicId) {
    const music = musicThemes[musicId];
    if (coins >= music.price && !playerData.ownedMusic.includes(musicId)) {
        coins -= music.price;
        playerData.ownedMusic.push(musicId);
        savePlayerData();
        updateCoinsDisplay();
        renderShop();
        playSound('powerup');
    }
}

function equipMusic(musicId) {
    if (playerData.ownedMusic.includes(musicId)) {
        playerData.equippedMusic = musicId;
        savePlayerData();
        renderShop();
        playSound('powerup');
        
        if (isMusicPlaying) {
            stopMusic();
            startMusic();
        }
    }
}

window.buyMusic = buyMusic;
window.equipMusic = equipMusic;

function buySkin(skinId) {
    const skin = skins[skinId];
    if (coins >= skin.price && !playerData.ownedSkins.includes(skinId)) {
        coins -= skin.price;
        playerData.ownedSkins.push(skinId);
        savePlayerData();
        updateCoinsDisplay();
        renderShop();
        playSound('powerup');
    }
}

function equipSkin(skinId) {
    if (playerData.ownedSkins.includes(skinId)) {
        playerData.equippedSkin = skinId;
        player.updateColors();
        savePlayerData();
        renderShop();
        renderInventory();
        playSound('powerup');
    }
}

function buyPowerup(type, price) {
    if (coins >= price) {
        coins -= price;
        playerData.inventoryPowerups[type]++;
        savePlayerData();
        updateCoinsDisplay();
        renderShop();
        playSound('powerup');
    }
}

function buyUpgrade(type, price) {
    if (coins >= price) {
        coins -= price;
        playerData.upgrades[type]++;
        savePlayerData();
        updateCoinsDisplay();
        renderShop();
        playSound('levelUp');
    }
}

window.buySkin = buySkin;
window.equipSkin = equipSkin;
window.buyPowerup = buyPowerup;
window.buyUpgrade = buyUpgrade;

function renderInventory() {
    const ownedSkinsGrid = document.getElementById('ownedSkinsGrid');
    ownedSkinsGrid.innerHTML = '';
    
    playerData.ownedSkins.forEach(skinId => {
        const skin = skins[skinId];
        const equipped = playerData.equippedSkin === skinId;
        
        const item = document.createElement('div');
        item.className = `shop-item owned ${equipped ? 'equipped' : ''}`;
        
        item.innerHTML = `
            ${equipped ? '<div class="shop-item-badge">ÉQUIPÉ</div>' : ''}
            <div class="shop-item-preview">
                <canvas width="50" height="50" id="inv-preview-${skinId}"></canvas>
            </div>
            <div class="shop-item-name">${skin.name}</div>
            <div class="shop-item-description">${skin.description}</div>
            ${!equipped ? `<button class="shop-item-btn" onclick="equipSkin('${skinId}')">Équiper</button>` : ''}
        `;
        
        ownedSkinsGrid.appendChild(item);
        
        setTimeout(() => {
            const previewCanvas = document.getElementById(`inv-preview-${skinId}`);
            if (previewCanvas) {
                const pCtx = previewCanvas.getContext('2d');
                pCtx.fillStyle = skin.color;
                pCtx.beginPath();
                pCtx.moveTo(25, 5);
                pCtx.lineTo(45, 45);
                pCtx.lineTo(25, 35);
                pCtx.lineTo(5, 45);
                pCtx.closePath();
                pCtx.fill();
                
                pCtx.fillStyle = skin.accentColor;
                pCtx.beginPath();
                pCtx.arc(25, 20, 6, 0, Math.PI * 2);
                pCtx.fill();
            }
        }, 0);
    });
    
    const inventoryPowerups = document.getElementById('inventoryPowerups');
    inventoryPowerups.innerHTML = '';
    
    const powerupIcons = {
        shield: '🛡️',
        rapidFire: '⚡',
        multiShot: '🔱',
        health: '❤️',
        bomb: '💥'
    };
    
    Object.keys(playerData.inventoryPowerups).forEach(type => {
        const count = playerData.inventoryPowerups[type];
        if (count > 0) {
            const item = document.createElement('div');
            item.className = 'inventory-powerup-item';
            item.innerHTML = `
                <div class="icon">${powerupIcons[type]}</div>
                <div class="count">x${count}</div>
            `;
            inventoryPowerups.appendChild(item);
        }
    });
    
    if (Object.values(playerData.inventoryPowerups).every(v => v === 0)) {
        inventoryPowerups.innerHTML = '<p style="color: #c4c4e4;">Aucun power-up disponible</p>';
    }
    
    document.getElementById('gamesPlayed').textContent = playerData.stats.gamesPlayed;
    document.getElementById('highScore').textContent = playerData.stats.highScore;
    document.getElementById('maxLevel').textContent = playerData.stats.maxLevel;
    document.getElementById('totalKills').textContent = playerData.stats.totalKills;
    document.getElementById('bossesKilled').textContent = playerData.stats.bossesKilled;
    document.getElementById('totalCoinsEarned').textContent = playerData.stats.totalCoinsEarned;
}

function showScreen(screenId) {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('shopScreen').classList.add('hidden');
    document.getElementById('inventoryScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    document.getElementById(screenId).classList.remove('hidden');
    updateCoinsDisplay();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadPlayerData();
    player.updateColors();
    updateCoinsDisplay();
    updateUI();
    updateMusicButton();
    renderShop();
    
    document.getElementById('shopScreen').classList.add('hidden');
    document.getElementById('inventoryScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('bossScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    
    // Add music toggle event listener
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    
    // Event Listeners
    document.getElementById('startBtn').addEventListener('click', () => {
        showScreen('gameCanvas');
        document.getElementById('startScreen').classList.add('hidden');
        resetGame();
        gameRunning = true;
        audioCtx.resume();
        if (playerData.musicEnabled) {
            startMusic();
        }
        requestAnimationFrame(gameLoop);
    });

    document.getElementById('shopBtn').addEventListener('click', () => {
        showScreen('shopScreen');
        renderShop();
    });

    document.getElementById('closeShopBtn').addEventListener('click', () => {
        showScreen('startScreen');
    });

    document.getElementById('inventoryBtn').addEventListener('click', () => {
        showScreen('inventoryScreen');
        renderInventory();
    });

    document.getElementById('closeInventoryBtn').addEventListener('click', () => {
        showScreen('startScreen');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.shop-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            document.getElementById(tab + 'Tab').classList.remove('hidden');
        });
    });

    // Sensitivity slider
    const sensitivitySlider = document.getElementById('sensitivitySlider');
    if (sensitivitySlider) {
        sensitivitySlider.value = playerData.settings?.sensitivity || 1.0;
        sensitivitySlider.addEventListener('input', (e) => {
            updateSensitivity(e.target.value);
        });
    }

    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        
        // Update button text based on fullscreen state
        document.addEventListener('fullscreenchange', () => {
            fullscreenBtn.textContent = document.fullscreenElement ? 'Quitter Plein Écran' : 'Activer';
        });
    }

    document.getElementById('restartBtn').addEventListener('click', () => {
        document.getElementById('gameOverScreen').classList.add('hidden');
        resetGame();
        gameRunning = true;
        if (playerData.musicEnabled) {
            startMusic();
        }
        requestAnimationFrame(gameLoop);
    });

    document.getElementById('menuBtn').addEventListener('click', () => {
        showScreen('startScreen');
        stopMusic();
    });
});

window.toggleMusic = toggleMusic;

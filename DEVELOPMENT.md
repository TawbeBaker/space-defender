# 🔧 Development Guide - Space Defender

This guide explains the codebase architecture and how to modify the game.

## 📁 Project Structure

```
space-defender/
├── index.html          # Game HTML structure (187 lines)
├── game.js            # Main game logic (1850+ lines)
├── styles.css         # Styling and animations (743 lines)
├── game.js.backup     # Backup copy
├── README.md          # User-facing documentation
├── GITHUB_SETUP.md    # GitHub deployment guide
├── DEVELOPMENT.md     # This file
└── .gitignore         # Git ignore rules
```

## 🏗️ Code Architecture

### game.js Structure

```javascript
// 1. CANVAS & STATE (Lines 1-200)
//    - Canvas setup with fullscreen support
//    - Game state variables
//    - Player data model

// 2. PLAYER CLASS (Lines 300-470)
//    - Player object with movement & drawing
//    - Collision box
//    - Skin system

// 3. PROJECTILE CLASS (Lines 480-510)
//    - Player and enemy projectiles
//    - Progressive speed scaling with level

// 4. ENEMY CLASS (Lines 525-720)
//    - Regular and boss enemies
//    - Health system
//    - Shooting mechanics
//    - Progressive difficulty

// 5. POWERUP CLASS (Lines 730-850)
//    - Shield, Rapid Fire, Multi-shot, Health, Bomb
//    - Animation and collection

// 6. EFFECTS (Lines 860-920)
//    - Explosions with particles
//    - Screen shake effects
//    - Visual feedback

// 7. AUDIO SYSTEM (Lines 170-270)
//    - Web Audio API integration
//    - Procedural music generation
//    - Sound effect creation

// 8. GAME LOOP (Lines 1130-1300)
//    - Main update and render logic
//    - Collision detection
//    - Level progression

// 9. SHOP SYSTEM (Lines 1420-1600)
//    - Rendering shop items
//    - Purchase mechanics
//    - Inventory management

// 10. UI & EVENT HANDLERS (Lines 1650-1850)
//     - DOM updates
//     - Event listeners
//     - Screen navigation
```

## 🎮 Game Loop Flow

```
requestAnimationFrame
    ↓
gameLoop() - Main update cycle
    ├─ Clear canvas
    ├─ Draw background & stars
    ├─ Update player position
    ├─ Update enemies & bullets
    ├─ Check collisions
    ├─ Update effects (explosions, screen shake)
    ├─ Update powerup timers
    ├─ Check level up
    ├─ Draw all entities
    ├─ Update UI
    └─ Loop again
```

## 🔧 Key Functions

### Game Control
- `resetGame()` - Initialize game state
- `togglePause()` - Pause/resume
- `updateUI()` - Update HUD
- `checkCollision()` - AABB collision detection

### Difficulty System
- `checkLevelUp()` - Handle level progression
- `updateDifficulty()` - Adjust spawn rates and speeds

### Shop System
- `renderShop()` - Display shop items
- `buySkin()` / `buyPowerup()` / `buyUpgrade()` - Purchase items
- `equipSkin()` - Change player appearance

### Audio
- `playSound(type)` - Play sound effects
- `startMusic()` / `stopMusic()` - Background music control

### Data Persistence
- `loadPlayerData()` - Load from localStorage
- `savePlayerData()` - Save to localStorage

## 🎨 Customization Guide

### Change Game Colors

**Player Ship**
```javascript
// In skins object (line 100+)
const skins = {
    default: {
        color: '#4ade80',           // Main color
        accentColor: '#22c55e',     // Accent color
        ...
    }
}
```

**Enemy Colors**
```javascript
// In Enemy.draw() method (line 560+)
const enemyGradient = ctx.createLinearGradient(/*...*/);
enemyGradient.addColorStop(0, '#ff6b6b');  // Red
```

**Background**
```javascript
// In drawGame() function (line 1100+)
const bgGradient = ctx.createLinearGradient(/*...*/);
bgGradient.addColorStop(0, '#000011');  // Dark blue
```

### Adjust Game Balance

**Enemy Difficulty**
```javascript
// In Enemy class constructor (line 535)
this.speed = isBoss ? (0.5 + level * 0.2) : 
    (1 + Math.random() * 2 + (level * 0.5)) * levelMultiplier;

// Modify the multiplier (0.5 = 50% per level)
```

**Spawn Rate**
```javascript
// In checkLevelUp() (line 1184)
enemySpawnRate = Math.max(300, 2000 - (level * 200));
// Reduce second number for faster spawning
```

**Player Speed**
```javascript
// In Player class (line 320)
baseSpeed: 7,  // Default movement speed
// Increase for faster movement
```

**Enemy Health**
```javascript
// In Enemy constructor (line 538)
this.health = isBoss ? 50 + (level * 15) : (1 + Math.floor(level / 3));
// Adjust multipliers for easier/harder fights
```

### Add New Power-ups

**Step 1**: Add to powerup shop (line 1470)
```javascript
const powerupShop = [
    // ... existing
    { type: 'shield', name: 'Bouclier', icon: '🛡️', price: 100, description: 'Protection 10s' },
    // Add new:
    { type: 'newPower', name: 'New Power', icon: '✨', price: 150, description: 'Does X' }
];
```

**Step 2**: Create handler
```javascript
function buyPowerup(type, price) {
    if (coins >= price) {
        coins -= price;
        playerData.inventoryPowerups[type]++;
        // Add your logic
    }
}
```

**Step 3**: Implement effect during gameplay

### Add New Skins

```javascript
const skins = {
    // ... existing skins
    myskin: {
        name: 'My Awesome Skin',
        price: 500,
        color: '#ff00ff',        // Purple
        accentColor: '#ff69b4',  // Hot pink
        description: 'Custom skin'
    }
};
```

### Add New Music Themes

```javascript
const musicThemes = {
    // ... existing
    mytheme: {
        name: 'My Theme',
        price: 800,
        description: 'Custom music',
        melody: [262, 294, 330, 349, 392, 440, 494, 523]  // C major scale
    }
};
```

## 🐛 Debugging Tips

### Enable Console Logging
```javascript
// In gameLoop() or specific functions
console.log('Player position:', player.x, player.y);
console.log('Enemies:', enemies.length);
console.log('Current level:', level);
```

### Check Game State
```javascript
// In browser console
console.log(playerData);           // View all player data
console.log({ score, level, lives, coins });  // View key variables
localStorage.getItem('spaceDefenderData')  // View saved data
```

### Performance Profiling
```javascript
// Use Chrome DevTools Performance tab
// Look for:
// - gameLoop frame time
// - Canvas render time
// - Event handler performance
```

## 🚀 Performance Optimization Tips

### Reduce Draw Calls
- Cache gradient objects instead of recreating
- Use off-screen canvas for complex shapes
- Batch similar entities

### Optimize Collision Detection
```javascript
// Current: O(enemies × projectiles)
// Could be: Spatial partitioning with grid

// Consider for 100+ enemies:
const gridSize = 100;
const grid = new Map();
// Group entities by grid cell
```

### Limit Particle Effects
```javascript
// In createExplosion()
const maxParticles = 20;  // Reduce if FPS drops
```

## 📝 Code Style Guidelines

### Variable Naming
```javascript
// ✅ Good
let playerScore = 0;
const maxEnemies = 50;

// ❌ Avoid
let ps = 0;
const max = 50;
```

### Function Comments
```javascript
// ✅ Good
/**
 * Updates player position based on keyboard input
 * @param {Object} keys - Pressed keys object
 */
function updatePlayer(keys) { ... }

// ❌ Avoid
function update() { ... }  // What does this update?
```

### Const vs Let
```javascript
// Use const by default
const gameRunning = true;

// Use let for frequently changed values
let playerX = 100;
```

## 🧪 Testing Recommendations

### Manual Testing Checklist
- [ ] Game starts and runs smoothly
- [ ] Player can move left/right
- [ ] Shooting works correctly
- [ ] Enemies spawn and move
- [ ] Collisions are detected
- [ ] Level progression works
- [ ] Shop transactions work
- [ ] Data persists after refresh
- [ ] Fullscreen mode works
- [ ] Different screen sizes display correctly

### Browser Testing
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (if applicable)

## 🔗 Resources

- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## 🎓 Learning Concepts

This project demonstrates:
- **Game loop architecture** - Update, render, repeat
- **Object-oriented design** - Classes for entities
- **Collision detection** - AABB algorithm
- **State management** - Game states and player data
- **Event handling** - Keyboard and UI events
- **Performance optimization** - 60 FPS gameplay
- **Data persistence** - Browser storage
- **Procedural generation** - Audio and particle effects

---

Happy developing! 🚀 Feel free to experiment and make the game your own!

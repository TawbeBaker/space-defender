# 🚀 Space Defender

A fast-paced 2D space shooter game built with HTML5 Canvas and vanilla JavaScript. Defend Earth against an alien invasion with progressive difficulty, power-ups, and a comprehensive upgrade system!

![Game Screenshots](https://user-images.githubusercontent.com/placeholder/space-defender-banner.png)

## 🎮 Game Features

### Core Gameplay
- **Fullscreen Canvas Experience** - Plays on any screen size with responsive controls
- **Progressive Difficulty** - Game gets faster and harder with each level
- **Boss Battles** - Epic boss encounters every 5 levels
- **Combo System** - Chain kills for multiplied rewards
- **Screen Shake Effects** - Immersive visual feedback for impacts and explosions
- **Particle Explosions** - Dynamic explosion animations with debris

### Power-Ups & Items
- 🛡️ **Shield** - 10 seconds of protection
- ⚡ **Rapid Fire** - 2x shooting speed for 8 seconds
- 🔱 **Multi-Shot** - Triple projectiles for 8 seconds
- ❤️ **Health** - Restore 1 life
- 💥 **Bomb** - Clear the screen of enemies

### Progression System
- **Skins & Cosmetics** - 7 unique spaceship designs to unlock
- **Permanent Upgrades** - Increase damage, speed, health, and coin multiplier
- **Shop System** - Buy power-ups, upgrades, and cosmetics with coins
- **Inventory** - View owned items and game statistics
- **Music Themes** - 4 different ambient soundtracks to unlock

### Difficulty Scaling
The game starts slow and progressively increases challenge:

| Level | Enemy Speed | Spawn Rate | Projectile Speed | Difficulty |
|-------|-------------|------------|-----------------|------------|
| 1-2 | Slow (1-3 px/frame) | 2000ms | Standard | Beginner |
| 3-5 | Moderate (3-5 px/frame) | 1200ms | +15% | Intermediate |
| 6-10 | Fast (5-8 px/frame) | 600ms | +30% | Hard |
| 10+ | Very Fast (8-12 px/frame) | 300ms | +50% | Extreme |

### Settings & Customization
- **Sensitivity Slider** - Adjust player movement speed (50%-200%)
- **Fullscreen Mode** - Play in true fullscreen
- **Music Toggle** - Turn background music on/off
- **Local Persistence** - All progress saved to browser storage

## 🕹️ Controls

| Control | Action |
|---------|--------|
| ⬅️ Arrow Left / **A** | Move Left |
| ➡️ Arrow Right / **D** | Move Right |
| **SPACE** | Shoot |
| **P** | Pause/Resume |
| **🎮 Settings** | Adjust sensitivity & fullscreen |

## 📊 Game Mechanics

### Score & Progression
- Earn points by defeating enemies
- Gain coins from kills (multiplied by combo bonus)
- Progress to next level every 500 points
- Track high scores and statistics

### Enemy Types
1. **Regular Enemies** - Small, fast enemies that spawn in waves
2. **Boss Enemies** - Powerful bosses appear every 5 levels with increased health and firepower
3. **Progressive AI** - Enemies get faster and smarter as you level up

### Statistics Tracked
- Games played
- High score
- Maximum level reached
- Total enemies defeated
- Boss encounters won
- Total coins earned

## 🛠️ Technical Stack

- **HTML5 Canvas** - 2D graphics rendering
- **Vanilla JavaScript** - Pure JS, no frameworks
- **Web Audio API** - Sound effects and dynamic music generation
- **LocalStorage** - Persistent game data
- **Responsive CSS** - Fullscreen responsive design
- **Zero Dependencies** - Completely self-contained

## 🎨 File Structure

```
space-defender/
├── index.html          # Game markup
├── game.js            # Main game logic (1800+ lines)
├── styles.css         # Responsive styling
├── game.js.backup     # Backup of original code
└── README.md          # This file
```

## 🚀 How to Run

### Local Development
```bash
# Navigate to project directory
cd space-defender

# Start local web server (Python 3)
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### Live Play
Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)

## 🎯 Game Strategy

1. **Early Game (Levels 1-3)** - Focus on learning controls, take your time
2. **Mid Game (Levels 4-8)** - Start dodging more frequently, use power-ups wisely
3. **Late Game (Levels 9+)** - Pure reflexes, upgrade your ship, optimize sensitivity
4. **Boss Fights** - Focus on dodging patterns, pick your shots carefully

## 🔧 Customization

### Adjust Game Difficulty
Edit `game.js` constants:
```javascript
let enemySpawnRate = 2000;           // Lower = more enemies
let level = 1;                        // Starting level
let lives = 3;                        // Starting lives
```

### Change Cosmetics
Modify the `skins` object and `musicThemes` in `game.js` to add new designs and music

### Tweak Physics
Adjust player speed, projectile speed, and enemy behavior in respective class constructors

## 📈 Performance

- **60 FPS Gameplay** - Smooth performance on most devices
- **Optimized Rendering** - Efficient canvas drawing
- **Memory Efficient** - Object pooling for projectiles and enemies
- **Mobile Friendly** - Works on tablets and mobile browsers

## 🐛 Known Features

- ✅ Fullscreen responsive canvas
- ✅ Progressive difficulty system
- ✅ Multiple game states (menu, pause, game over)
- ✅ Sound effects and music system
- ✅ Particle effects and screen shake
- ✅ Boss battles with unique AI
- ✅ Upgrade and cosmetic systems
- ✅ Statistics tracking
- ✅ Sensitivity controls
- ✅ localStorage persistence

## 🎓 Learning Resources

This game demonstrates:
- Canvas 2D rendering and transformations
- Game loop architecture with requestAnimationFrame
- Collision detection algorithms
- Object-oriented JavaScript (ES6 classes)
- Event handling and input processing
- Web Audio API for procedural audio
- localStorage for data persistence
- Responsive design patterns

## 📝 Future Enhancements

- [ ] Mobile touch controls
- [ ] Multiplayer leaderboard (backend)
- [ ] Additional enemy types
- [ ] Power-up combinations
- [ ] Story mode campaigns
- [ ] Keyboard rebinding
- [ ] Difficulty presets

## 🎬 Screenshots

### Main Menu
![Menu Screen](https://user-images.githubusercontent.com/placeholder/menu.png)

### Gameplay
![Gameplay Screen](https://user-images.githubusercontent.com/placeholder/gameplay.png)

### Game Over
![Game Over Screen](https://user-images.githubusercontent.com/placeholder/gameover.png)

### Shop
![Shop Screen](https://user-images.githubusercontent.com/placeholder/shop.png)

## 📄 License

This project is open source and available for educational and personal use.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome! Feel free to fork and submit pull requests.

## 👨‍💻 Author

Created as an educational HTML5 game project demonstrating web game development techniques.

---

**Give the game a try and see how high you can score! 🚀**

Made with ❤️ and Canvas

*Note: Game UI is in French. Core gameplay mechanics are universal!*

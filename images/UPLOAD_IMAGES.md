# 📸 How to Upload Screenshots to GitHub

Your game repository is ready! Now let's add the screenshots so they display in the README.

## 🖼️ Files to Upload

You need to upload these 4 image files to the `images/` folder:

1. **menu.png** - Main menu screen
2. **gameplay.png** - Active gameplay
3. **shop.png** - Shop interface
4. **gameover.png** - Game over screen

## 📝 Upload Method 1: Direct GitHub Upload (Easiest)

1. Go to your repository: https://github.com/TawbeBaker/space-defender
2. Click **"Add file"** → **"Upload files"**
3. Create a new folder structure:
   - Drag and drop files into the upload area
   - Before uploading, create folder path: `images/menu.png`, `images/gameplay.png`, etc.
4. Or do this:
   - Go to **Code** tab
   - Click **"Add file"** → **"Create new file"**
   - Type: `images/menu.png`
   - Click **"Upload files"** at the top of the editor
   - Upload your menu screenshot
   - Commit with message: "Add menu screenshot"

5. Repeat for each image

## 📝 Upload Method 2: Via Local Git Commands

If you want to do it locally first:

```powershell
cd "d:\Projects curiculum\Programming\Html5 game"

# Copy your image files to images/ folder
# For example, if your screenshots are on Desktop:
Copy-Item "C:\Users\YourUsername\Desktop\menu.png" -Destination "images\menu.png"
Copy-Item "C:\Users\YourUsername\Desktop\gameplay.png" -Destination "images\gameplay.png"
Copy-Item "C:\Users\YourUsername\Desktop\shop.png" -Destination "images\shop.png"
Copy-Item "C:\Users\YourUsername\Desktop\gameover.png" -Destination "images\gameover.png"

# Add to git
git add images/
git commit -m "Add game screenshots"
git push
```

## ✅ Image Naming Convention

Make sure your files are named **exactly** like this:
- ✅ `images/menu.png`
- ✅ `images/gameplay.png`
- ✅ `images/shop.png`
- ✅ `images/gameover.png`

*Case matters on GitHub - use lowercase!*

## 🔍 Verify Images Display

After uploading:
1. Go to your README.md on GitHub
2. You should see the 4 screenshots displayed at the top
3. If not, check:
   - File names match exactly (lowercase)
   - Images are in `images/` folder
   - File format is `.png` (or `.jpg`)

## 🎯 Image Tips

- **Size**: Recommend 1200x800px or similar
- **Format**: PNG or JPG work fine
- **Quality**: Clear, visible screenshots work best
- **Aspect Ratio**: Maintain game's aspect ratio

## 📦 What Happens After Upload

Once images are uploaded and showing:
- ✅ Your GitHub repo will look professional
- ✅ Screenshots will be visible in README preview
- ✅ People see what your game looks like immediately
- ✅ Better for sharing and attracting interest

## 🎮 Current Image References in README

The README now expects these images at the top:

```markdown
![Menu Screen](./images/menu.png)
![Gameplay Screen](./images/gameplay.png)
![Shop Screen](./images/shop.png)
![Game Over Screen](./images/gameover.png)
```

**If images aren't there yet, you'll see broken image links - that's normal until you upload them!**

## ⚡ Quick Start

**Fastest way:**
1. GitHub.com → Your repo → Add file → Upload files
2. Drag and drop your 4 screenshots
3. Name them: menu.png, gameplay.png, shop.png, gameover.png
4. Put in `images/` folder
5. Commit
6. Done! ✅

---

**Questions?** The images are now referenced in your README and ready to display!

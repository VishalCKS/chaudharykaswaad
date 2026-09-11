# Chaudhary Ka Swaad (चौधरी का स्वाद) 🍪

> **“एक bite चख तो सही”**  
> *Purveyors of Regal Artisanal Confections & Timeless Chai Traditions*

Official web experience and 4K interactive digital showcase for **Chaudhary Ka Swaad**.

---

## 🌟 Features

- **Royal Artisanal Landing Page**: High-performance, luxury typography (`Playfair Display` & `Plus Jakarta Sans`), warm royal palette, and fully responsive layout.
- **Iconic Signature Collection**:
  1. **Fan Khari** (Iconic Flake, Chai Companion)
  2. **Crunchy Rusk** (Double Toasted, Heritage Toast)
  3. **Marodi** (Traditional Spiced Twists)
- **The Cookie Collection**:
  4. **Coconut Square**
  5. **Gold Cookies** (Signature Flagship)
  6. **Almond Slice** (California Almond)
  7. **Natty Cookies** (Peanut Crunch)
  8. **Carom Cookies** (Ajwain Herb)
  9. **Seasonal Private Batches**
- **4K UHD 210-Frame Canvas Animation**:
  - Cinema Player mode with frame-by-frame scrubbing, reverse playback, looping modes, and speed controls.
  - Interactive Scroll Story mode for scroll-linked 3D product unveiling.
- **Deploy Anywhere & Vercel-Ready**:
  - Out-of-the-box support for Vercel, Netlify, Cloudflare Pages, GitHub Pages, or local Node/static servers.
  - Pre-configured `vercel.json` with immutable asset caching and security headers.

---

## 🚀 Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub repository: `https://github.com/chaudharykaswaad/chaudharykaswaad`.
3. Select **Other** (Static Site) as framework preset.
4. Click **Deploy**. Your site will be live instantly with global Edge CDN!

### Option 2: Vercel CLI
```bash
npx vercel
```

---

## 💻 Local Development

### Static File Server
You can open `index.html` directly in any modern browser, or run a local web server:

```bash
# Using Node.js built-in server
node server.js

# Or using npx serve
npx serve .
```

Visit `http://localhost:3000` to view the website.

---

## 📁 Project Structure

```
├── index.html            # Main luxury landing page & interactive modal showcase
├── player.html           # Standalone 4K cinema player & interactive scroll story
├── app.js                # 4K frame animation engine & canvas controller
├── style.css             # Animation player & UI styling
├── server.js             # Optional lightweight local development server
├── vercel.json           # Vercel deployment configuration, headers, and routing
├── package.json          # Project metadata and npm scripts
├── api/
│   └── info.json         # Static frame metadata API
├── ezgif-frame-001.jpg   # 4K UHD animation frames (1 to 210)
│   └── ...
└── ezgif-frame-210.jpg
```

---

## 📜 License
© 2026 Chaudhary Ka Swaad. All rights reserved.

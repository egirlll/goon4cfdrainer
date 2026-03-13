# Mikayla's Auto-Drain Extension

Auto-drain extension for https://throne.com/onemoresend

## Setup

1. **Enable Developer Mode in Chrome**
   - Go to `chrome://extensions/`
   - Toggle "Developer mode" ON (top right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select this `mikayla-autodrain` folder
   - Extension loads with icon in toolbar

3. **Run the Drain**
   - Go to https://throne.com/onemoresend
   - Click the extension icon
   - Select an item when modal appears
   - Extension auto-drains: add to cart → checkout → pay

## Items

- 🍿 popcorn - $7.50
- 🥗 Breakfast - $13.50
- 💪 Gym membership - $25.00
- 💅 Nails - $50.00
- 📱 Phone bill - $75.00
- ❤️ shopping spree - $100.00

## Features

- Select item once, remembers choice
- Auto-clicks add to cart
- Auto-opens checkout
- Auto-submits payment
- Spawns images (currently set to yourluvlumi.vercel.app — update in content.js if needed)
- Loops continuously until tab is closed

## Image Setup

To use custom images, update this line in `content.js`:

```javascript
const imageUrl = "https://yourluvlumi.vercel.app/images/"; // Change this URL
```

Replace with your own image folder URL. Images should be numbered (1.jpg, 2.jpg, etc.).

## Notes

- Make sure card details are saved in Throne beforehand
- Extension runs only on throne.com/onemoresend
- Close tab to stop draining
- Check console (F12) for debug logs

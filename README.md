# goon4cf auto drainer

Auto-drain extension for https://throne.com/goon4cf

## Setup

1. **Enable Developer Mode in Chrome**
   - Go to `chrome://extensions/`
   - Toggle "Developer mode" ON (top right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select this `goon4cfdrainer` folder
   - Extension loads with icon in toolbar

3. **Run the Drain**
   - Go to https://throne.com/goon4cf
   - Click the extension icon
   - Select an item when modal appears
   - Extension auto-drains: add to cart → checkout → pay

## Wishlist Items

- **Coffee** - $9.98
- **Lunch** - $21.95
- **Beer Money** - $54.88
- **Date Night** - $109.75

## Features

- Select item once, remembers choice
- Auto-clicks add to cart
- Auto-opens checkout
- Sets custom name as "autodrainer" at payment
- Auto-submits payment
- Spawns images from goon4cf image service
- Loops continuously until tab is closed

## Image Setup

Images are automatically pulled from:
```
https://goon4cfpics-production.up.railway.app/api/random-image
```

Images spawn every 0.25 seconds during drain (10 images instantly, then 1 every 250ms).

## Notes

- Make sure card details are saved in Throne beforehand
- Extension runs only on throne.com/goon4cf
- Close tab to stop draining
- Check console (F12) for debug logs

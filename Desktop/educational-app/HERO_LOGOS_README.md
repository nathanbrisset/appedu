# Hero Logos Setup

## How to Add Your Own Hero Logos

The app now supports custom hero logos instead of emojis. Here's how to add your own:

### 1. Prepare Your Images

Place your hero logo images in the `public/hero-logos/` folder with these exact filenames:

- `captain-underpants.png` - For Capitaine Superslip
- `hot-wheels.png` - For Hot Wheels
- `sonic.png` - For Sonic
- `ninjago.png` - For Ninjago
- `pokemon.png` - For Pokémon
- `minecraft.png` - For Minecraft

### 2. Image Requirements

- **Format**: PNG, JPG, or SVG (PNG recommended for transparency)
- **Size**: Recommended 64x64 pixels or larger (the app will resize them)
- **Style**: Square images work best, with transparent backgrounds if possible
- **Quality**: Clear, recognizable logos that kids will love

### 3. Fallback System

If an image fails to load or doesn't exist, the app will automatically show the original emoji as a fallback. This ensures the app always works even without custom images.

### 4. Example Structure

```
public/
└── hero-logos/
    ├── captain-underpants.png
    ├── hot-wheels.png
    ├── sonic.png
    ├── ninjago.png
    ├── pokemon.png
    └── minecraft.png
```

### 5. Testing

After adding your images:
1. Restart the development server (`pnpm run dev`)
2. Visit the home page
3. Check that your logos appear in the "J'apprend avec mes héros" section
4. If images don't load, you'll see the emoji fallbacks

### 6. Customizing Hero Names

If you want to change the hero names, you can edit them in:
- `app/page.tsx` (main page hero cards)
- `app/components/themed-language-exercises.tsx` (themes object)

The app will automatically use your custom logos wherever these heroes appear throughout the application! 
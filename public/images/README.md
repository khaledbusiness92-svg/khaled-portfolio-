# Portfolio Images Structure

This folder contains all portfolio images organized by category:

```
images/
├── restaurant-ads/     # صور إعلانات المطاعم
├── clothing-ads/       # صور إعلانات الملابس
├── sketches/          # صور الرسومات والاسكتشات
├── portraits/         # صور البورتريه والكاريكاتير
└── hero/              # صورة الخلفية الرئيسية (hero-bg.jpg)
```

## Image Guidelines

- Recommended image sizes:
  - Portfolio items: 800x800 pixels minimum
  - Hero background: 1920x1080 pixels
- File formats: .jpg, .png, or .webp
- Maximum file size: 2MB per image
- Naming convention: Use descriptive names in English, e.g., "restaurant-ad-1.jpg", "portrait-2.jpg"

## How to Add Images

1. Place your images in the appropriate category folder
2. Update the portfolio section in `index.html` with your image paths
3. Make sure to optimize images for web use to ensure fast loading

Example image path in HTML:

```html
<img
  src="images/restaurant-ads/restaurant-ad-1.jpg"
  alt="Restaurant Advertisement"
/>
```

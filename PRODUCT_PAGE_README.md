# Salt & Stone Style Product Page

## Overview
A premium, fully responsive product page template inspired by Salt & Stone's modern aesthetic. Features a 3-column layout with vertical thumbnails, image swatches, promo bars, and a floating discount badge.

## Files Created

### 1. Section File
- **Path**: `sections/product-salt-stone.liquid`
- **Size**: ~59KB
- **Lines**: 2074

### 2. Template File
- **Path**: `templates/product.salt-stone.json`
- **Usage**: Assign to products via Shopify admin

## Features

### ✅ Layout
- **3-Column Grid**: Thumbnails | Main Image | Product Info
- **Sticky Product Info**: Right column stays visible while scrolling
- **Responsive**: Mobile-first design with breakpoints at 768px and 1024px
- **Vertical Thumbnails**: Left sidebar on desktop, hidden dots on mobile

### ✅ Blocks Available
1. **Title** - Product name with size options
2. **Description** - Truncatable product description
3. **Refill Link** - Underlined link to bundles/refills
4. **Size Info** - Product dimensions text
5. **Rating** - Star rating with review count
6. **Variant Picker** - Image swatches or radio buttons
7. **Promo Bar** - Promotional messages
8. **Buy Buttons** - ATC with waitlist/sold out states
9. **Payment Icons** - Afterpay display
10. **Cross Sell** - "Complete Your Routine" section
11. **Accordion** - Collapsible content sections
12. **Divider** - Horizontal line spacer
13. **Trust Badges** - Shipping/returns badges
14. **Shipping Info** - Delivery estimates

### ✅ Settings
- Gallery layout (vertical/horizontal thumbnails)
- Thumbnail size (60-120px)
- Image aspect ratio
- Badge customization (text, colors)
- Star rating display
- Swatch customization (size, colors)
- Promo bar settings
- Afterpay display
- Floating discount badge

## How to Use

### Method 1: Apply to Specific Products

1. Go to **Shopify Admin** → **Online Store** → **Themes**
2. Click **Customize** on your active theme
3. Navigate to a product page
4. In the top bar, click **Change** next to "Default"
5. Select **Product (salt-stone)** template

### Method 2: Set as Default Template

1. Go to **Shopify Admin** → **Products** → **All products**
2. Click a product to edit
3. In the right sidebar, find **Theme templates**
4. Select **product.salt-stone** from the dropdown
5. Save

### Method 3: Use Presets in Theme Editor

1. Go to **Theme Customizer**
2. Navigate to any product page
3. Click **Add section** or **Change section**
4. Select **Product Page - Salt & Stone** from presets
5. Choose a preset:
   - **Salt & Stone Style** (Full featured)
   - **Minimal** (Clean, simple)
   - **With Reviews** (Rating focused)

## Customization Guide

### Change Colors
```
Badge Background: #FFFFFF
Badge Text: #000000
Promo Bar Background: #F5F5F5
Floating Badge Background: #000000
Floating Badge Text: #FFFFFF
```

### Change Text
```
Badge Text: "BEST SELLER"
Promo Text: "Get a free Mini Santal Deodorant on orders $70+"
Button Text: "JOIN WAITLIST"
Floating Badge: "GET 10% OFF"
```

### Add Cross-Sell Products
1. In theme editor, click on "Complete Your Routine" block
2. Select up to 4 products from your catalog
3. Images automatically pull from product featured images

### Configure Accordion Sections
1. Add "Accordion" blocks
2. Set headings: "Ingredients", "How to Use", "Shipping & Returns"
3. Add content as rich text

## Technical Specifications

### Dependencies
- **Alpine.js** - For reactivity and interactions
- **Theme CSS** - Inherits from theme styles

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Lazy loading for images
- Eager loading for first image
- Optimized scroll performance with `passive` listeners
- Uses CSS containment where possible

### Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states for all interactive elements
- Skip to content link
- `prefers-reduced-motion` support

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 767px | Single column, thumbnails as dots |
| 768px - 1023px | 3 columns, smaller gaps |
| ≥ 1024px | 3 columns, full width, larger gaps |

## Schema Reference

### Section Settings
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| gallery_layout | select | vertical_thumbs | Thumbnail position |
| thumbnail_size | range | 75 | Width in pixels |
| main_image_ratio | range | 100 | Aspect ratio % |
| show_badge | checkbox | true | Show badge overlay |
| badge_text | text | BEST SELLER | Badge content |
| show_rating | checkbox | true | Show star rating |
| star_rating | range | 4.9 | Rating value |
| review_count | text | 5,540 reviews | Review text |
| swatch_size | range | 70 | Variant image size |
| show_floating_badge | checkbox | true | Promo badge |
| floating_badge_text | text | GET 10% OFF | Badge text |

### Block Settings
See inline schema in `product-salt-stone.liquid` for full block configuration options.

## Troubleshooting

### Images not showing?
- Verify product has images uploaded
- Check image URLs return 200 status

### Swatches not clickable?
- Ensure product has variants configured
- Check variant images are uploaded

### Floating badge not appearing?
- Verify `show_floating_badge` is enabled
- Check if close button was previously clicked (saved in localStorage)

### Add to cart not working?
- Check cart.ajax.js is loaded
- Verify form ID matches in JavaScript
- Open browser console for error messages

## Credits
- Design inspired by Salt & Stone
- Built with Alpine.js
- Shopify Online Store 2.0 compatible

## Support
For updates or issues, refer to the theme documentation or contact your developer.

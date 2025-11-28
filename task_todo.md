# Task Plan: Logo and Link Styling Updates

## Objective
1. Add the main logo image at the bottom left corner of all screens
2. Make the "Links Disclaimer" and "Not Medical Advice" links black text when in light mode and light text when in dark mode

## Steps
- [ ] Examine the current theme system to understand how theme switching works
- [ ] Add the logo image at the bottom left corner with proper positioning
- [ ] Update the disclaimer links to use theme-aware colors
- [ ] Test the changes to ensure they work correctly in both light and dark modes

## Files to Modify
- `index.html` - Add logo element and update disclaimer links styling

## Logo Placement
- Position: Fixed bottom left corner
- Z-index: Ensure it appears above other elements
- Responsive: Should work on all screen sizes

## Link Styling
- Light mode: Black text (#000000)
- Dark mode: Light/white text (rgba(255,255,255,0.6) or similar)
- Apply to both "Links Disclaimer" and "Not Medical Advice" links

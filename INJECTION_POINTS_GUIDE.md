# Injection Points Guide

## Overview
This guide explains how to use and customize the optimal injection point visualization system for the 3D peptide injection model.

## How It Works

When you click on a body region (which shows a **red sphere**), the system will automatically display **green spheres** at optimal injection points for that specific region:

- **Medium Green** (#2d7a3e): General injection sites
- **Dark Green** (#1a4d2e): Injury-specific targeted sites

The sphere sizes vary based on the injection area:
- **Small (0.25)**: Precise points like knee soft tissue
- **Medium (0.4)**: Moderate areas like muscle sections
- **Large (0.6)**: Broader areas like large muscle groups

## Currently Configured Regions

The following body parts have injection points defined:

### Lower Body
- **Right Knee** (3 points)
- **Left Knee** (3 points)
- **Right Quad - Distal** (3 points)
- **Right Quad - Proximal** (3 points)
- **Left Quad - Distal** (3 points)
- **Left Quad - Proximal** (3 points)
- **Right Calf - Gastrocnemius** (3 points)
- **Left Calf - Gastrocnemius** (3 points)

### Core
- **Upper Abs** (2 points)
- **Lower Abs** (2 points)
- **Lower Back** (4 points)

### Upper Body
- **Right Anterior Deltoid** (2 points)
- **Left Anterior Deltoid** (2 points)

## How to Test and Add New Injection Points

### Step 1: Enable Debug Mode

Open the browser console (F12 or Cmd+Option+I) and type:

```javascript
toggleInjectionDebugMode()
```

This will enable debug mode, which logs click positions whenever you click on the model.

### Step 2: Find Coordinates

With debug mode enabled, click on the 3D model where you want to place an injection point. The console will show:

```
📍 Clicked position for "Right Knee":
  x: -1.90
  y: -2.80
  z: 0.75
  vectorCode: new THREE.Vector3(-1.90, -2.80, 0.75)
```

### Step 3: Add the Injection Point

Open `/js/injection-points.js` and add a new region or update an existing one:

```javascript
'Region Name': [
    {
        position: new THREE.Vector3(-1.90, -2.80, 0.75),  // Use coordinates from debug
        size: INJECTION_SIZES.SMALL,  // or MEDIUM, LARGE
        type: 'injury_specific',  // or 'general'
        targetInjuries: ['MCL sprain', 'Meniscus tear'],
        notes: 'Description of this injection point'
    }
]
```

### Step 4: Refresh and Test

Refresh the page and click on the region to see your new injection points!

## Size Guidelines

Choose the appropriate size based on the injection area:

```javascript
INJECTION_SIZES.SMALL  // 0.25 - For precise points
INJECTION_SIZES.MEDIUM // 0.4  - For moderate areas
INJECTION_SIZES.LARGE  // 0.6  - For broader areas
```

## Color/Type Guidelines

- **'general'**: Medium green - for general therapeutic injection sites
- **'injury_specific'**: Dark green - for targeting specific injuries or pathologies

## Example: Adding a New Body Part

Let's add injection points for the right shoulder:

1. Enable debug mode: `toggleInjectionDebugMode()`
2. Click on the shoulder to get coordinates
3. Add to `injection-points.js`:

```javascript
'Right Shoulder': [
    {
        position: new THREE.Vector3(-2.5, 6.2, 0.3),
        size: INJECTION_SIZES.MEDIUM,
        type: 'general',
        targetInjuries: ['Rotator cuff strain', 'Shoulder impingement'],
        notes: 'Anterior deltoid - general shoulder injection'
    },
    {
        position: new THREE.Vector3(-2.6, 6.0, -0.5),
        size: INJECTION_SIZES.SMALL,
        type: 'injury_specific',
        targetInjuries: ['Rotator cuff tear', 'Supraspinatus tendinitis'],
        notes: 'Posterior rotator cuff - precise placement needed'
    }
]
```

## Tips for Accurate Positioning

1. **Test multiple clicks**: Click around the area several times to find the best center point
2. **Check from different angles**: Rotate the 3D model to verify sphere placement
3. **Start with fewer points**: Begin with 2-3 points per region and add more as needed
4. **Consider anatomy**: Place points where the actual muscle/tendon/soft tissue is located
5. **Use the existing examples**: Reference similar body parts that are already configured

## Console Commands

Available console commands:

```javascript
// Toggle debug mode on/off
toggleInjectionDebugMode()

// View all configured regions
console.log(Object.keys(injectionPoints))

// View specific region's points
console.log(injectionPoints['Right Knee'])

// Count total configured regions
console.log(`${Object.keys(injectionPoints).length} regions configured`)
```

## Region Naming Convention

Region names must match exactly with the names defined in `/js/regions.js`. Common patterns:

- `'Right Knee'` / `'Left Knee'`
- `'Right Quad - Distal'` / `'Right Quad - Proximal'`
- `'Upper Abs'` / `'Lower Abs'`
- `'Right Anterior Deltoid'`

Check `regions.js` for the exact naming of all available regions.

## Next Steps

To complete the injection point mapping:

1. Go through each body region in `regions.js`
2. Enable debug mode and click to find coordinates
3. Add 2-4 optimal injection points per region
4. Consider the specific injuries and target tissues
5. Use appropriate sizes and types for each point

## Support

If you encounter issues:
- Check the browser console for error messages
- Verify region names match between `regions.js` and `injection-points.js`
- Ensure coordinates are within reasonable bounds (typically -10 to 10)
- Make sure the script is loaded (check Network tab in dev tools)

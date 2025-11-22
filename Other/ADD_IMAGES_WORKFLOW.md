# 🖼️ Quick Start: Adding Images Manually

## Simple 3-Step Process

### **Step 1: Add PNG Files**

Place your images in the correct folder:
```
images/injection_points/{region_folder}/{filename}.png
```

**Example:**
```
images/injection_points/right_knee_medial/right_knee_medial__mcl_sprain__01.png
```

**Naming Rules:**
- Lowercase only
- Spaces → underscores
- Format: `{region}__{injury}__{number}.png`

---

### **Step 2: Update the Catalog**

Edit `js/injection-images.js` and add your images:

```javascript
const injectionPointImages = {
    'Right Knee - Medial': {
        'MCL sprain': ['right_knee_medial__mcl_sprain__01.png'],
        'Medial meniscus tear': ['right_knee_medial__medial_meniscus_tear__01.png']
    },
    
    'Left Shoulder': {
        'Rotator cuff tear': ['left_shoulder__rotator_cuff_tear__01.png']
    }
};
```

**Important:**
- Region name must match exactly (case-sensitive)
- Injury name must match exactly (case-sensitive)
- Check `js/injection-points.js` for exact names

---

### **Step 3: Test**

1. Open your app in browser
2. Click a body region
3. Hover over green injection sphere
4. Images should appear in tooltip!

---

## Example Workflow

### Adding Images for Right Knee MCL Injury:

#### 1. Create folder (if needed):
```bash
mkdir -p images/injection_points/right_knee_medial
```

#### 2. Add your PNG file:
```
images/injection_points/right_knee_medial/right_knee_medial__mcl_sprain__01.png
```

#### 3. Edit `js/injection-images.js`:
```javascript
const injectionPointImages = {
    'Right Knee - Medial': {
        'MCL sprain': ['right_knee_medial__mcl_sprain__01.png']
    }
};
```

#### 4. Refresh browser and test!

---

## Multiple Images for Same Injury

Add multiple images with different numbers:

**Files:**
```
right_knee_medial__mcl_sprain__01.png
right_knee_medial__mcl_sprain__02.png
right_knee_medial__mcl_sprain__03.png
```

**Catalog:**
```javascript
'Right Knee - Medial': {
    'MCL sprain': [
        'right_knee_medial__mcl_sprain__01.png',
        'right_knee_medial__mcl_sprain__02.png',
        'right_knee_medial__mcl_sprain__03.png'
    ]
}
```

Up to 3 images will show in the tooltip.

---

## Finding the Right Names

### Get Region Names:
Open `js/injection-points.js` and look for:
```javascript
const injectionPoints = {
    'Right Knee - Medial': [ ... ],  // ← Use this exact name
    'Left Shoulder': [ ... ],         // ← Use this exact name
    ...
}
```

### Get Injury Names:
Look inside each region for `targetInjuries`:
```javascript
'Right Knee - Medial': [
    {
        targetInjuries: ['MCL sprain', 'Medial meniscus tear'],  // ← Use these exact names
        ...
    }
]
```

---

## Full Naming Reference

See `MANUAL_IMAGE_GUIDE.md` for complete list of:
- All 68 regions
- All folder names
- All injury names
- All expected file names

---

## Tips

✅ **Start small** - Add 1-2 images and test  
✅ **Exact names** - Copy from `injection-points.js`  
✅ **Check console** - Browser console shows if images loaded  
✅ **PNG format** - Works best for web  
✅ **Reuse images** - Same image can work for multiple injuries  

---

## Troubleshooting

### Images don't show?

1. **Check file path:**
   ```
   images/injection_points/{region}/{filename}.png
   ```

2. **Check catalog entry:**
   - Region name matches `injection-points.js`
   - Injury name matches `injection-points.js`
   - Filename matches actual file

3. **Check browser console:**
   - Press F12
   - Look for errors
   - Verify image paths

4. **Hard refresh:**
   - Cmd+Shift+R (Mac)
   - Ctrl+Shift+R (Windows)

---

## Need the Complete List?

📖 See `MANUAL_IMAGE_GUIDE.md` for:
- All 68 body regions
- All ~350 expected filenames
- Complete folder structure
- Full injury list

---

**That's it!** Just add PNG files, update the catalog, and refresh. 🎉

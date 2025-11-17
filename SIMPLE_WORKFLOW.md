# 🎯 Simple Workflow - Add Images (Updated)

## New Folder Structure

Your folders are now organized like this:

```
images/injection_points/
└── {region}/
    └── {injury}/
        ├── 01.png
        ├── 02.png
        └── 03.png
```

---

## Adding Images (3 Steps)

### Step 1: Drop PNG in Injury Folder

Navigate to the injury folder:
```
images/injection_points/right_knee_medial/mcl_sprain/
```

Add your image:
```
01.png
```

### Step 2: Update Catalog

Edit `js/injection-images.js`:

```javascript
const injectionPointImages = {
    'Right Knee - Medial': {
        'MCL sprain': ['right_knee_medial/mcl_sprain/01.png']
    }
};
```

### Step 3: Test in Browser

1. Open your app
2. Click right knee
3. Hover over green sphere
4. See your image!

---

## Simplified File Naming

**Just use numbers:**
- `01.png`
- `02.png`
- `03.png`

No more long filenames! The folder path tells you everything.

---

## Example: Adding 3 Images for MCL Sprain

### 1. Files
```
images/injection_points/right_knee_medial/mcl_sprain/
├── 01.png
├── 02.png
└── 03.png
```

### 2. Catalog Entry
```javascript
'Right Knee - Medial': {
    'MCL sprain': [
        'right_knee_medial/mcl_sprain/01.png',
        'right_knee_medial/mcl_sprain/02.png',
        'right_knee_medial/mcl_sprain/03.png'
    ]
}
```

Done! Up to 3 images will show in tooltip.

---

## Full Path Reference

**Format:**
```
{region_folder}/{injury_folder}/{number}.png
```

**Examples:**
```
right_knee_medial/mcl_sprain/01.png
left_deltoid_anterior/biceps_tendinitis/01.png
lower_back/lumbar_strain/01.png
right_heel/plantar_fasciitis/01.png
```

---

## Finding Your Folders

### All 244 injury folders are ready!

**Browse the structure:**
```bash
cd images/injection_points
ls right_knee_medial/    # See available injuries
```

**Example regions:**
- `right_knee_medial/` - 3 injury folders
- `right_heel/` - 6 injury folders
- `lower_back/` - 3 injury folders
- `left_deltoid_anterior/` - 2 injury folders

---

## Complete List

See `UPDATED_FOLDER_STRUCTURE.md` for:
- All 79 region folders
- All 244 injury subfolders
- Complete hierarchy

---

## Tips

✅ **Just use numbers** - 01.png, 02.png, 03.png  
✅ **Start small** - Add 5-10 images to test  
✅ **Match exactly** - Region/injury names from injection-points.js  
✅ **Full path** - Include region and injury folders in catalog  

---

## Quick Test

1. **Add test image:**
   ```
   images/injection_points/right_knee_medial/mcl_sprain/01.png
   ```

2. **Update catalog:**
   ```javascript
   const injectionPointImages = {
       'Right Knee - Medial': {
           'MCL sprain': ['right_knee_medial/mcl_sprain/01.png']
       }
   };
   ```

3. **Open app** → Click right knee → Hover green sphere → See image!

---

**Much simpler now with organized folders!** 🎉

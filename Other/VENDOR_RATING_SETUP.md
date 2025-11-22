# 🌟 Peptide Vendor Rating System - Setup Guide

## ✅ What Has Been Created

I've built a complete **5-star rating and review system** for peptide vendors on your website. Here's what's included:

### 📊 Database Tables
- **peptide_vendors** - Stores vendor information (name, URL, description)
- **vendor_ratings** - Stores user ratings (1-5 stars) with session tracking
- **vendor_comments** - Stores user comments with rate limiting

### 🔌 API Endpoints
- **php/api/companies.php** - CRUD operations for vendors
- **php/api/ratings.php** - Submit and retrieve ratings
- **php/api/comments.php** - Submit and retrieve comments

### 🎨 Features Implemented
- ⭐ **5-star rating system** (interactive star buttons)
- 📊 **Rating breakdown visualization** (bar charts showing distribution)
- 💬 **Comments section** for each vendor
- 🔍 **Search/filter** by vendor name or URL
- 📈 **Automatic sorting** by average rating
- ➕ **Add new vendors** (users can contribute)
- ✏️ **Edit vendor info** (inline editing)
- 🔒 **Rate limiting** (1 rating per vendor per 24 hours, 5 comments per day)
- 🍪 **Session tracking** (prevents duplicate ratings)

### 📦 Pre-populated Vendors
The system includes these 11 vendors ready to go:
1. Peptide Sciences
2. Core Peptides
3. Peptide Pros
4. Bachem
5. GenScript
6. Limitless Life Nootropics
7. Aapptec Peptides
8. Pure Rawz
9. Science.bio
10. Phoenix Pharmaceuticals
11. Polaris Peptides

---

## 🚀 What You Need To Do

### Step 1: Create the Database Tables

You need to run the database setup script **ONCE** to create the tables and populate initial vendors.

**Option A: Via Browser (Recommended)**
1. Upload all files to your server
2. Visit: `https://your-domain.com/php/setup-vendors-database.php`
3. You should see success messages
4. **IMPORTANT:** Delete `setup-vendors-database.php` after setup for security

**Option B: Via MySQL Direct Access**
If you have direct MySQL access (phpMyAdmin, command line):
```sql
-- Run the SQL from setup-vendors-database.php manually
```

### Step 2: Verify Files Are Uploaded

Make sure these files are on your server:
```
php/
  ├── api/
  │   ├── companies.php (updated)
  │   ├── ratings.php (new)
  │   └── comments.php (new)
  └── setup-vendors-database.php (run once, then delete)

js/
  └── companies.js (updated)

css/
  └── styles.css (updated)

index.html (updated)
```

### Step 3: Test the System

1. Open your website
2. Click the 🏢 button to open the Peptide Vendors panel
3. You should see the 11 pre-populated vendors
4. Test features:
   - ⭐ Click star buttons to rate a vendor
   - 💬 Click "Add Comment" to view/add comments
   - 🔍 Use the search box to filter vendors
   - ➕ Click "+ Add" to add a new vendor
   - ✏️ Click the edit button to modify vendor info

### Step 4: Security Checklist

- [ ] Delete `setup-vendors-database.php` after running it
- [ ] Verify rate limiting works (try rating same vendor twice quickly)
- [ ] Check that comments are sanitized (try entering HTML)
- [ ] Ensure session cookies are working

---

## 🎨 How Users Interact With It

### Rating a Vendor
1. Open the Peptide Vendors panel (🏢 button)
2. Find a vendor (or use search)
3. Click one of the 5 star buttons (★ to ★★★★★)
4. Rating is saved and breakdown updates instantly
5. Can only rate once per vendor per 24 hours

### Adding Comments
1. Click "💬 Add Comment" button on any vendor
2. Comments section expands
3. Type comment in textarea (max 2000 characters)
4. Click "Post Comment"
5. Comment appears immediately
6. Limited to 5 comments per day per user

### Adding New Vendors
1. Click "+ Add" button in header
2. Enter vendor name
3. Enter vendor URL (must include https://)
4. Vendor appears in list immediately

### Editing Vendors
1. Click ✏️ button next to vendor name
2. Fields become editable
3. Modify name or URL
4. Click 💾 (save) to save changes

---

## 📊 Technical Details

### Rate Limiting
- **Ratings:** 1 per vendor per 24 hours (per session)
- **Comments:** 5 per day total (per session)
- Uses cookie-based sessions for tracking

### Sorting & Ranking
Vendors are automatically sorted by:
1. Average rating (highest first)
2. Total number of ratings (most rated first)
3. Name (alphabetically)

### Data Validation
- Star ratings: Must be 1-5
- URLs: Required for vendors
- Comments: Max 2000 characters, HTML sanitized
- Names: Required, HTML sanitized

### Session Tracking
- Unique session ID stored in cookie
- Cookie lasts 1 year
- Used to prevent rating spam
- IP address also logged (for abuse prevention)

---

## 🔧 Customization Options

### Change Rate Limits
Edit in `php/api/ratings.php` and `php/api/comments.php`:
```php
// Change 24 hours to something else
AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)

// Change 5 comments per day
if ($row['count'] >= 5) {
```

### Change Star Colors
Edit in `css/styles.css`:
```css
.star-rating {
    color: #fbbf24; /* Change this hex color */
}
```

### Add Vendor Description Field
The database already supports descriptions! To show them:
1. Update `companies.js` to render `v.description`
2. Add description textarea in add/edit forms

---

## 🐛 Troubleshooting

### "Failed to load vendors"
- Check database credentials in `php/config.php`
- Verify tables were created (run setup script)
- Check PHP error logs

### Ratings not saving
- Verify `vendor_ratings` table exists
- Check browser console for errors
- Ensure cookies are enabled

### Comments not appearing
- Verify `vendor_comments` table exists
- Check rate limiting (max 5 per day)
- Clear browser cache

### Styling looks broken
- Clear browser cache (Ctrl+Shift+R)
- Verify `styles.css` updated correctly
- Check for CSS conflicts

---

## 📈 Future Enhancements (Optional)

Here are some ideas you could add later:

1. **Admin Panel** - Moderate/delete inappropriate comments
2. **Email Notifications** - Notify vendors of new ratings
3. **Verified Purchase Badge** - Mark ratings from verified buyers
4. **Photo Uploads** - Let users upload product photos
5. **Vendor Response** - Allow vendors to respond to reviews
6. **Export Data** - Download ratings as CSV
7. **Anonymous Mode** - Option to hide user sessions
8. **Detailed Stats** - Show rating trends over time

---

## 📝 Database Schema Reference

### peptide_vendors
```sql
id (INT, AUTO_INCREMENT, PRIMARY KEY)
name (VARCHAR 255, NOT NULL)
url (VARCHAR 500, NOT NULL, UNIQUE)
description (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### vendor_ratings
```sql
id (INT, AUTO_INCREMENT, PRIMARY KEY)
vendor_id (INT, FOREIGN KEY)
rating (INT 1-5, NOT NULL)
user_session (VARCHAR 100)
user_ip (VARCHAR 45)
created_at (TIMESTAMP)
```

### vendor_comments
```sql
id (INT, AUTO_INCREMENT, PRIMARY KEY)
vendor_id (INT, FOREIGN KEY)
comment (TEXT, NOT NULL)
user_session (VARCHAR 100)
user_ip (VARCHAR 45)
created_at (TIMESTAMP)
```

---

## ✅ Quick Start Checklist

- [ ] Upload all files to server
- [ ] Run `setup-vendors-database.php` in browser
- [ ] Verify 11 vendors appear in panel
- [ ] Test rating a vendor
- [ ] Test adding a comment
- [ ] Test adding a new vendor
- [ ] Test search/filter functionality
- [ ] Delete `setup-vendors-database.php`
- [ ] Celebrate! 🎉

---

## 💡 Support

If something isn't working:
1. Check browser console (F12) for JavaScript errors
2. Check PHP error logs on your server
3. Verify database connection in `php/config.php`
4. Ensure all files uploaded correctly
5. Clear browser cache and try again

The system is now ready to use! Your users can start rating and reviewing peptide vendors immediately.

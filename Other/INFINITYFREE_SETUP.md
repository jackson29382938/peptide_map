# 🚀 InfinityFree Deployment Instructions

Complete step-by-step guide to deploy your Body Peptide Map with PHP analytics on InfinityFree.

---

## 📋 Pre-Deployment Checklist

✅ **Files Created:**
- PHP backend (php/ folder)
- Updated analytics.js for PHP
- PHP analytics dashboard (analytics.php)
- All original files (index.html, js/, css/, assets/)

---

## Part 1: Get Your InfinityFree MySQL Credentials

### Step 1: Login to VistaPanel
1. Go to https://app.infinityfree.com/
2. Login to your account
3. Click on "Control Panel" for your website

### Step 2: Create MySQL Database
1. In VistaPanel, find **"MySQL Databases"**
2. Click **"Create Database"**
3. Enter a database name (e.g., `peptide`)
4. Click "Create Database"

### Step 3: Get Your Database Credentials
You'll see something like:
```
MySQL Hostname: sqlXXX.infinityfreeapp.com
Database Name: epizXXXX_peptide
Username: epizXXXX_user
Password: [your password]
```

**📝 WRITE THESE DOWN!** You'll need them in Step 2.

---

## Part 2: Update Database Configuration

### On Your Computer (Before Uploading):

1. Open the file: **`php/config.php`**

2. Replace these lines with YOUR credentials:
```php
define('DB_HOST', 'sqlXXX.infinityfreeapp.com'); // Your hostname
define('DB_NAME', 'epizXXXX_peptide');            // Your database name
define('DB_USER', 'epizXXXX_user');               // Your username
define('DB_PASS', 'your_password_here');          // Your password
```

3. **Save the file**

---

## Part 3: Upload Files via FTP

### Step 1: Get FTP Credentials
In VistaPanel:
1. Find **"FTP Accounts"**
2. Your credentials should be:
   - **Host:** `ftpupload.net` (or shown in panel)
   - **Username:** Your InfinityFree username
   - **Password:** Your account password
   - **Port:** 21

### Step 2: Download an FTP Client
Use one of these (free):
- **FileZilla** (recommended): https://filezilla-project.org/
- **WinSCP** (Windows): https://winscp.net/
- **Cyberduck** (Mac/Windows): https://cyberduck.io/

### Step 3: Connect via FTP
1. Open FileZilla (or your FTP client)
2. Enter your FTP credentials
3. Click "Quickconnect"

### Step 4: Upload Files to htdocs/

Navigate to the **`htdocs/`** folder on the server (right side in FileZilla).

**Upload these folders/files:**

```
📁 htdocs/
├── index.html          ✅ Upload
├── analytics.php       ✅ Upload
├── 📁 php/            ✅ Upload entire folder
│   ├── config.php
│   ├── setup-database.php
│   └── 📁 api/
│       ├── click.php
│       ├── pageview.php
│       ├── search.php
│       ├── summary.php
│       ├── clicks.php
│       └── export-clicks.php
├── 📁 js/             ✅ Upload entire folder
│   ├── analytics.js
│   ├── keyboard-nav.js
│   ├── theme.js
│   ├── regions.js
│   ├── init.js
│   ├── model.js
│   ├── interaction.js
│   ├── search.js
│   ├── calculator.js
│   ├── utils.js
│   └── three-deps.js
├── 📁 css/            ✅ Upload entire folder
│   └── styles.css
└── 📁 assets/         ✅ Upload entire folder
    └── injection types.jpg
```

**❌ DO NOT Upload:**
- node_modules/
- server.js (Node.js file - not needed)
- analytics.db (SQLite - not needed)
- package.json (not needed)
- .git/ folder

### Step 5: Verify Upload
Check that all files are in **htdocs/** on the server.

---

## Part 4: Initialize Database

### Step 1: Run Setup Script
1. Open your browser
2. Go to: **`http://your-site.infinityfreeapp.com/php/setup-database.php`**
3. You should see success messages:
   - ✅ Database connection successful!
   - ✅ Table 'click_events' created successfully!
   - ✅ Table 'page_views' created successfully!
   - ✅ Table 'search_queries' created successfully!

### Step 2: Delete Setup File (IMPORTANT!)
**For security, delete `setup-database.php` after setup:**

1. In FileZilla, navigate to `htdocs/php/`
2. Right-click **`setup-database.php`**
3. Click **"Delete"**

This prevents others from accessing your database setup.

---

## Part 5: Test Your Website

### Test Main Site
1. Visit: **`http://your-site.infinityfreeapp.com/index.html`**
2. The site should load normally
3. **Test keyboard shortcuts:**
   - Press **`/`** - search should open
   - Press **`c`** - calculator should open
   - Press **`Esc`** - should close modals
4. Click around, search for things

### Test Analytics Dashboard
1. Visit: **`http://your-site.infinityfreeapp.com/analytics.php`**
2. You should see:
   - Stats showing 0 (initially)
   - Empty charts and tables
3. Go back to the main site and click around
4. Refresh the analytics dashboard - you should see data!

---

## Part 6: Troubleshooting

### Problem: "Database connection failed"
**Solution:**
1. Check your `php/config.php` credentials
2. Make sure you created the MySQL database in VistaPanel
3. Verify database name includes the prefix (epizXXXX_)

### Problem: "No data in analytics"
**Solution:**
1. Open browser console (F12)
2. Look for network errors
3. Check if analytics.js is loaded
4. Verify PHP API files are uploaded to `php/api/`

### Problem: "404 Not Found" on analytics.php
**Solution:**
1. Make sure analytics.php is in `htdocs/` root
2. Check file permissions (should be 644)
3. Try: `http://your-site.infinityfreeapp.com/analytics.php` (with .php extension)

### Problem: Charts not showing
**Solution:**
1. Check browser console for JavaScript errors
2. Verify Chart.js CDN is loading
3. Clear browser cache and refresh

### Problem: Can't access via FTP
**Solution:**
1. Check FTP credentials in VistaPanel
2. Try passive mode in FileZilla (Settings > Connection > FTP)
3. Check firewall isn't blocking port 21

---

## 📊 Using Analytics

### Viewing Stats
- **Dashboard:** `http://your-site.infinityfreeapp.com/analytics.php`
- **Time ranges:** 24h, 7 days, 30 days, 90 days
- **Auto-refresh:** Every 60 seconds

### What's Tracked
- ✅ Every button/link click
- ✅ Search queries
- ✅ Page views
- ✅ Session information
- ✅ Screen size
- ✅ Click coordinates

### Export Data
Click "Export CSV" button to download all click data for Excel analysis.

---

## ⌨️ Keyboard Shortcuts

Works immediately without any setup:

| Shortcut | Action |
|----------|--------|
| `/` | Open search |
| `Esc` | Close modals |
| `c` | Open calculator |
| `t` | Toggle theme |
| `m` | Toggle menu |
| `↑` `↓` | Navigate search |
| `←` `→` | Switch tabs |
| `Enter` | Select result |
| `?` | Show shortcuts (console) |

---

## 🔒 Security Notes

1. ✅ Deleted `setup-database.php` after setup
2. ✅ Database credentials in `config.php` are protected (can't be accessed directly)
3. ✅ Analytics is anonymous (no personal data)
4. ✅ SQL injection protected (using PDO prepared statements)

---

## 📝 File Structure on Server

```
htdocs/
├── index.html              Main application
├── analytics.php           Analytics dashboard
├── php/
│   ├── config.php         Database config
│   └── api/               API endpoints
│       ├── click.php
│       ├── pageview.php
│       ├── search.php
│       ├── summary.php
│       ├── clicks.php
│       └── export-clicks.php
├── js/                    JavaScript files
├── css/                   Stylesheets
└── assets/                Images
```

---

## ✅ Deployment Complete!

Your site is now live with:
- ✅ Full keyboard navigation
- ✅ Click analytics tracking
- ✅ Analytics dashboard
- ✅ CSV export
- ✅ Real-time data

**Your URLs:**
- Main site: `http://your-site.infinityfreeapp.com/index.html`
- Analytics: `http://your-site.infinityfreeapp.com/analytics.php`

---

## 🆘 Need Help?

Common issues:
1. Double-check database credentials in `config.php`
2. Make sure all PHP files are uploaded
3. Verify MySQL database was created in VistaPanel
4. Check browser console for JavaScript errors
5. Clear browser cache

---

## 🎉 Next Steps

1. Share your site URL
2. Monitor analytics to see what users click
3. Export data weekly for analysis
4. Customize based on popular features

Enjoy your analytics! 📊

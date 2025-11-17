# 🚀 Quick Start Guide

## What's New

### 1. ⌨️ Keyboard Navigation
You can now navigate the entire website using keyboard shortcuts!

**Try these shortcuts:**
- Press **`/`** to open the search bar
- Press **`Esc`** to close modals or clear selections
- Press **`c`** to open the calculator
- Press **`t`** to toggle the theme
- Press **`m`** to toggle the info panel
- Press **`?`** to see all shortcuts in the console

**Search Navigation:**
- Use **`↑`** and **`↓`** arrows to navigate search results
- Press **`Enter`** to select a result

**Tab Navigation:**
- Use **`←`** and **`→`** arrows to switch between tabs

### 2. 📊 Click Analytics
Every interaction is now tracked automatically to help you understand what visitors find most useful!

## Testing the Features

### Test Keyboard Navigation
1. Open the website at http://localhost:3000
2. Press **`/`** - the search bar should open
3. Type something and use **`↑`** **`↓`** to navigate results
4. Press **`Esc`** - search should close
5. Press **`c`** - calculator should open
6. Press **`?`** in the browser console to see all shortcuts

### View Analytics
1. Open http://localhost:3000/analytics in a new tab
2. You'll see:
   - **Total clicks, page views, and searches**
   - **Charts** showing activity by hour and top elements
   - **Tables** with detailed statistics
   - **Insights** about user behavior

### Generate Test Data
To see analytics in action:
1. Click around the main site
2. Use the search feature
3. Open the calculator
4. Switch themes
5. Refresh the analytics dashboard to see the data

## How It Works

### Keyboard Navigation (`js/keyboard-nav.js`)
- Listens for keyboard events globally
- Provides shortcuts for all major features
- Smart navigation through search results
- Context-aware behavior

### Analytics Tracking (`js/analytics.js`)
- Automatically tracks all clicks
- Records search queries
- Monitors page views
- Sends data to backend server
- Works silently without affecting performance

### Backend Server (`server.js`)
- Node.js + Express server
- SQLite database for storage
- REST API for analytics
- Dashboard for viewing data

## Accessing Your Data

### Live Dashboard
Visit: http://localhost:3000/analytics

### Export to CSV
Click "Export CSV" button in the dashboard to download all data

### Raw Database
The SQLite database is stored in `analytics.db` and can be opened with any SQLite browser

## Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| `/` | Open search |
| `Esc` | Close modals/panels |
| `c` | Open calculator |
| `t` | Toggle theme |
| `m` | Toggle menu |
| `↑` `↓` | Navigate search |
| `←` `→` | Switch tabs |
| `Enter` | Select result |
| `Tab` | Next element |
| `?` | Show help |

## Tips

### For Development
- Analytics data is stored locally in `analytics.db`
- Server runs on port 3000 (configurable in `server.js`)
- Client-side tracking can be disabled by removing `analytics.js`

### For Production
- Change `ANALYTICS_ENDPOINT` in `analytics.js` to your production server
- Set up proper CORS configuration
- Consider implementing rate limiting
- Add authentication to the analytics dashboard

## Troubleshooting

**Keyboard shortcuts not working?**
- Check browser console for errors
- Make sure you're not in an input field (most shortcuts are disabled in inputs)
- Try refreshing the page

**Analytics not tracking?**
- Make sure the server is running (`npm start`)
- Check browser console for network errors
- Verify the analytics endpoint URL in `analytics.js`

**Can't see analytics dashboard?**
- Ensure server is running
- Visit http://localhost:3000/analytics
- Check for JavaScript errors in browser console

## Next Steps

1. ✅ Test all keyboard shortcuts
2. ✅ Generate some clicks and searches
3. ✅ View the analytics dashboard
4. ✅ Export data to CSV
5. ✅ Read the full README.md for advanced features

## Questions?

Check the full documentation in `README.md` for:
- Complete API reference
- Database schema details
- Customization options
- Privacy considerations
- Advanced features

Enjoy your new keyboard navigation and analytics features! 🎉

# Body Peptide Map - Interactive 3D Anatomy Guide

An interactive 3D body map for peptide injection sites with keyboard navigation and click analytics.

## Features

### 🎯 Core Features
- **Interactive 3D Model**: Click on body parts to see injection information
- **Search Functionality**: Search for injuries and body parts
- **Peptide Calculator**: Calculate reconstitution dosages
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Toggle**: Light and dark mode support

### ⌨️ Keyboard Navigation (NEW!)
Navigate the entire website using keyboard shortcuts:

- **`/`** - Open/focus search bar
- **`Esc`** - Close modals, panels, or clear selection
- **`c`** - Open peptide calculator
- **`t`** - Toggle theme (light/dark)
- **`m`** - Toggle menu/info panel
- **`↑` `↓`** - Navigate through search results
- **`←` `→`** - Switch between tabs (when panel is open)
- **`Enter`** - Select highlighted search result
- **`Tab`** - Navigate between interactive elements
- **`?`** - Show keyboard shortcuts in console

### 📊 Click Analytics (NEW!)
Track user interactions to understand what's most important to your visitors:

- **Automatic Click Tracking**: All button and interactive element clicks are logged
- **Search Analytics**: Track what users are searching for
- **Time-based Reports**: View analytics for different time periods
- **Visual Dashboard**: Charts and tables showing popular features
- **Export Data**: Download analytics as CSV for further analysis
- **Session Tracking**: Individual user sessions are tracked

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Analytics Server**
   ```bash
   npm start
   ```
   
   The server will start on `http://localhost:3000`

3. **Access the Website**
   - Main site: `http://localhost:3000/index.html`
   - Analytics dashboard: `http://localhost:3000/analytics`

### Development Mode

For auto-reload during development:
```bash
npm run dev
```

## Analytics Dashboard

Access the analytics dashboard at `http://localhost:3000/analytics` to view:

### 📈 Key Metrics
- **Total Clicks**: Number of interactions with elements
- **Page Views**: How many times the page was visited
- **Searches**: Number of search queries performed

### 📊 Visualizations
- **Clicks by Hour**: See when users are most active
- **Top Elements**: Which buttons/features are clicked most
- **Popular Searches**: What users are looking for
- **Engagement Rate**: Average clicks per page view

### 🎯 Insights
The dashboard automatically generates insights such as:
- Most popular features
- Peak activity times
- Common search terms
- User engagement patterns

### 💾 Data Export
Export all analytics data to CSV for:
- Further analysis in Excel/Google Sheets
- Integration with other analytics tools
- Long-term data storage

## Database

Analytics data is stored in SQLite database (`analytics.db`) with three tables:

### click_events
Stores every click interaction:
- Element ID, type, and text
- Click coordinates
- Timestamp
- Session information
- Device information

### page_views
Tracks page visits:
- URL
- Timestamp
- Session ID
- Referrer

### search_queries
Logs search activity:
- Search query
- Number of results
- Timestamp
- Session ID

## API Endpoints

### POST `/api/analytics/click`
Log a click event
```json
{
  "elementId": "search-toggle",
  "elementType": "button",
  "elementText": "Search",
  "pageUrl": "http://localhost:3000/",
  "sessionId": "session_123",
  "userAgent": "...",
  "screenWidth": 1920,
  "screenHeight": 1080,
  "clickX": 150,
  "clickY": 200
}
```

### POST `/api/analytics/pageview`
Log a page view
```json
{
  "pageUrl": "http://localhost:3000/",
  "sessionId": "session_123",
  "userAgent": "...",
  "referrer": "https://google.com"
}
```

### POST `/api/analytics/search`
Log a search query
```json
{
  "query": "knee injury",
  "resultsCount": 5,
  "sessionId": "session_123"
}
```

### GET `/api/analytics/summary?days=7`
Get analytics summary for last N days
Returns:
- Total clicks, page views, searches
- Top clicked elements
- Top search terms
- Clicks by hour distribution

### GET `/api/analytics/clicks?days=7`
Get detailed click statistics

### GET `/api/analytics/export/clicks`
Download all click data as CSV

## File Structure

```
peptide_map/
├── index.html              # Main application
├── analytics-dashboard.html # Analytics dashboard
├── server.js               # Node.js/Express backend
├── package.json            # Dependencies
├── analytics.db            # SQLite database (created automatically)
├── js/
│   ├── keyboard-nav.js     # Keyboard navigation module
│   ├── analytics.js        # Client-side analytics tracking
│   ├── init.js             # 3D scene initialization
│   ├── model.js            # 3D model loading
│   ├── interaction.js      # Click/hover interactions
│   ├── search.js           # Search functionality
│   ├── calculator.js       # Peptide calculator
│   ├── theme.js            # Theme switching
│   ├── regions.js          # Body region data
│   └── utils.js            # Utility functions
├── css/
│   └── styles.css          # Custom styles
└── assets/
    └── injection types.jpg # Reference image
```

## Privacy Considerations

The analytics system tracks:
- ✅ Anonymous interaction data (clicks, searches)
- ✅ Session information (temporary ID)
- ✅ Device information (screen size, browser type)

Does NOT track:
- ❌ Personal information
- ❌ IP addresses (not stored)
- ❌ User identities

Session IDs are temporary and stored only in browser session storage.

## Customization

### Disable Analytics
To disable analytics tracking, remove or comment out the analytics.js script from index.html:
```html
<!-- <script src="js/analytics.js"></script> -->
```

### Change Analytics Server URL
Edit `js/analytics.js` and change the `ANALYTICS_ENDPOINT` constant:
```javascript
const ANALYTICS_ENDPOINT = 'https://your-server.com/api/analytics';
```

### Add Custom Tracking
Use the global `Analytics` object to track custom events:
```javascript
Analytics.logClick(element);
Analytics.logSearch(query, resultsCount);
```

## Troubleshooting

### Analytics Not Working
1. Make sure the server is running: `npm start`
2. Check browser console for errors
3. Verify the analytics endpoint URL is correct
4. Check that port 3000 is not blocked by firewall

### Database Issues
If the database becomes corrupted:
1. Stop the server
2. Delete `analytics.db`
3. Restart the server (new database will be created)

### Keyboard Navigation Not Working
1. Make sure keyboard-nav.js is loaded
2. Check browser console for JavaScript errors
3. Try pressing `?` to see available shortcuts

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or questions:
1. Check the browser console for errors
2. Review this README
3. Check that all dependencies are installed

## Future Enhancements

Potential features to add:
- [ ] User accounts and personalized analytics
- [ ] A/B testing support
- [ ] Heatmap visualization
- [ ] Real-time analytics updates
- [ ] Email reports
- [ ] Integration with Google Analytics
- [ ] Multi-language support for keyboard shortcuts

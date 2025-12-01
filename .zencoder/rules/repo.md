---
description: Repository Information Overview
alwaysApply: true
---

# Body Peptide Map - Repository Information

## Summary
Interactive 3D body map web application for visualizing peptide injection sites with comprehensive features including keyboard navigation, click analytics tracking, peptide dosage calculator, search functionality, and theme toggling. Includes automated image generation and research data analysis tools.

## Structure
**Main Directories**:
- **js/**: Frontend JavaScript modules (analytics, calculator, 3D model, peptides database, search, keyboard navigation)
- **css/**: Styling (styles.css)
- **php/**: Backend PHP API endpoints (contact, analytics, companies, ratings, comments)
- **api/**: Serverless contact form handler (Vercel)
- **image_gen/**: Automated image generation using Selenium WebDriver
- **images/**: Static assets including injection point images and logo
- **assets/**: 3D model file (FinalBaseMesh.obj)
- **pages/**: Static disclaimer pages
- **Other/**: Documentation and setup guides

## Language & Runtime

### Node.js Backend
**Language**: JavaScript (Node.js)  
**Version**: v14 or higher (specified in documentation)  
**Package Manager**: npm  
**Framework**: Express v4.18.2

### PHP Backend
**Language**: PHP  
**Package Manager**: Composer  
**Framework**: Standalone scripts with MySQL/SQLite database

### Python Scripts
**Language**: Python 3  
**Purpose**: Image generation automation and research data forecasting

### Frontend
**Language**: JavaScript (vanilla)  
**Framework**: None (vanilla JS)  
**UI Framework**: Tailwind CSS v3 (CDN)  
**3D Graphics**: Three.js r128 (CDN)

## Dependencies

### Node.js (package.json)
**Main Dependencies**:
- express: ^4.18.2 - Web server framework
- sqlite3: ^5.1.6 - Analytics database
- cors: ^2.8.5 - CORS middleware
- dotenv: ^17.2.3 - Environment configuration
- nodemailer: ^7.0.10 - Email functionality

**Development Dependencies**:
- nodemon: ^3.0.1 - Development auto-reload

### PHP (composer.json)
**Main Dependencies**:
- phpmailer/phpmailer: ^6.9 - Email handling

### Python Scripts
**Main Dependencies** (inferred from imports):
- selenium - Browser automation for image generation
- biopython - Research data analysis (Bio.Entrez)
- pandas - Data manipulation
- numpy - Numerical computing
- matplotlib - Data visualization
- plotly - Interactive visualizations
- scikit-learn - Machine learning models (RandomForest, GradientBoosting)

### Frontend (CDN-based)
**Main Dependencies**:
- Three.js r128 - 3D rendering and OrbitControls, OBJLoader
- Tailwind CSS v3 - Utility-first CSS framework

## Build & Installation

```bash
# Install Node.js dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
# Server runs on port 3000 (configurable via PORT environment variable)

# Install PHP dependencies
cd php
composer install
```

## Main Files & Entry Points

**Backend Entry Points**:
- `server.js` - Node.js/Express analytics server (port 3000)
- `api/contact.js` - Vercel serverless contact form handler
- `php/api/` - PHP backend API endpoints

**Frontend Entry Points**:
- `index.html` - Main application page
- `analytics-dashboard.html` - Analytics viewing dashboard
- `analytics.php` - PHP analytics dashboard

**Core JavaScript Modules**:
- `js/init.js` - Application initialization
- `js/model.js` - Three.js 3D model rendering
- `js/analytics.js` - Click/interaction tracking
- `js/keyboard-nav.js` - Keyboard shortcuts handler
- `js/search.js` - Search functionality
- `js/calculator.js` - Peptide dosage calculator
- `js/peptides-database.js` - Peptide information database
- `js/injection-points.js` - Injection site data

**Configuration**:
- `vercel.json` - Vercel deployment configuration
- `php/config.php` - PHP database configuration
- `.env` (gitignored) - Environment variables

**Python Scripts**:
- `image_gen/test.py` - Automated screenshot generation with Selenium
- `test.py` - Research data forecasting and visualization

## Docker
No Docker configuration found in this project.

## Testing
No formal testing framework configured. Python scripts named `test.py` are utility scripts for image generation and data analysis, not unit tests.

**Manual Testing Approach**:
- Run local development server: `npm run dev`
- Access application at http://localhost:3000
- Access analytics at http://localhost:3000/analytics
- Test keyboard shortcuts (/, Esc, c, t, m, arrows, Enter)
- Verify 3D model interactions
- Test search functionality and peptide calculator

## Database
**SQLite** (Node.js):
- `analytics.db` - Stores click events, page views, and search queries
- Tables: click_events, page_views, search_queries, sessions

**MySQL/SQLite** (PHP):
- Configurable via `php/config.php`
- Tables: click_events, page_views, search_queries, companies, ratings, comments, votes

**Setup Scripts**:
- `php/setup-database.php` - Creates analytics tables
- `php/setup-companies.php` - Creates companies/vendors tables
- `php/setup-vendors-database.php` - Vendor rating system setup

## Deployment
**Platform**: Vercel  
**Configuration**: `vercel.json` with serverless function setup  
**API Timeout**: 10 seconds for contact form function

**Deployment Notes**:
- Static files served via Vercel CDN
- Node.js server for local development only
- Serverless functions for production (api/contact.js)
- PHP backend requires separate hosting

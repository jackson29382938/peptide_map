# Body Peptide Map

An interactive 3D body mapping application for peptide injection sites with integrated analytics and research capabilities.

## Features

- Interactive 3D body map for peptide injection sites
- Comprehensive peptide information database
- Research studies integration with voting system
- Analytics dashboard for user interactions
- Search functionality for peptides and conditions
- Responsive design for desktop and mobile

## Architecture

The application is designed with a modern Node.js backend and client-side JavaScript, using:

- Frontend: HTML, CSS, JavaScript with Three.js for 3D rendering
- Backend: Node.js server with Express framework
- Database: SQLite for analytics, studies, and caching
- Analytics: Custom tracking system for user interactions
- Research: Integration with PubMed and Semantic Scholar APIs

### Architecture Decision: Node.js Focus

While the repository contains both PHP and Node.js backend implementations, we have standardized on the Node.js implementation for the following reasons:

1. Better integration with the existing analytics system
2. Single technology stack reduces complexity
3. Easier maintenance and development
4. Better performance for the specific use cases of this application
5. More straightforward deployment process

The PHP files remain for backward compatibility but should be considered deprecated. All new development should focus on the Node.js server implementation in `server.js`.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration:
```env
# API Keys for Research Studies Search
PUBMED_API_KEY=your_pubmed_api_key_here
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_api_key_here

# Database Configuration
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password

# SMTP Configuration (for contact form)
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=your_email@domain.com
```

3. Start the development server:
```bash
node server.js
```

## Security Notes

- Database credentials should be stored in environment variables
- API keys should be kept private and not exposed in client-side code
- The application implements IP tracking for analytics purposes

## Privacy Policy

This application is committed to protecting user privacy and complying with data protection regulations including GDPR.

### Data Collection

We collect the following types of data:
- Usage analytics (click events, page views, search queries) for improving the application
- IP addresses for analytics and security purposes
- Session identifiers to track user journeys
- Device information (screen resolution, browser type) for optimization
- User-generated content submitted via contact forms or research study interactions

### Legal Basis for Processing

Our legal basis for processing personal data includes:
- Performance of our services (Article 6(1)(b) GDPR)
- Legitimate interests in improving our services (Article 6(1)(f) GDPR)
- Consent for specific processing activities (Article 6(1)(a) GDPR)

### Data Retention

Personal data is retained only as long as necessary for the purposes for which it was processed:
- Analytics data: 2 years
- Contact form submissions: 5 years
- Research study interactions: Until user deletion request

### User Rights

Under GDPR and other applicable privacy laws, you have the right to:
- Access your personal data
- Rectify inaccurate data
- Request erasure of your data
- Restrict processing of your data
- Data portability
- Object to processing
- Withdraw consent

To exercise these rights, please contact us at bodymappeptide@gmail.com.

### Data Security

We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
- Secure transmission protocols (HTTPS)
- Regular security assessments
- Access controls and authentication
- Data encryption at rest for sensitive information

### Third-Party Services

We use the following third-party services which may process your data:
- Vercel (hosting services)
- SQLite databases (data storage)
- PubMed and Semantic Scholar APIs (research data)

### Contact Information

For questions about this privacy policy or to exercise your rights, please contact:
- Email: bodymappeptide@gmail.com
- Address: [Organization address]

### Changes to this Policy

We may update this privacy policy periodically. We will notify users of material changes through the application interface.

## Deployment

The application is designed to work with Vercel deployment platform. It includes necessary configuration files for deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
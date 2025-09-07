# FEAR Store - Setup Instructions

## Quick Start

1. **Download the project files**
2. **Install Node.js** (if not already installed)
3. **Open terminal/command prompt** in the project folder
4. **Run the following commands:**

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

5. **Open your browser** and go to `http://localhost:3000`

## Admin Access
- URL: `http://localhost:3000/admin`
- Username: `admin`
- Password: `admin123`

## Project Structure
```
fear-store/
├── server.js              # Main server file
├── package.json           # Dependencies
├── index.html             # Store homepage
├── admin.html             # Admin dashboard
├── checkout.html          # Checkout page
├── js/
│   ├── cart.js           # Shopping cart
│   ├── checkout.js       # Checkout logic
│   └── admin.js          # Admin functionality
├── assets/               # Images and logos
└── README.md            # Documentation
```

## Features
- ✅ Product catalog with supplements and merchandise
- ✅ Shopping cart with persistent storage
- ✅ User registration and authentication
- ✅ Complete checkout process
- ✅ Admin dashboard for order management
- ✅ Responsive design with dark mode
- ✅ SQLite database for data storage

## Troubleshooting

### If you get "npm not found":
1. Install Node.js from https://nodejs.org
2. Restart your terminal
3. Try the commands again

### If port 3000 is busy:
The server will automatically use the next available port.

### Database Issues:
The SQLite database will be created automatically on first run.

## Need Help?
Check the README.md file for detailed documentation and API endpoints.
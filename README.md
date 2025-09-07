# FEAR Store

A modern e-commerce platform for fitness supplements and merchandise built with Node.js, Express, and SQLite.

## Features

- **Product Catalog**: Browse supplements and merchandise
- **Shopping Cart**: Add/remove items with persistent storage
- **User Authentication**: Register and login functionality
- **Order Management**: Complete checkout process
- **Admin Panel**: Comprehensive dashboard for managing orders, users, and products
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **Authentication**: JWT tokens with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fear-store
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Database Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. The application will connect to `mongodb://localhost:27017/fear_store`

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Set environment variable: `MONGODB_URI=your_connection_string`

## Admin Access

- URL: `http://localhost:3000/admin`
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/contact` - Submit contact form

### Protected Endpoints (Require Authentication)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders

### Admin Endpoints (Require Admin Authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/orders` - Manage orders
- `GET /api/admin/enquiries` - Manage enquiries
- `GET /api/admin/payments` - View payments
- `GET /api/admin/users` - Manage users

## Project Structure

```
fear-store/
├── server.js              # Main server file
├── index.html             # Main store page
├── admin.html             # Admin dashboard
├── checkout.html          # Checkout page
├── js/
│   ├── cart.js           # Shopping cart functionality
│   ├── checkout.js       # Checkout process
│   └── admin.js          # Admin panel functionality
├── assets/               # Images and static assets
└── fear_store.db        # SQLite database
└── MongoDB Collections  # MongoDB database collections
```

## MongoDB Collections

- `adminusers` - Admin user accounts
- `users` - Customer accounts
- `products` - Product catalog
- `orders` - Customer orders
- `orderitems` - Order line items
- `enquiries` - Customer enquiries
- `payments` - Payment records

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.# fear-code

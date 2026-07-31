# Luxe Retail Fullstack

A polished e-commerce demo built with Node.js, Express, and SQLite.

## Features

- User authentication and role-based access
- Product catalog and filtering
- Shopping cart and checkout flow
- Order history and admin reporting
- Responsive retail storefront UI

## Tech Stack

- Backend: Node.js, Express, SQLite
- Frontend: HTML, CSS, JavaScript
- Authentication: JWT, bcrypt

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed

### Setup

```bash
cd E-COmmerce_full_stack
npm install
copy .env.example .env
```

### Environment Variables

Create a `.env` file in the project root with:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
```

### Run the app

```bash
npm start
```

Or use the included Windows startup script:

```cmd
run-site.bat
```

Then open:

```text
http://localhost:5000
```

## Scripts

- `npm start` - run the server
- `npm run dev` - run the server in development mode

## Repository Structure

```text
E-Commerce_full_stack/
├── data/                  # SQLite database files
├── middleware/            # Auth and request middleware
├── public/                # Frontend pages and assets
├── routes/                # Express API routes
├── db.js                  # SQLite database setup and seed logic
├── server.js              # Express server entrypoint
├── package.json           # Node.js dependencies and scripts
├── run-site.bat           # Windows startup script
└── README.md              # Project documentation
```

## Notes

- The app seeds default users, demo products, and sample orders on first startup.
- Do not commit `data/database.sqlite`, `.env`, or `node_modules`.

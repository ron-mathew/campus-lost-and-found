# Campus Lost & Found Management System

A full-stack MERN web application to manage lost and found items on campus.

## Tech Stack
- **Frontend**: React + Vite, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt

## Getting Started

### Server
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Client
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Folder Structure
```
campus-lost-and-found/
├── client/          # React frontend
└── server/          # Express backend
    ├── config/      # DB connection
    ├── controllers/ # Route logic
    ├── middleware/  # Auth, error handling
    ├── models/      # Mongoose schemas
    └── routes/      # API endpoints
```

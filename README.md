# Campus Lost & Found Management System

A full-stack web application that digitally manages lost and found items within a campus environment, providing a centralized platform for reporting, searching, and claiming lost belongings.

## 🎯 Project Overview

This system replaces inefficient manual methods (notice boards, WhatsApp groups) with a structured digital solution that improves item recovery efficiency, transparency, and accessibility.

## ✨ Features

- 🔐 **User Authentication** - Secure registration and login with JWT
- 📝 **Report Lost Items** - Submit detailed reports with images
- 🔍 **Report Found Items** - Help others recover their belongings
- 🔎 **Advanced Search** - Filter by category, location, and date
- 📊 **Item Dashboard** - Manage all posted items
- 🤝 **Claim System** - Secure request and verification process
- 📈 **Status Tracking** - Monitor item status (Open, Claimed, Returned)
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **ReactJS** - Component-based UI framework
- **HTML5 & CSS3** - Semantic markup and responsive styling
- **JavaScript (ES6+)** - Modern JavaScript features
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **JWT** - Secure authentication tokens
- **Bcrypt** - Password hashing

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling (ODM)

### Development Tools
- **Git & GitHub** - Version control
- **VS Code** - Code editor
- **Postman** - API testing
- **Nodemon** - Auto-restart during development

## 📁 Project Structure
campus-lost-and-found/
├── client/                 # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Main application pages
│   │   ├── services/      # API service functions
│   │   ├── context/       # React Context for state
│   │   ├── styles/        # CSS files
│   │   └── App.js         # Main App component
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth & validation
│   ├── config/           # Configuration files
│   ├── index.js          # Server entry point
│   └── package.json
│
├── .gitignore
└── README.md

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/campus-lost-and-found.git
cd campus-lost-and-found
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
# Add the following variables:
```

**`.env` file:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lost-and-found?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your-secret-key-here
```

```bash
# Start the server
npm run dev
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open new terminal
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the React app
npm start
```

Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Items
- `POST /api/items/lost` - Report lost item
- `POST /api/items/found` - Report found item
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get specific item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Claims
- `POST /api/claims` - Submit claim request
- `GET /api/claims/user/:userId` - Get user's claims
- `GET /api/claims/item/:itemId` - Get claims for item
- `PUT /api/claims/:id/status` - Update claim status

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  createdAt: Date
}
```

### Items Collection
```javascript
{
  title: String,
  category: String,
  description: String,
  location: String,
  dateReported: Date,
  imageUrl: String,
  itemType: String (Lost/Found),
  status: String (Open/Claimed/Returned),
  postedBy: ObjectId (ref: User)
}
```

### Claims Collection
```javascript
{
  itemId: ObjectId (ref: Item),
  claimedBy: ObjectId (ref: User),
  message: String,
  verificationDetails: String,
  claimStatus: String (Pending/Approved/Rejected),
  submittedAt: Date
}
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based authentication
- ✅ Protected API routes
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ MongoDB Atlas network security

## 📅 Development Timeline

| Phase | Activities | Duration |
|-------|-----------|----------|
| **Planning** | Requirements analysis & design | Week 1 |
| **Design** | UI/UX & database schema | Week 2 |
| **Implementation** | Backend & frontend development | Week 3-4 |
| **Integration** | Connect all modules | Week 5 |
| **Testing** | Debugging & validation | Week 6 |
| **Deployment** | Cloud hosting | Week 6 |

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build the app
cd client
npm run build

# Deploy to Vercel
vercel

# Or deploy to Netlify
netlify deploy --prod
```

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Add environment variables
4. Deploy

### Database
- MongoDB Atlas (Cloud)
- Configure network access
- Whitelist IP addresses

## 🧪 Testing

### API Testing with Postman
```bash
# Import Postman collection
# Test all endpoints
# Verify authentication flow
```

### Frontend Testing
```bash
cd client
npm test
```

## 🎓 Academic Information

**Course:** Full Stack Development  
**Project Type:** MERN Stack Web Application  
**Complexity:** Medium  
**Learning Outcomes:**
- Full-stack development proficiency
- RESTful API design
- Database modeling
- Authentication implementation
- Deployment skills

## 👥 Target Users

- College students
- Faculty members
- Campus administrative staff
- Anyone within the institution who loses or finds belongings

## 🤝 Contributing

This is an academic project. For suggestions or improvements:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📝 License

This project is created for academic purposes.

## 📧 Contact

**Developer:** [Your Name]  
**Email:** [your.email@example.com]  
**GitHub:** [@your-username](https://github.com/your-username)

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Cloudinary for image storage
- Vercel/Netlify for frontend hosting
- Render/Railway for backend hosting

---

**Note:** Remember to replace placeholder values (YOUR-USERNAME, your-email, etc.) with actual information before deployment.

## 🐛 Known Issues

- Image upload size limited to 5MB
- Real-time notifications not yet implemented

## 🔮 Future Enhancements

- [ ] Email notifications for claims
- [ ] Real-time chat between claimant and poster
- [ ] Advanced matching algorithm
- [ ] Admin approval panel
- [ ] QR code verification
- [ ] Mobile app version

---
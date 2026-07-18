# 🏠 PG Finder

<p align="center">
  <b>Find Your Perfect Paying Guest Accommodation</b><br>
  A Full-Stack PG Rental Platform for Students & Working Professionals
</p>

<p align="center">
A modern web application that helps users discover, explore, and manage PG accommodations with secure authentication, image uploads, reviews, and complete property management.
</p>

---

## 🌐 Live Demo

**Website:** https://wanderlust-v2-4wfo.onrender.com/listings

---

# 📖 About

**PG Finder** is a full-stack web application designed to simplify the process of finding and listing Paying Guest (PG) accommodations.

The platform allows property owners to publish PG listings with detailed information, while students and working professionals can browse available accommodations, view complete property details, upload reviews, and choose the best place based on their preferences.

The project follows the **MVC (Model-View-Controller)** architecture and implements authentication, authorization, CRUD operations, server-side validation, secure session management, cloud image storage, and modern security practices.

---

# ✨ Features

### 👤 Authentication

* User Registration
* Secure Login & Logout
* Password Encryption
* Session-Based Authentication
* Flash Messages

---

### 🏠 PG Listings

* Browse all available PG accommodations
* View complete PG details
* Create new PG listings
* Edit existing listings
* Delete owned listings
* Responsive listing cards
* Property image gallery

---

### ⭐ Reviews & Ratings

* Add reviews
* Delete your own reviews
* View ratings and user feedback

---

### 📷 Cloud Image Upload

* Upload PG images
* Cloudinary Integration
* Optimized image storage
* Multiple property images support

---

### 🔐 Authorization

* Only authenticated users can create listings
* Only listing owners can edit or delete their PG
* Protected routes using middleware

---

### 🛡 Security Features

* CSRF Protection
* MongoDB Injection Protection
* Server-side Validation using Joi
* Secure Session Storage
* Custom Error Handling
* Protected Routes
* Flash Notifications

---

# 🚀 Tech Stack

## Frontend

* HTML5
* CSS3
* Bootstrap 5
* JavaScript
* EJS
* EJS-Mate

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose

## Authentication

* Passport.js
* Passport Local Strategy
* Passport-Local-Mongoose
* Express Session
* Connect-Mongo

## Image Upload

* Cloudinary
* Multer
* Multer Storage Cloudinary

## Validation & Security

* Joi
* CSRF Protection (csurf)
* Express Mongo Sanitize
* Connect Flash
* dotenv
* Method Override

---

# 🏗 Project Architecture

The project follows the **MVC Architecture** for better code organization and maintainability.

```text
PG-Finder
│
├── controllers/
├── models/
├── routes/
├── views/
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── utils/
├── init/
├── middleware.js
├── cloudConfig.js
├── schema.js
├── app.js
├── package.json
└── README.md
```

---

# ⚙ Installation

### Clone the repository

```bash
git clone https://github.com/ChandanGowdaKS/PG-Finder.git
```

### Navigate into the project

```bash
cd PG-Finder
```

### Install dependencies

```bash
npm install
```

### Create a `.env` file

```env
ATLASDB_URL=your_mongodb_connection_string

CLOUD_NAME=your_cloudinary_cloud_name

CLOUD_API_KEY=your_cloudinary_api_key

CLOUD_API_SECRET=your_cloudinary_api_secret

SECRET=your_session_secret
```

### Start the application

```bash
npm start
```

Open your browser and visit

```text
http://localhost:3000/listings
```

---

# 📋 Project Modules

## 👤 User Module

* Register
* Login
* Logout
* Authentication
* Session Management

---

## 🏠 PG Module

* View all PGs
* View PG Details
* Add New PG
* Edit PG
* Delete PG
* Upload Images

---

## ⭐ Review Module

* Add Review
* Delete Review
* Display Ratings

---

# 📚 Concepts Implemented

* MVC Architecture
* RESTful Routing
* CRUD Operations
* Authentication
* Authorization
* Middleware
* Session Management
* Cookies
* MongoDB Relationships
* Image Upload
* Cloud Storage
* Server-side Validation
* Error Handling
* Flash Messages
* Responsive Web Design

---

# 🎯 Learning Outcomes

Through this project, I gained hands-on experience in:

* Full-Stack Web Development
* Express.js
* MongoDB & Mongoose
* Authentication using Passport.js
* Session Management
* REST APIs
* MVC Design Pattern
* Cloudinary Image Upload
* CRUD Operations
* Server-side Validation
* Secure Web Application Development
* Deployment on Render

---

# 📸 Screenshots

Add screenshots of the following pages:

* 🏠 Home Page
* 📋 PG Listings
* 🏢 PG Details
* ➕ Add New PG
* ✏ Edit PG
* 🔐 Login
* 📝 Register
* ⭐ Reviews

---

# 🚀 Future Enhancements

* 🔍 Search PGs by City
* 🎯 Advanced Filters (Rent, Gender, Amenities)
* ❤️ Save Favorite PGs
* 📍 Google Maps Integration
* 💬 Chat Between Owner & Tenant
* 📅 Room Availability Tracking
* 📧 Email Notifications
* 💳 Online Rent Payment
* 📱 Fully Optimized Mobile Experience
* 👨‍💼 Admin Dashboard

---

# 🤝 Contributing

Contributions are always welcome.

If you'd like to improve this project, feel free to fork the repository and submit a pull request.

---

# 👨‍💻 Author

**Chandan Gowda K S**

GitHub: https://github.com/ChandanGowdaKS

---

# ⭐ Show Your Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.

It motivates me to build more full-stack applications and contribute to open-source projects.

---

<p align="center">
Made with ❤️ using Node.js, Express.js, MongoDB, EJS, Bootstrap, Passport.js & Cloudinary
</p>

# 🛍️ E-Commerce Admin Panel

A modern, full-stack e-commerce admin panel built with React.js frontend and Node.js backend with MySQL database.

## ✨ Features

### 🔐 Authentication & Authorization
- User login/logout system
- Role-based access control
- JWT token authentication
- User status management (active/inactive)

### 📊 Dashboard
- Real-time statistics and analytics
- User role breakdown charts
- Product trend visualization
- Recent data overview

### 🏷️ Category Management
- Create, read, update, delete categories
- Search and filter functionality
- Professional UI with modals

### 📁 Subcategory Management
- Hierarchical category structure
- Category-subcategory relationships
- Bulk operations support

### 📦 Product Management
- Complete CRUD operations
- Multiple image support (up to 5 images)
- Price and quantity tracking
- Category and subcategory assignment
- Search and filter capabilities

### 👥 User Management
- User registration and management
- Role assignment system
- User status toggling
- Profile management

### 🔐 Role Management
- Custom role creation
- System and custom role types
- Role assignment to users
- Permission management

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcrypt** - Password hashing

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Git

### Backend Setup
```bash
# Navigate to backend directory
cd Pra

# Install dependencies
npm install

# Create .env file with your database configuration
# Example .env:
# DB_HOST=localhost
# DB_USER=your_username
# DB_PASSWORD=your_password
# DB_NAME=your_database
# JWT_SECRET=your_jwt_secret

# Start the server
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd admin-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 📁 Project Structure

```
shubham bhaiya online/
├── admin-frontend/          # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   └── package.json
├── Pra/                    # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── model/             # Database models
│   ├── middleware/        # Custom middleware
│   ├── routes/            # API routes
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/status` - Toggle user status

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Subcategories
- `GET /api/subcategories` - Get all subcategories
- `POST /api/subcategories` - Create subcategory
- `PUT /api/subcategories/:id` - Update subcategory
- `DELETE /api/subcategories/:id` - Delete subcategory

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Roles
- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

## 🎨 UI Features

- **Responsive Design** - Works on all devices
- **Dark/Light Theme** - Modern UI with gradient backgrounds
- **Modal Dialogs** - Clean form interfaces
- **Search & Filter** - Advanced data filtering
- **Real-time Updates** - Live data synchronization
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Role-based Access** - Permission control
- **Input Validation** - Data sanitization
- **SQL Injection Protection** - Parameterized queries

## 📊 Database Schema

The application uses MySQL with the following main tables:
- `users` - User accounts and profiles
- `categories` - Product categories
- `subcategories` - Subcategories linked to categories
- `products` - Product information and images
- `admin_roles` - User roles and permissions
- `user_roles` - Role assignments to users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shubham Bhaiya** - E-Commerce Admin Panel

## 🙏 Acknowledgments

- React.js community
- Tailwind CSS team
- Lucide React for beautiful icons
- Recharts for data visualization

---

⭐ **Star this repository if you found it helpful!** 
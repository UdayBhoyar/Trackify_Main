# Trackify Pro - Quick Reference Guide

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:4200  
API: http://localhost:5293

Default Login:
- Email: `admin@trackify.com`
- Password: `Pass@123`

---

## 📋 Common Commands

### Development
```bash
# Start both API and frontend
cd frontend && npm run dev

# Frontend only
cd frontend && ng serve

# Backend only
cd api && dotnet run
```

### Build
```bash
# Frontend production build
cd frontend && npm run build

# Backend release build
cd api && dotnet publish -c Release
```

### Testing
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd api && dotnet test
```

---

## 🔍 Troubleshooting

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Port in Use
```bash
# Kill process on port 5293 (API)
netstat -ano | findstr :5293
taskkill /PID <PID> /F

# Kill process on port 4200 (Frontend)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Clean Build
```bash
# Backend
cd api
dotnet clean
dotnet restore
dotnet build

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 API Quick Reference

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
```

### Expenses
```http
GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
```

### Categories
```http
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Reports
```http
GET /api/reports/monthly
GET /api/reports/by-category
GET /api/reports/daily-trend
GET /api/reports/top-expenses
```

### Admin (Requires Admin Role)
```http
GET /api/admin/users
GET /api/admin/stats
```

---

## 🔐 Security Checklist (Production)

- [ ] Change JWT secret key (64+ chars)
- [ ] Update MongoDB connection string
- [ ] Configure CORS for production domain
- [ ] Change admin credentials
- [ ] Enable HTTPS
- [ ] Set up environment variables
- [ ] Review SECURITY.md completely

---

## 📦 Project Structure

```
Project3/
├── api/                    # ASP.NET Core Backend
│   ├── Controllers/        # API endpoints
│   ├── Services/          # Business logic
│   ├── Models/            # Data models
│   ├── Dtos/              # Validation & transfer
│   ├── Config/            # Settings
│   └── Program.cs         # Startup & config
│
├── frontend/              # Angular Frontend
│   └── src/
│       ├── app/
│       │   ├── features/  # Pages
│       │   ├── core/      # Services & guards
│       │   └── theme.scss # Styling
│       └── styles.scss    # Global styles
│
└── Documentation/
    ├── README.md          # Main docs
    ├── SECURITY.md        # Security guide
    └── BUG_FIXES_SUMMARY.md
```

---

## 🎨 Default Categories

1. Food & Dining 🍔
2. Transportation 🚗
3. Shopping 🛍️
4. Entertainment 🎬
5. Bills & Utilities 💡
6. Healthcare 🏥
7. Education 📚
8. Groceries 🛒
9. Travel ✈️
10. Other 📌

---

## 💾 Database Collections

### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String,
  createdAt: DateTime
}
```

### categories
```javascript
{
  _id: ObjectId,
  name: String,
  icon: String,
  userId: String,
  createdAt: DateTime
}
// Unique index: userId + name
```

### expenses
```javascript
{
  _id: ObjectId,
  userId: String,
  categoryId: String,
  amount: Decimal,
  paymentMode: String,
  note: String,
  receiptUrl: String,
  spentAt: DateTime,
  createdAt: DateTime
}
// Index: userId + spentAt
```

---

## 🔧 Configuration Files

### api/appsettings.json
```json
{
  "Mongo": {
    "ConnectionString": "mongodb://localhost:27017",
    "Database": "trackify_pro"
  },
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "TrackifyPro",
    "Audience": "TrackifyProUsers",
    "ExpiresInMinutes": 240
  }
}
```

### frontend/src/environments/environment.ts
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5293/api'
};
```

---

## 🎯 Key Features

✅ JWT Authentication  
✅ Role-based Access Control  
✅ Real-time Dashboard  
✅ Interactive Charts  
✅ Expense Filtering & Sorting  
✅ Category Management  
✅ Profile Management  
✅ Admin Panel  
✅ Input Validation  
✅ Responsive Design  
✅ Modern UI/UX  

---

## 📱 Payment Modes

- Cash
- Credit Card
- Debit Card
- UPI
- Net Banking
- Other

---

## 👥 User Roles

### User (Default)
- View own expenses
- Create/edit/delete own expenses
- View own categories
- Manage own profile
- View own reports

### Admin
- All User permissions
- View all users
- View all expenses (all users)
- View all categories (all users)
- Access admin statistics
- System-wide analytics

---

## 🔗 Important Links

- Main Documentation: [README.md](README.md)
- Security Guide: [SECURITY.md](SECURITY.md)
- Bug Fixes: [BUG_FIXES_SUMMARY.md](BUG_FIXES_SUMMARY.md)
- Theme Details: [THEME_REDESIGN_SUMMARY.md](THEME_REDESIGN_SUMMARY.md)

---

## 📞 Support

**Issues with:**
- MongoDB: Check if service is running
- JWT: Check token in localStorage, ensure not expired
- CORS: Verify frontend port matches CORS config
- Build: Clean and restore packages
- API: Check console for error logs

---

## 🚢 Deployment Ports

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | 4200 | 80/443 (HTTPS) |
| Backend | 5293 | 80/443 (HTTPS) |
| MongoDB | 27017 | Cloud (Atlas) |

---

**Last Updated**: February 4, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

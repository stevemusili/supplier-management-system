# Supplier Management System
The Supplier Management System is a web-based application that allows administrators to register, manage, and monitor suppliers in one centralized platform. The system enables administrators to track supplier status, view supplier records, add new suppliers, and update supplier details.

## Project Links
GitHub Repository

https://github.com/stevemusili/supplier-management-system

Live Application

https://supplier-management-system-navy.vercel.app

## Features
 - User registration, login, and logout
 - Protected routes
 - Supplier management (create, view, edit, delete)
 - Category management
 - Supplier search and filtering
 - Dashboard statistics
 - User profile and account settings
 - Automated testing with Vitest
 - Continuous integration with GitHub Actions
 - Deployment with Vercel

## Technologies
 - React
 - Vite
 - Tailwind CSS
 - React Router
 - Firebase Authentication
 - Cloud Firestore
 - Vitest
 - React Testing Library
 - GitHub Actions
 - Vercel

## Project Structure

```
supplier-management-system/
│
├── .github/
│   └── workflows/
│       └── ci.yml                  
│
├── public/                         
│
├── src/
│   ├── components/
│   │   ├── categories/
│   │   │   ├── CategoryForm.jsx
│   │   │   ├── CategoryForm.test.jsx
│   │   │   ├── CategoryTable.jsx
│   │   │   └── CategoryTable.test.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ProtectedRoute.test.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── RecentSuppliers.jsx
│   │   │   └── StatCard.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Categories.jsx
│   │   │   ├── Categories.test.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.test.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Login.test.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Register.test.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── SupplierFormPage.jsx
│   │   │   ├── SupplierFormPage.test.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   └── Suppliers.test.jsx
│   │   │
│   │   ├── settings/
│   │   │   ├── EmailForm.jsx
│   │   │   ├── PasswordForm.jsx
│   │   │   └── ProfileForm.jsx
│   │   │
│   │   └── suppliers/
│   │       ├── SupplierForm.jsx
│   │       ├── SupplierForm.test.jsx
│   │       ├── SupplierTable.jsx
│   │       └── SupplierTable.test.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── AuthContext.test.jsx
│   │
│   ├── firebase/
│   │   └── config.js              
│   │
│   ├── hooks/
│   │   ├── useCategories.js
│   │   ├── useCategories.test.js
│   │   ├── useDashboardData.js
│   │   ├── useDashboardData.test.js
│   │   ├── useSuppliers.js
│   │   └── useSuppliers.test.js
│   │
│   ├── services/
│   │   ├── categoryService.js
│   │   ├── categoryService.test.js
│   │   ├── profileService.js
│   │   ├── supplierService.js
│   │   └── supplierService.test.js
│   │
│   ├── test/
│   │   └── setup.js              
│   │
│   ├── App.css
│   ├── App.jsx                    
│   ├── index.css                   
│   └── main.jsx                    
│
├── .env.example                    
├── .gitignore 
├── LICENSE  
├── README.md                   
├── eslint.config.js                
├── index.html                      
├── package-lock.json                  
├── package.json              
├── vercel.json               
└── vite.config.js              
```

## Installation
Clone the GitHub repository and navigate into the project directory.

```
git clone https://github.com/stevemusili/supplier-management-system
cd supplier-management-system
```

Install dependencies:

```
npm install
```

## Run Locally
Start the development server:

```
npm run dev
```

Open the local URL in your terminal.

## Testing
Run all automated tests:

```
npm run test:run
```

Run tests with coverage:

```
npm run test:coverage
```

## License

Copyright (c) 2026 Steve Musili

[MIT License](LICENSE).
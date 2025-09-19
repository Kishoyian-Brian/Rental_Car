# RentCar - Car Rental Management System

A comprehensive full-stack car rental management system built with modern web technologies. This application provides a complete solution for car rental businesses with role-based access control for admins, agents, and customers.

## 🚀 Features

### For Customers
- **Car Browsing**: Browse available cars with advanced filtering options
- **Booking System**: Make reservations with date selection and location pick-up
- **Profile Management**: Update personal information and view booking history
- **Reviews & Ratings**: Rate and review rented vehicles
- **Real-time Notifications**: Get updates on booking status and promotions
- **Responsive Design**: Access from any device with mobile-optimized interface

### For Agents
- **Booking Management**: Handle customer reservations and approvals
- **Car Availability**: Manage vehicle availability and status
- **Customer Support**: Communicate with customers through the platform
- **Approval Workflow**: Wait for admin approval to access full agent features

### For Admins
- **Complete System Control**: Full access to all system features
- **Agent Management**: Approve new agent registrations
- **Car Management**: Add, edit, and manage vehicle inventory
- **Booking Oversight**: Monitor and manage all reservations
- **Revenue Tracking**: View financial reports and statistics
- **User Management**: Manage all user accounts and permissions

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **File Storage**: Cloudinary for image uploads
- **Email Service**: Nodemailer with EJS templates
- **Validation**: Class-validator and Class-transformer
- **Testing**: Jest for unit and E2E tests

### Frontend
- **Framework**: Angular with TypeScript
- **UI Components**: Standalone components with modern design
- **State Management**: Services with RxJS observables
- **Forms**: Reactive and template-driven forms
- **HTTP Client**: Interceptors for authentication and error handling
- **Routing**: Angular Router with guards
- **Styling**: CSS with responsive design principles

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database
- **Cloudinary account** (for image storage)
- **Email service** (SMTP configuration)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd RentCar
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and service credentials

# Set up the database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start the development server
npm run start:dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
ng serve
```

### 4. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rentcar"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email Configuration
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
MAIL_FROM="noreply@rentcar.com"

# Application
PORT=3000
FRONTEND_URL="http://localhost:4200"
```

## 🏗️ Project Structure

```
RentCar/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── car/               # Car management
│   │   ├── booking/           # Booking system
│   │   ├── payment/           # Payment processing
│   │   ├── review/            # Review system
│   │   ├── location/          # Location management
│   │   ├── notification/      # Notification system
│   │   ├── shared/            # Shared services
│   │   └── main.ts            # Application entry point
│   ├── prisma/                # Database schema and migrations
│   ├── test/                  # E2E tests
│   └── http-requests/         # API testing files
├── frontend/                   # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Angular components
│   │   │   ├── services/      # Business logic services
│   │   │   ├── app.routes.ts  # Routing configuration
│   │   │   └── app.config.ts  # App configuration
│   │   └── main.ts            # Application entry point
│   └── angular.json            # Angular CLI configuration
└── README.md                   # This file
```

## 🎯 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/create-admin` - Create admin account
- `POST /auth/create-agent` - Create agent account

### Cars
- `GET /cars` - Get all cars
- `GET /cars/:id` - Get car by ID
- `POST /cars` - Create new car (Admin/Agent)
- `PUT /cars/:id` - Update car (Admin/Agent)
- `DELETE /cars/:id` - Delete car (Admin)
- `POST /cars/:id/upload-images` - Upload car images
- `PUT /cars/:id/toggle-availability` - Toggle availability

### Bookings
- `GET /bookings` - Get user bookings
- `GET /bookings/all` - Get all bookings (Admin/Agent)
- `POST /bookings` - Create booking
- `PUT /bookings/:id/confirm` - Confirm booking
- `PUT /bookings/:id/cancel` - Cancel booking

### Reviews
- `GET /reviews` - Get all reviews
- `GET /reviews/car/:carId` - Get reviews for specific car
- `POST /reviews` - Create review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

## 🔐 User Roles & Permissions

### Customer
- Browse and search cars
- Make bookings
- Manage profile
- Write reviews
- View notifications

### Agent
- All customer permissions
- Manage bookings
- Handle customer inquiries
- Update car availability
- *Requires admin approval*

### Admin
- All agent permissions
- Manage agents (approve/reject)
- Full car management
- System oversight
- Revenue tracking

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Real-time Updates**: Live notifications and status updates
- **Advanced Filtering**: Multi-criteria search and filtering
- **Image Gallery**: High-quality car images with zoom functionality
- **Booking Calendar**: Intuitive date selection interface
- **Progress Indicators**: Clear feedback for all user actions

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Testing
```bash
cd frontend

# Unit tests
ng test

# E2E tests
ng e2e
```

## 🚀 Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Build the application: `npm run build`
4. Deploy to your preferred hosting service (Heroku, AWS, DigitalOcean)

### Frontend Deployment
1. Build the application: `ng build --prod`
2. Deploy the `dist/` folder to your hosting service
3. Configure routing for single-page application

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Mobile-optimized forms
- Responsive image galleries
- Mobile navigation menus
- Optimized loading times

## 🔧 Development

### Adding New Features
1. Create feature branch from `main`
2. Implement backend API endpoints
3. Create frontend components and services
4. Add tests for new functionality
5. Update documentation
6. Submit pull request

### Code Style
- Backend: ESLint + Prettier configuration
- Frontend: Angular Style Guide compliance
- TypeScript strict mode enabled
- Comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Future Enhancements

- **Payment Integration**: Stripe/PayPal integration
- **Real-time Chat**: Customer support chat system
- **Mobile App**: React Native mobile application
- **Analytics Dashboard**: Advanced reporting and analytics
- **Multi-language Support**: Internationalization
- **Advanced Search**: AI-powered car recommendations
- **GPS Tracking**: Real-time vehicle location tracking

---

**Built with ❤️ using NestJS and Angular**
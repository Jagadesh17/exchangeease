# Exchange Ease - Book Swap Platform

Exchange Ease is a modern web application that enables users to swap books with other readers in their community. Users can list their books, browse available books, and arrange exchanges with other book enthusiasts.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- Supabase account for database

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jagadesh17/exchangeease.git
   cd exchangeease
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI Library
- **TypeScript** - Programming Language
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI Components
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend & Database
- **Supabase**
  - Authentication
  - Database
  - Real-time subscriptions
  - Storage for images

### State Management & Utilities
- **React Context** - Global state management
- **React Query** - Server state management
- **Zod** - Schema validation
- **date-fns** - Date formatting

## 🌐 Platforms & Tools

### Development
- **VS Code** - Code Editor
- **Git** - Version Control
- **GitHub** - Code Repository

### Deployment & Hosting
- **Netlify** - Frontend Hosting
- **Supabase** - Backend as a Service

## 🔐 Authentication

The application uses Supabase Authentication with the following features:
- Email/Password Sign up and Login
- Password Reset
- Protected Routes
- User Profile Management

## 📱 Features

- User Authentication
- Book Listing and Management
- Real-time Chat System
- Book Matching System
- Profile Management
- Responsive Design
- Dark/Light Mode

## 🔄 Database Schema

The application uses the following main tables in Supabase:
- `profiles` - User profiles
- `books` - Book listings
- `matches` - Book swap matches
- `messages` - Chat messages

## 🚀 Deployment

The application is deployed on Netlify with continuous deployment from the main branch. Any push to the main branch automatically triggers a new deployment.

## 📝 License

This project is licensed under the MIT License.

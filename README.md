# RCK BANK - Modern Banking Platform

A comprehensive banking platform inspired by Kaspi Bank, built with TypeScript, Vite, and Supabase. Features user authentication, account management, transfers, loans, and deposits.

## 🚀 Architecture

### Frontend Stack
- **Framework**: Vanilla TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with Flexbox/Grid
- **Backend Service**: Supabase (PostgreSQL + Auth)

### Features

#### User Features
✅ **Authentication**
- Sign up with email/password
- Login functionality
- Secure session management

✅ **Bank Accounts**
- Create multiple account types (Checking, Savings, Business)
- View account balances
- Track account status

✅ **Transfers**
- Transfer money between accounts
- Transaction descriptions
- Real-time balance updates

✅ **Loans**
- Apply for loans with custom amounts
- Select loan terms (6-60 months)
- View loan status (pending/approved/rejected)
- Track interest rates (12% APY)

✅ **Deposits**
- Create fixed-term deposits
- Flexible terms: 30, 90, 180, 365 days
- Interest rates: 8-10% APY
- Track deposit status

✅ **Transaction History**
- View all transactions
- Filter by account
- Track transaction status

#### Admin Features
✅ **Dashboard Analytics**
- Total users count
- Total balance across system
- Active loans monitoring
- Total deposits value
- Transaction volume

✅ **User Management**
- View all users
- User details and status

✅ **Account Management** 
- Monitor all bank accounts
- Update account status (active/frozen/closed)
- Track account balances

✅ **Loan Administration**
- View pending loan applications
- Approve/reject loans
- Auto-disburse approved loans to accounts
- Track all loans

## 📋 Project Structure

```
RCK-bank-platform/
├── src/
│   ├── components/
│   │   ├── auth.ts           # Authentication UI
│   │   ├── UserDashboard.ts  # User portal
│   │   └── Admindashboard.ts # Admin panel
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client & types
│   │   ├── auth.ts           # Auth functions
│   │   ├── banking.ts        # Banking operations
│   │   └── admin.ts          # Admin functions
│   ├── main.ts               # Application entry point
│   ├── style.css             # Global styles
│   └── vite-env.d.ts         # Vite environment types
├── supabase/
│   └── migrations/
│       └── bank_schema.sql   # Database schema
├── dist/                      # Built files
├── index.html                # Main HTML file
├── package.json              # Dependencies
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔧 Setup Guide

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy your `ANON_KEY` and `PROJECT_URL`
   - Update `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. **Setup Database**
   - Go to Supabase SQL Editor
   - Run the SQL from `supabase/migrations/bank_schema.sql`
   - This creates all necessary tables

4. **Create Admin User**
   - Sign up as normal user first
   - Go to Supabase Database → profiles table
   - Set `is_admin = true` for your user account

5. **Start Development Server**
```bash
npm run dev
```

6. **Build for Production**
```bash
npm run build
```

## 💾 Database Schema

### Tables
- **profiles** - User accounts and roles
- **bank_accounts** - User bank accounts
- **transactions** - Transfer history
- **loans** - Loan applications and records
- **deposits** - Deposit accounts

## 🔐 Security Features

✅ Supabase Auth for secure authentication
✅ Row-level security (RLS) policies
✅ Environment variables for sensitive data
✅ HTTPS-only communication
✅ Secure password requirements

## 🎨 UI/UX Features

- **Responsive Design** - Works on all devices
- **Dark-friendly Colors** - Blue and gray professional palette
- **Clear Navigation** - Intuitive tab-based navigation
- **Modal Forms** - Elegant modal dialogs for actions
- **Status Badges** - Clear visual status indicators
- **Balance Formatting** - Professional currency display

## 📱 Testing Users

### Test Admin Account
1. Sign up with any email: `admin@example.com`
2. Go to Supabase Profiles table
3. Set `is_admin = true`
4. Login to access admin dashboard

### Test User Account
1. Create multiple regular accounts
2. Each gets their own accounts, loans, and deposits
3. Admin can manage all users

## 🚀 Running the Application

The application is live at: **http://localhost:5173/**

### User Portal Features
1. Log in to your account
2. Create bank accounts
3. Transfer money between accounts
4. Apply for loans
5. Create deposits
6. View transaction history

### Admin Portal Features
1. View system statistics
2. Manage user accounts
3. Approve/reject loans
4. Monitor deposits
5. Update account statuses

## 📊 Key Transactions

### Money Transfer
- Select from account ✓
- Enter recipient account number ✓
- Specify amount ✓
- Add description ✓
- Balance updates automatically ✓

### Loan Application
- Set loan amount (min 1,000 KZT) ✓
- Select term (6-60 months) ✓
- Automatic interest rate (12%) ✓
- Admin approval workflow ✓
- Automatic fund disbursement ✓

### Deposit Creation
- Set deposit amount (min 10,000 KZT) ✓
- Choose term (30-365 days) ✓
- Interest rates vary by term ✓
- Automatic maturity calculation ✓

## 🔊 API Integration

All operations use Supabase REST API:
- Real-time updates
- Automatic scaling
- Built-in PostgreSQL
- No backend server needed

## 📝 Currency

All transactions in **KZT (Kazakhstani Tenge)**

## 🤝 Support

For issues or questions:
1. Check Supabase status
2. Verify environment variables
3. Check browser console for errors
4. Ensure database is properly initialized

## 📄 License

Created for RCK BANK demonstration

## 🎯 Future Enhancements

- [ ] Mobile app version
- [ ] Multi-currency support
- [ ] Investment products
- [ ] Credit card management
- [ ] Payment aggregation
- [ ] Advanced analytics
- [ ] Notification system
- [ ] Two-factor authentication

---

**RCK BANK** - Your Modern Banking Solution 🏦

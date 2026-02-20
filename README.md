# Aura Finance

AURA Finance is a comprehensive personal finance tracking and budgeting application designed with a premium, modern aesthetic. The application allows you to track incomes, expenses, manage budgets, and review analytics for your personal finances.

## 🚀 Features

- **Dashboard:** An overview of your financial health, recent transactions, and spending breakdowns.
- **Transactions Management:** Add, edit, and categorize your income and expenses.
- **Budgeting:** Set monthly budgets for different categories and get notified when you're nearing your limits.
- **Reports & Analytics:** Visualize your financial data over 3-month periods and export data as CSV.
- **Profile Customization:** Personalize your account with avatars, display names, and preferred currencies.

## 🛠️ Technologies Used

This project is built with:
- [Vite](https://vitejs.dev/) - Frontend tool
- [React](https://reactjs.org/) - UI library
- [Supabase](https://supabase.com/) - Backend and database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Recharts](https://recharts.org/) - Charts

## ⚙️ Setup & Installation

Follow these steps to get the project running locally:

### 1. Clone the repository
```bash
git clone <YOUR_GIT_URL>
cd aura-finance
```

### 2. Install dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials. 
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup
Go to your Supabase project dashboard, navigate to the SQL Editor, and run the contents of the `supabase_schema.sql` file located in the root directory of this repository. This will set up the necessary tables and storage buckets.

### 5. Start the Development Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:8080` (or another port depending on Vite configuration).

## 📝 License

This project is open-sourced under the MIT License.

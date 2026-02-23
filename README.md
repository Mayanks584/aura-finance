<div align="center">
  <h1>Aura Finance ✦</h1>
  <p>A premium, modern personal finance and budgeting application.</p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#license">License</a>
  </p>
</div>

---

## ✨ Overview

**Aura Finance** is a comprehensive personal finance tracking application designed with a focus on aesthetics, usability, and data privacy. With a beautiful glassmorphic UI, it helps you manage your income, track expenses, set budgets, and gain deep insights into your financial health.

## 🚀 Features

- **📊 Intelligent Dashboard**: Get a bird's-eye view of your financial health with dynamic health scores, rich visualizations, and monthly trend analysis.
- **💸 Transaction Management**: Effortlessly add, edit, and categorize your income and expenses with an intuitive interface.
- **🎯 Smart Budgeting**: Set customizable monthly limits for different categories. Visual progress bars keep you informed on your spending.
- **🤝 Bill Splitting (IOUs)**: Manage shared expenses and track who owes you (or who you owe) with the integrated split feature.
- **📈 Advanced Reports**: Visualize spending patterns, filter by date ranges, and export your financial data directly to CSV.
- **🔔 Real-time Notifications**: Stay updated with essential alerts when you approach or exceed budget limits.
- **🎨 Premium UI/UX**: Designed with a sleek, modern, and fully responsive interface utilizing Framer Motion for liquid-smooth interactions.

## 🛠️ Tech Stack

**Frontend:**
- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/) - Lightning-fast frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling framework
- [Framer Motion](https://www.framer.com/motion/) - Complex declarative animations
- [Recharts](https://recharts.org/) - Powerful data visualization

**Backend & Database:**
- [Supabase](https://supabase.com/) - Open source Firebase alternative
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Edge Functions

## 🏎️ Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account for the database

### 1. Clone the Repository

```bash
git clone https://github.com/Mayanks584/aura-finance.git
cd aura-finance
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and configure your Supabase credentials. You must provide the following keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. Navigate to the **SQL Editor** in your Supabase project dashboard.
2. Open the `supabase_schema.sql` file provided in the repository root.
3. Run the SQL commands to automatically provision all required tables, Row Level Security (RLS) policies, and storage.

### 5. Run the Application

Start the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:8080`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Mayanks584/aura-finance/issues).

## � License

This project is open-sourced under the [MIT License](LICENSE).

---
<div align="center">
  Made with ❤️ for better financial health.
</div>

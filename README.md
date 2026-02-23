<div align="center">
  <img src="https://via.placeholder.com/800x200.png?text=Aura+Finance+Banner" alt="Aura Finance Banner" width="100%" />

  <br />
  <br />

  <h1>✦ Aura Finance ✦</h1>
  
  <p>
    <strong>The ultimate personal finance manager for the modern web.</strong><br>
    <i>Track expenses, monitor limits, structure your budget, and stay on top of your money with a beautiful, glassmorphic UI.</i>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite">
    <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase">
    <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square">
  </p>
</div>

---

## 🎯 Why Aura Finance?

Managing your money shouldn't feel like a chore. **Aura Finance** was built to provide an incredibly smooth, visually stunning, and highly insightful experience for personal budgeting. We replace boring spreadsheets with interactive charts, dynamic data grids, and real-time budget limit alerts.

Whether you're tracking daily coffees, splitting bills with friends, or planning long-term savings, Aura Finance is your all-in-one centralized operating system for money.

---

## ✨ Features

- **📊 Intelligent Dashboard**: Get a bird's-eye view of your financial health with dynamic health scores, rich Recharts visualizations, and monthly trend analysis.
- **💸 Seamless Transactions**: Effortlessly add, edit, and categorize your income and expenses.
- **🎯 Smart Budgeting & Alerts**: Set customized monthly limits for different categories. Get visually warned when you are nearing your budget limits.
- **🤝 Bill Splitting (IOUs)**: Manage shared expenses and track who owes you (or who you owe) with the integrated split feature.
- **📈 Advanced Reporting**: Visualize spending patterns, filter by complex date ranges, and export your financial data directly to CSV.
- **🎨 Premium UI/UX**: Designed with a sleek, modern, glassmorphic and fully responsive interface utilizing Framer Motion for liquid-smooth interactions.
- **🔒 Secure by Default**: Powered by Supabase, featuring secure authentication and robust Row Level Security (RLS) ensuring your financial data remains entirely yours.

---

## � Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Utility-first) + Vanilla CSS Grid/Flexbox |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Data Visualization**| [Recharts](https://recharts.org/) |
| **Backend & DB** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions) |
| **Routing** | [React Router DOM](https://reactrouter.com/) |
| **Icons** | [Remix Icon](https://remixicon.com/) |

---

## 🚀 Quick Start

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account 

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Mayanks584/aura-finance.git
   cd aura-finance
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and map your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize the Database**
   - Navigate to the **SQL Editor** in your Supabase project dashboard.
   - Open the `supabase_schema.sql` file provided in the repository root.
   - Run the SQL commands. This provisions tables, RLS policies, storage buckets, and database triggers.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   > 💡 The application will be running at `http://localhost:8080`.

---

## 📂 Project Structure

```text
aura-finance/
├── public/                 # Static assets (favicons, etc.)
├── src/                    
│   ├── components/         # Reusable UI components (Navbar, Modals, Cards)
│   ├── context/            # React Contexts (Auth, Notifications, Toast)
│   ├── pages/              # Main route views (Dashboard, Budget, IOU, Profile)
│   ├── services/           # Supabase DB service abstraction layers
│   ├── App.tsx             # Root application & routing setup
│   ├── index.css           # Global styles and Tailwind imports
│   └── main.tsx            # React DOM entry point
├── supabase/
│   └── functions/          # Deno-based Supabase Edge Functions (e.g., budget alerts)
├── supabase_schema.sql     # Complete database schema and RLS policies
├── tailwind.config.js      # Custom theme and Tailwind configuration
└── package.json            # Dependencies and scripts
```

---

## 🎨 Design Philosophy

Aura Finance opts for a **glassmorphic**, light-themed premium aesthetic by default. We use complex CSS mesh gradients and floating label inputs to create an environment that feels more like a modern neo-banking app rather than an outdated dashboard.

> Check out `src/index.css` to see the custom design system tokens ranging from shadow-glows to animated blobs!

---

## 💡 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Made with ❤️ by <strong>Mayank Rana</strong></p>
  <p><i>If you like this project, please consider giving it a ⭐!</i></p>
</div>

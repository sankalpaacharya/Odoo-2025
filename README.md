<div align="center">
  <h1>WorkZen</h1>
  <p><strong>Smart Human Resource Management System</strong></p>
  <p>A comprehensive HRMS platform for managing people, processes, and payroll with role-based access control.</p>
</div>

---

## About

WorkZen is a modern, all-in-one Human Resource Management System designed to simplify HR operations for startups, institutions, and SMEs. Built with a focus on clean architecture and user experience, it provides seamless management of attendance, leave, payroll, and analytics through a unified interface. The platform emphasizes robust role-based access control, data-driven insights, and reducing manual dependency to empower organizations with transparent, efficient workforce management.

## Tech Stack

### Frontend

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with React Compiler
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Reusable component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[TanStack Query v5](https://tanstack.com/query)** - Server state management
- **[TanStack Form](https://tanstack.com/form)** - Type-safe form handling
- **[CASL](https://casl.js.org/)** - Authorization and ACL
- **[Recharts 2](https://recharts.org/)** - Data visualization
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[React Hook Form](https://react-hook-form.com/)** - Form validation
- **[Yup](https://github.com/jquense/yup)** - Schema validation
- **[date-fns](https://date-fns.org/)** - Date utilities
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark mode support
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[XLSX](https://sheetjs.com/)** - Excel export functionality

### Backend

- **[Node.js](https://nodejs.org/)** - Runtime environment
- **[Express 5](https://expressjs.com/)** - Web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Prisma](https://www.prisma.io/)** - ORM and database toolkit
- **[PostgreSQL](https://www.postgresql.org/)** - Database
- **[Better Auth](https://www.better-auth.com/)** - Authentication library
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **[Zod](https://zod.dev/)** - Schema validation
- **[Nodemailer](https://nodemailer.com/)** - Email service
- **[Multer](https://github.com/expressjs/multer)** - File uploads

### DevOps & Tools

- **[Turborepo](https://turbo.build/repo)** - Monorepo build system
- **[pnpm](https://pnpm.io/)** - Fast, disk-efficient package manager
- **[Docker](https://www.docker.com/)** - Database containerization
- **[tsx](https://github.com/privatenumber/tsx)** - TypeScript execution
- **[tsdown](https://github.com/sxzz/tsdown)** - TypeScript bundler

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 9.x
- **PostgreSQL** >= 14.x
- **Docker** (optional, for containerized database)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/sankalpaacharya/Odoo-2025.git
cd Odoo-2025
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create `.env` files in the following locations:

**`apps/server/.env`**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/workzen"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
PORT=3000
```

**`apps/web/.env.local`**

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Start the database (if using Docker)**

```bash
pnpm run db:start
```

5. **Push database schema**

```bash
pnpm run db:push
```

6. **Seed the database**

```bash
pnpm run db:seed
pnpm run db:seed:permissions
```

7. **Start the development servers**

```bash
pnpm run dev
```

The application will be available at:

- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

### Root Level

- `pnpm run dev` - Start all applications in development mode
- `pnpm run build` - Build all applications for production
- `pnpm run check-types` - Type-check all packages

### Web Application

- `pnpm run dev:web` - Start only the frontend
- `pnpm run build` - Build the web application

### Server

- `pnpm run dev:server` - Start only the backend
- `pnpm run build` - Build the server

### Database

- `pnpm run db:push` - Push schema changes to database
- `pnpm run db:generate` - Generate Prisma client
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:studio` - Open Prisma Studio
- `pnpm run db:seed` - Seed database with sample data
- `pnpm run db:seed:permissions` - Seed role permissions
- `pnpm run db:start` - Start PostgreSQL with Docker
- `pnpm run db:stop` - Stop PostgreSQL container
- `pnpm run db:down` - Remove PostgreSQL container

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## 👨‍💻 Author

- [@sankalpaacharya](https://github.com/sankalpaacharya)
- [@aryanranderiya](https://github.com/aryanranderiya)
- [@dhruvmaradiya](https://github.com/dhruv-maradiya)
- [@vinitthakkar](https://github.com/vinitthakkar45)

---

<div align="center">
  <p>Built with ❤️ using Next.js, Express, Prisma, and TypeScript</p>
</div>

# Employee Login System with Auto-Generated Employee Codes

## Features

✅ **Automatic Employee Code Generation**
- Format: `[Company Initials][Name Initials][Year][Serial]`
- Example: `OIJDOD20220001` for John Doe joining Odoo India in 2022

✅ **Auto-Generated Temporary Passwords**
- System generates secure random passwords
- Employees change password on first login

✅ **HR/Admin Employee Creation**
- Only HR/Admin can create employee accounts
- Regular users cannot self-register

## Login ID Generation Logic

```
Employee Code = [Company Initials] + [Name Initials] + [Year] + [Serial Number]

Example: OIJDOD20220001
- OI = Odoo India (First 2 letters of each word in company name)
- JDOD = John Doe (First 2 letters of first name + last name)
- 2022 = Year of Joining
- 0001 = Serial number (auto-incremented per year)
```

## Setup

1. **Update Prisma Schema**
```bash
cd packages/db
npx prisma generate
npx prisma db push
```

2. **Environment Variables**
Create `.env` files in appropriate locations:

```bash
# apps/server/.env
PORT=3000
CORS_ORIGIN=http://localhost:3001
DATABASE_URL="your-database-url"

# apps/web/.env.local
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

3. **Install Dependencies**
```bash
pnpm install
```

4. **Run Development Servers**
```bash
# Terminal 1 - Server
cd apps/server
pnpm dev

# Terminal 2 - Web
cd apps/web
pnpm dev
```

## Usage

### For HR/Admin - Creating Employees

1. Navigate to `/dashboard/employees/create`
2. Fill in employee details:
   - Company Name (e.g., "Odoo India")
   - First Name, Last Name
   - Email, Phone (optional)
   - Department, Designation (optional)
   - Date of Joining
   - Basic Salary
3. Click "Create Employee"
4. System will display:
   - **Employee Code** (for login)
   - **Temporary Password** (share securely with employee)

### For Employees - First Login

1. Go to login page
2. Enter Employee Code or Email
3. Enter temporary password provided by HR
4. Change password after first login

## API Endpoints

### Create Employee
```typescript
POST /api/employees/create
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "companyName": "Odoo India",
  "dateOfJoining": "2022-01-01T00:00:00.000Z",
  "basicSalary": 50000,
  // ... other optional fields
}

Response:
{
  "success": true,
  "data": {
    "employeeCode": "OIJDOD20220001",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "temporaryPassword": "SecurePass123!"
  }
}
```

### Generate Employee Code (Preview)
```typescript
POST /api/employees/generate-code
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Odoo India",
  "dateOfJoining": "2022-01-01"
}

Response:
{
  "success": true,
  "employeeCode": "OIJDOD20220001"
}
```

## Database Schema

### User Table (Better Auth)
- `id`: Unique identifier
- `name`: Full name
- `email`: Email address
- `firstName`: First name
- `lastName`: Last name
- `companyName`: Company name
- `emailVerified`: Email verification status

### Employee Table
- `id`: Unique identifier
- `userId`: Reference to User
- `employeeCode`: Auto-generated unique code
- `firstName`, `lastName`, `middleName`: Name fields
- `dateOfJoining`: Joining date
- `basicSalary`: Basic salary
- `role`: Employee role (ADMIN, HR_OFFICER, EMPLOYEE, etc.)
- `employmentStatus`: ACTIVE, INACTIVE, etc.
- ...other fields

## Security Notes

🔒 **Password Security**
- Temporary passwords are randomly generated (12+ characters)
- Passwords are hashed using Better Auth's secure hashing
- Employees must change password on first login

🔒 **Access Control**
- Only authenticated HR/Admin can create employees
- Employee codes are unique and cannot be duplicated
- Email addresses are validated and must be unique

## Tech Stack

- **Next.js 15** - Frontend
- **Better Auth** - Authentication
- **Prisma** - ORM
- **PostgreSQL** - Database  
- **TanStack Form** - Form management
- **Tailwind CSS** - Styling


### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.local.example .env.local

# 3. Setup MongoDB
# See MONGODB_SETUP.md for detailed instructions
# For quick local setup: Install MongoDB and it will run on mongodb://localhost:27017

# 4. Update .env.local with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/next-jwt-auth
# or
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/next-jwt-auth

# 5. Generate JWT secrets (run twice for two different keys)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 6. Add the generated secrets to .env.local

# 7. Seed database with test users
npm run seed

# 8. Run development server
npm run dev
```

Open http://localhost:3000

**Test credentials:**

- Admin: admin@example.com / admin123
- User: user@example.com / user123

## 📁 Structure

```
next-jwt-auth/
├── app/                  # Next.js App Router
│   ├── (auth)/          # Auth pages
│   │   ├── login/       # Login page
│   │   ├── signup/      # Registration page
│   │   └── dashboard/   # User dashboard
│   ├── api/auth/        # API routes (backend)
│   │   ├── signin/      # Login endpoint
│   │   ├── signup/      # Registration endpoint
│   │   ├── signout/     # Logout endpoint
│   │   ├── refresh-token/ # Token refresh
│   │   └── profile/     # Get user profile
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── lib/                  # Backend utilities
│   ├── jwt.ts           # JWT token management
│   ├── users.ts         # User CRUD operations
│   ├── config.ts        # Server configuration
│   └── types.ts         # Backend types
├── config/               # Frontend config
│   └── Auth.ts          # JWT auth configuration
├── types/                # Frontend types
│   └── Auth.ts          # User type definitions
├── library/              # next-jwt-auth library source
│   └── src/
├── middleware.ts         # Route protection
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🔌 API Endpoints

| Endpoint                  | Method | Description          |
| ------------------------- | ------ | -------------------- |
| `/api/auth/signup`        | POST   | Register new user    |
| `/api/auth/signin`        | POST   | Login user           |
| `/api/auth/signout`       | POST   | Logout user          |
| `/api/auth/refresh-token` | POST   | Refresh access token |
| `/api/auth/profile`       | GET    | Get user profile     |

## 🎯 Pages

| Route        | Description       | Protected |
| ------------ | ----------------- | --------- |
| `/`          | Home page         | No        |
| `/login`     | Login page        | No        |
| `/signup`    | Registration page | No        |
| `/dashboard` | User dashboard    | Yes       |

---


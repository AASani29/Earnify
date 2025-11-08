# Navbar Component Usage Guide

## Overview

We have **two navbar components** for different use cases:

1. **`Navbar`** - For public pages (landing, login, signup)
2. **`AuthNavbar`** - For authenticated pages (dashboard, profile, tasks)

---

## 1. Navbar (Public Pages)

**Location:** `components/Navbar.tsx`

**Use this for:** Landing page, public pages, pages without authentication

### Features:
- ✅ Earnify logo (clickable, navigates to home)
- ✅ Sign In button → `/login`
- ✅ Get Started button → `/signup`
- ✅ No authentication required

### Usage:

```tsx
import Navbar from '@/components/Navbar'

export default function PublicPage() {
  return (
    <div>
      <Navbar />
      {/* Your page content */}
    </div>
  )
}
```

### Example Pages:
- ✅ `app/page.tsx` (Landing page) - Already using it
- ✅ `app/test-image/page.tsx` (Test page)

---

## 2. AuthNavbar (Authenticated Pages)

**Location:** `components/AuthNavbar.tsx`

**Use this for:** Dashboard, profile, tasks, applications - any page inside `app/(auth)/`

### Features:
- ✅ Earnify logo (clickable, navigates to home)
- ✅ Dashboard button → Role-specific dashboard
- ✅ Profile button → `/profile`
- ✅ Logout button → Logs out and redirects to `/login`
- ✅ Requires JWT authentication context

### Usage:

```tsx
import AuthNavbar from '@/components/AuthNavbar'

export default function AuthenticatedPage() {
  return (
    <div>
      <AuthNavbar />
      {/* Your page content */}
    </div>
  )
}
```

### Example Pages to Update:
- `app/(auth)/dashboard/worker/page.tsx`
- `app/(auth)/dashboard/client/page.tsx`
- `app/(auth)/profile/page.tsx`
- `app/(auth)/applications/page.tsx`
- `app/(auth)/tasks/[id]/page.tsx`

---

## How to Replace Existing Navigation

### Before (Worker Dashboard):
```tsx
<div style={{ background: 'white', borderBottom: '2px solid #e9ecef' }}>
  <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.5rem' }}>
    <h2>💼 Earnify</h2>
    <nav>
      <button>Dashboard</button>
      <button>My Applications</button>
      <button>Profile</button>
      <button onClick={logout}>Logout</button>
    </nav>
  </div>
</div>
```

### After:
```tsx
import AuthNavbar from '@/components/AuthNavbar'

// In your component:
<AuthNavbar />
```

---

## Logo Image Issue Fix

### Problem:
The logo shows "alt text" instead of the image.

### Solution:

**Step 1: Restart Dev Server**
```bash
# Stop the server (Ctrl+C)
rm -rf .next
npm run dev
```

**Step 2: Hard Refresh Browser**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Step 3: Test Image Loading**
Visit: `http://localhost:3000/test-image`

You should see both PNG and SVG versions of the logo.

**Step 4: Check Direct Access**
Open in browser:
- `http://localhost:3000/Earnify-Logo.png`
- `http://localhost:3000/Earnify-Logo.svg`

If you can see the images directly, the navbar will work.

---

## Why Two Navbar Components?

### The Problem:
- `AuthNavbar` uses `useJWTAuthContext()` hook
- This hook requires the JWT Auth Provider
- Public pages (landing, login, signup) are NOT wrapped in the Auth Provider
- Using `AuthNavbar` on public pages causes: **"JWTAuthContext not found"** error

### The Solution:
- **Public pages** → Use `Navbar` (no auth context needed)
- **Authenticated pages** → Use `AuthNavbar` (has auth context)

---

## File Locations

```
components/
├── Navbar.tsx          # For public pages
└── AuthNavbar.tsx      # For authenticated pages

public/
├── Earnify-Logo.png    # Logo image (PNG format)
└── Earnify-Logo.svg    # Logo image (SVG format)

app/
├── page.tsx            # Landing page (uses Navbar)
├── test-image/
│   └── page.tsx        # Test page (uses Navbar)
└── (auth)/             # All authenticated pages
    ├── dashboard/
    │   ├── worker/page.tsx      # Should use AuthNavbar
    │   └── client/page.tsx      # Should use AuthNavbar
    ├── profile/page.tsx         # Should use AuthNavbar
    ├── applications/page.tsx    # Should use AuthNavbar
    └── tasks/
        └── [id]/page.tsx        # Should use AuthNavbar
```

---

## Next Steps

1. ✅ Restart dev server and verify logo loads
2. ⏳ Replace custom navigation in authenticated pages with `<AuthNavbar />`
3. ⏳ Test all pages to ensure navigation works correctly

---

## Troubleshooting

### Logo not showing?
1. Check file exists: `ls -la public/Earnify-Logo.png`
2. Restart dev server: `rm -rf .next && npm run dev`
3. Hard refresh browser: `Ctrl + Shift + R`
4. Test direct access: `http://localhost:3000/Earnify-Logo.png`

### "JWTAuthContext not found" error?
- You're using `AuthNavbar` on a public page
- Use `Navbar` instead for public pages

### Buttons not working?
- Check browser console for errors
- Verify routes exist (`/login`, `/signup`, `/dashboard`, etc.)


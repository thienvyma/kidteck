# Phase 03: Auth Core & Middleware — Session 3

> 1 Session = 1 Phase = tối đa 3 files. Đọc file này là đủ context.

## Mục tiêu
Thiết lập Supabase SDK clients + route protection middleware. KHÔNG làm UI.

## Prerequisites
- `.env.local` có `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Đã chạy SQL schema (`docs/database-schema.md`)
- `npm install @supabase/supabase-js @supabase/ssr`

## Files (3)

### 1. `src/lib/supabase.js`
```
Export: createClient()
Import: @supabase/ssr → createBrowserClient
Dùng trong: Client Components ("use client")
Pattern:
  export function createClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
```

### 2. `src/lib/supabase-server.js`
```
Export: createServerClient() (async)
Import: @supabase/ssr → createServerClient, next/headers → cookies
Dùng trong: Server Components, Route Handlers
Pattern:
  - Đọc cookies() từ next/headers
  - Return createServerClient(url, key, { cookies config })
```

### 3. `src/middleware.js`
```
Export: middleware(request), config.matcher
Logic:
  1. Lấy session từ Supabase
  2. Chưa login + /admin/* hoặc /student/* → redirect /login
  3. Đã login:
     - /admin/* + role≠admin → redirect /student
     - /student/* + role≠student → redirect /admin
     - /login hoặc /register + đã login → redirect theo role
  4. config.matcher: ['/admin/:path*', '/student/:path*', '/login', '/register']
```

## Verify
- Import supabase client không lỗi
- Middleware chặn `/admin` và `/student` khi chưa login
- `npm run build` pass

## Commit
`feat(auth): supabase clients + route middleware`

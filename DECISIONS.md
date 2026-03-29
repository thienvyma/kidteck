# 📝 DECISIONS.md — Sổ Quyết Định Thiết Kế

## D1: Next.js 14 App Router (không Pages Router)
**Quyết định**: Dùng App Router + Server Components
**Lý do**: SEO tốt hơn, streaming, nested layouts, RSC mặc định
**Alternatives**: Pages Router (rejected: legacy, không có RSC)

## D2: JavaScript thay vì TypeScript
**Quyết định**: Dùng JS thuần, không TypeScript
**Lý do**: Dự án EdTech đơn giản, vibe coding nhanh hơn với JS, giảm setup complexity
**Alternatives**: TypeScript (rejected: overhead cho dự án đơn giản)

## D3: Vanilla CSS + CSS Modules (không Tailwind)
**Quyết định**: CSS Modules cho components, globals.css cho shared tokens
**Lý do**: Full control, không dependency, BEM-like naming dễ maintain
**Alternatives**: Tailwind CSS (rejected: thiếu control, bundle size), styled-components (rejected: runtime cost)

## D4: Supabase (không Firebase, không NextAuth)
**Quyết định**: Supabase cho DB + Auth + RLS
**Lý do**: Free tier đủ dùng, PostgreSQL native, RLS bảo mật, Auth tích hợp sẵn
**Alternatives**: Firebase (rejected: vendor lock-in), NextAuth + Prisma (rejected: setup phức tạp hơn)

## D5: Route Groups cho Auth
**Quyết định**: Dùng `(auth)` route group
**Lý do**: Auth layout riêng (centered card) khác hoàn toàn admin/student layout
**Alternatives**: Shared layout (rejected: phải conditional render)

## D6: Server Components mặc định
**Quyết định**: Mọi page là Server Component trừ khi cần client interactivity
**Lý do**: Data fetching nhanh hơn, SEO tốt hơn, giảm JS bundle
**Alternatives**: Client-first (rejected: slower, larger bundle)

## D7: Target phụ huynh, không target teen
**Quyết định**: Landing page content đánh vào pain point phụ huynh
**Lý do**: Phụ huynh là người quyết định + trả tiền. Teen là người dùng nhưng không phải buyer
**Alternatives**: Target teen (rejected: teen không quyết định chi tiêu)

## D8: 3 Levels theo lứa tuổi
**Quyết định**: Level 1 (12-14), Level 2 (15-16), Level 3 (16-17)
**Lý do**: Nội dung phù hợp cognitive development từng giai đoạn
**Alternatives**: Level theo skill (rejected: không matching với hệ thống giáo dục VN)

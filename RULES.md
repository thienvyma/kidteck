# 📏 RULES.md — Luật Chơi Cho AI (KidTech)

> ⚠️ **BẮT BUỘC**: Mọi AI assistant làm việc trên dự án này PHẢI đọc file này ĐẦU TIÊN.
> File này là LUẬT — không phải gợi ý. Vi phạm = revert.
> Tham khảo: Anthropic best practices + obra/superpowers methodology.

---

## 🔴 WORKFLOW BẮT BUỘC MỖI SESSION (5 bước)

### Bước 1: ĐỌC — 6 file bắt buộc

```
1. PROGRESS.md           → Session trước làm gì, lỗi tồn đọng, bước tiếp
2. architecture_state.json → Phase nào xong/chưa, known_issues
3. RULES.md (file này)    → Nhớ luật chơi
4. SESSIONS.md            → Session hiện tại: mấy files, tests gì
5. docs/phases/phase-XX-name/README.md → Spec chi tiết (1 phase = 1 session)
6. docs/INDEX.md           → Bản đồ docs + cross-references
```

> Nếu bạn KHÔNG đọc 6 file trên → bạn CHẮC CHẮN sẽ viết code sai, trùng, hoặc thiếu.
>
> **Cấu trúc phase**: `docs/phases/phase-03-auth-core/`, `phase-04-auth-ui/`...
> Mỗi phase = 1 session = 1 README. Xem `docs/INDEX.md` để tra bảng.

### Bước 2: LẬP KẾ HOẠCH + XIN DUYỆT (Human-in-the-Loop)

Trước khi viết dòng code đầu tiên, PHẢI:
1. Liệt kê: Session số mấy? Phase nào?
2. Liệt kê: Cần tạo mấy file? Tên file gì? (tối đa 6)
3. Liệt kê: Components / pages gì?
4. Liệt kê: Edge cases / validation nào?
5. Kiểm tra: Có phụ thuộc module nào chưa xong không?
6. **TRÌNH BÀY kế hoạch cho owner → CHỜ XÁC NHẬN trước khi code**

> 💡 Theo Anthropic: "Explore → Plan → Code". KHÔNG BAO GIỜ nhảy thẳng vào code.

### Bước 3: CODE — Build + Verify

Quy trình mỗi file:
1. Tạo file theo đúng spec trong phase README
2. Đảm bảo build pass sau mỗi file (`npm run build` không error)
3. Verify bằng browser (chạy `npm run dev`, mở page, kiểm tra UI)
4. **Commit ngay sau mỗi batch hoàn thành** (không chờ cuối session)

### Bước 4: KẾT THÚC SESSION — Cập nhật 3 file

```
1. CẬP NHẬT PROGRESS.md:
   - Session vừa làm (files tạo, UI verified)
   - Lỗi tồn đọng (nếu có) — mô tả rõ: file nào, dòng nào, hiện tượng gì
   - Bước tiếp theo rõ ràng (session nào, làm gì)

2. CẬP NHẬT architecture_state.json:
   - Module status: "completed" / "in_progress"
   - known_issues[] nếu có bug
   - current_session: tăng lên

3. COMMIT cuối: `docs: update progress session N`
```

### Bước 5: THAY ĐỔI KIẾN TRÚC — Nếu có

```
- CẬP NHẬT ARCHITECTURE.md + DECISIONS.md + phase README bị ảnh hưởng
```

---

## 🚫 TUYỆT ĐỐI KHÔNG (10 điều cấm)

1. **KHÔNG sửa Landing Page** khi không được yêu cầu — page.js/page.module.css/Navbar là DONE
2. **KHÔNG viết feature ngoài session** — chỉ code module đang focus
3. **KHÔNG sửa file module khác** "tiện tay" — mỗi session = 1 module
4. **KHÔNG để code uncommitted** qua session — commit TRƯỚC khi kết thúc
5. **KHÔNG hardcode credentials** — dùng `.env.local` + `process.env`
6. **KHÔNG skip cập nhật docs** — vi phạm rule quan trọng nhất
7. **KHÔNG tạo file trống** "để sau" — mỗi file phải có ít nhất component/function
8. **KHÔNG import CSS libraries bên ngoài** — dùng CSS Modules + globals.css
9. **KHÔNG dùng Tailwind CSS** — dự án dùng vanilla CSS
10. **KHÔNG viết code trước khi kiểm tra build** — `npm run build` phải pass

## ✅ BẮT BUỘC (12 điều phải làm)

1. **Dùng CSS custom properties** — `var(--color-primary)`, KHÔNG hardcode màu
2. **Server Component mặc định** — chỉ `"use client"` khi cần useState/useEffect/onClick
3. **Mỗi file < 300 dòng** — tách component ra nếu quá dài
4. **Dùng Supabase client đúng cách** — browser: `src/lib/supabase.js`, server: `src/lib/supabase-server.js`
5. **Commit sau mỗi batch hoàn thành** — KHÔNG tích commit cuối session
6. **Responsive design** — mobile-first, test ở 375px
7. **Mỗi session tối đa 4 files mới** — vượt → DỪNG LẠI và hỏi owner
8. **Trình kế hoạch trước khi code** — owner phải xác nhận (Bước 2)
9. **Vietnamese content** — UI text bằng tiếng Việt, comments cho business logic
10. **Verify trước khi kết thúc** — build pass, browser OK, UI đúng spec
11. **Schema-First khi viết Supabase queries** — ĐỌC `docs/database-schema.md` TRƯỚC khi viết `.from('table').select()` / `.insert()` / `.update()`. Chỉ dùng ĐÚNG field đã khai báo trong schema. KHÔNG tự tưởng tượng field.
12. **Supabase error handling bắt buộc** — Mọi Supabase call PHẢI destructure `{ data, error }` và handle error. KHÔNG bỏ qua error.

---

## 🧠 QUY TẮC CHỐNG MẤT CONTEXT (Anthropic best practices)

### File = Bộ nhớ (giữa các sessions):
| File | Vai trò | Khi nào đọc |
|---|---|---|
| `PROGRESS.md` | Bộ nhớ chính | ĐẦU TIÊN mỗi session |
| `architecture_state.json` | Bản đồ module | Đầu session |
| `SESSIONS.md` | Kế hoạch chi tiết | Đầu session |
| `docs/phases/phase-XX/README.md` | Context + ghi chú | Đầu session |
| `DECISIONS.md` | Tại sao quyết định X | Khi cần context thiết kế |
| `ARCHITECTURE.md` | Kiến trúc tổng quan | Khi thay đổi kiến trúc |

### Context management (giữ context window sạch):
- CHỈ ĐỌC files cần thiết cho session hiện tại
- KHÔNG đọc toàn bộ codebase — load progressive (cần gì đọc nấy)
- Đọc theo thứ tự: PROGRESS → architecture_state → SESSIONS → phase README → source

---

## 🔄 QUY TẮC FAIL-FAST

1. Nếu fix lỗi **2 lần mà vẫn sai** → DỪNG LẠI
2. Báo owner mô tả vấn đề
3. Bắt đầu lại với approach khác (KHÔNG tiếp tục đào sâu)

## ✋ VERIFICATION IRON LAW

```
KHÔNG ĐƯỢC TUYÊN BỐ "XONG" KHI CHƯA CÓ BẰNG CHỨNG
```

Trước khi nói "đã xong", "hoàn thành":
1. **CHẠY** `npm run build` → phải pass (0 errors)
2. **MỞ** browser → verify UI đúng spec
3. **KIỂM TRA** responsive (375px)
4. **ĐỐI CHIẾU** Supabase queries với `docs/database-schema.md` → field names khớp 100%
5. CHỈ SAU ĐÓ mới tuyên bố kết quả

## 🚪 SESSION GATE-CHECK (từ bài học dự án khác)

```
KHÔNG ĐƯỢC BẮT ĐẦU SESSION MỚI NẾU BUILD CÒN LỖI
```

- Trước khi bắt đầu Session N+1, chạy `npm run build` trên code hiện tại
- Nếu có lỗi → fix TRƯỚC, commit, rồi mới bắt đầu session mới
- Lý do: lỗi tích tụ qua sessions sẽ thành nợ kỹ thuật không thể trả

---

## 🏗️ Coding Conventions

### JavaScript (KHÔNG TypeScript)
- ES2022 modules
- PascalCase cho components
- camelCase cho functions/variables
- kebab-case cho CSS files

### File & Folder Naming
- Components: `PascalCase.js` (e.g. `Sidebar.js`)
- Styles: `PascalCase.module.css` (e.g. `Sidebar.module.css`)
- Pages: `page.js`, `layout.js` (Next.js convention)
- Libraries: `camelCase.js` (e.g. `supabase.js`)
- Vietnamese locale: currency `1.500.000đ`, phone `0901234567`

### CSS
- CSS Modules (`.module.css`) cho components
- BEM-like: `.sidebar__item`, `.sidebar__item--active`
- Design system tokens từ `globals.css`
- Responsive breakpoints: 968px, 480px

### Git Commits
```
Format: <type>(<scope>): <description>
Types: chore, feat, fix, style, docs, refactor
Scopes: auth, admin, student, landing, ui, lib
```

---

## 📋 CHECKLIST NHANH (Copy vào đầu mỗi session)

```
=== TRƯỚC KHI CODE ===
□ Đã đọc PROGRESS.md
□ Đã đọc architecture_state.json (kiểm tra known_issues)
□ Đã đọc RULES.md
□ Đã đọc SESSIONS.md → Session N
□ Đã đọc docs/phases/phase-XX/README.md
□ Đã đọc docs/INDEX.md → xem docs liên quan phase
□ Đã liệt kê files cần tạo (≤6)
□ Đã CROSS-CHECK plan với phase README
□ Đã trình kế hoạch cho owner → được xác nhận

=== TRONG KHI CODE (per batch) ===
□ Tạo files theo spec
□ npm run build → pass
□ Browser verify → UI đúng
□ Responsive check (375px)
□ Commit batch

=== SAU KHI CODE ===
□ npm run build → pass (final)
□ Browser verify tất cả pages
□ Đã cập nhật PROGRESS.md
□ Đã cập nhật architecture_state.json
□ Commit cuối: docs: update progress session N
```

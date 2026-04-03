# 🧠 CLAUDE.md — AIgenlabs AI Memory File

> ⚠️ ĐỌC FILE NÀY ĐẦU TIÊN MỖI SESSION.
> Sau đó đọc theo thứ tự: PROGRESS.md → architecture_state.json → SESSIONS.md → Phase README

## Dự Án
**AIgenlabs** — Nền tảng dạy AI & Vibe Coding cho học sinh 12-17 tuổi.
Target: Phụ huynh (buyer). Learner: Teen (user).

## Trạng Thái
- **Phase hiện tại**: 3 (Authentication)
- **Session hiện tại**: 3 (Auth Core & Middleware)
- **Tổng sessions**: 12
- **Landing Page**: ✅ DONE (S0-S2)
- **Agent Environment**: ✅ DONE (kt CLI + SKILL.md)
- **Auth**: ⏳ Not started

## Agent-Native CLI
```bash
node src/cli/index.js --help          # Tất cả commands
node src/cli/index.js status --json   # System health (JSON)
node src/cli/index.js course summary  # Curriculum overview
node src/cli/index.js student list    # Student list
node src/cli/index.js db seed         # Seed demo data
```
**Skills**: `.agent/skills/aigenlabs-cli/SKILL.md` (command reference)
**Playbooks**: `.agent/skills/aigenlabs-operations/SKILL.md` (5 playbooks)

## Bộ Tài Liệu BẮT BUỘC ĐỌC

### Mỗi session (theo thứ tự):
1. `PROGRESS.md` → Session trước, lỗi tồn đọng, bước tiếp
2. `architecture_state.json` → Module status, known_issues, file list per module
3. `RULES.md` → Workflow 5 bước, 10 cấm, 10 bắt buộc, checklist
4. `SESSIONS.md` → 12 sessions: files ≤4, verify, commit
5. `docs/phases/phase-XX-name/README.md` → Spec chi tiết (1 phase = 1 session)
6. `docs/INDEX.md` → Cross-reference map

### Khi cần context:
- `ARCHITECTURE.md` → Kiến trúc tổng quan (5 tầng + component tree)
- `DECISIONS.md` → D1-D8 quyết định thiết kế
- `docs/aigenlabs-prd.md` → Master Reference Document (specs gốc §8-9)
- `docs/database-schema.md` → SQL schema + RLS + triggers
- `docs/VIBECODING_GUIDE.md` → Methodology (Anthropic + obra/superpowers)

## Tech Stack
- Next.js 14 (App Router), JavaScript (ES2022, `"type": "module"`)
- Vanilla CSS + CSS Modules (KHÔNG Tailwind)
- Supabase (PostgreSQL + Auth + RLS)
- Commander.js (kt CLI)
- Google Fonts: Inter (Vietnamese)

## Quy Tắc Quan Trọng
- Server Component mặc định, "use client" chỉ khi cần
- CSS tokens: `var(--color-primary)`, KHÔNG hardcode màu
- Responsive: mobile-first, test 375px
- Landing Page = DONE → KHÔNG sửa trừ khi được yêu cầu
- Mỗi session ≤ 4 files mới (giảm từ 6 để giữ context mỏng)
- All kt commands support `--json` cho agent consumption

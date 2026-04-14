# Phase 16 - Admin Landing CMS

> **Session**: S16
> **Module**: Admin Landing Editor + Preview
> **Status**: In Progress
> **Effort**: 2-4 sessions

---

## Tien do hien tai

- Phase 1 da xong:
  - don schema drift (`pain`, `painLabel`, `pricingLabel`)
  - lam sach wording `/admin/landing`
  - them dirty state, beforeunload warning, scrollspy, collapse/expand theo section
- Phase 2 da xong:
  - them preview pane ngay trong `/admin/landing`
  - preview dung `iframe` cua landing that, co toggle `desktop/mobile`
  - preview bam theo section dang sua
  - save landing content se `revalidatePath('/')` de preview va landing public cap nhat ngay sau khi luu
- Phase 3 da xong:
  - tao `RepeaterField` dung chung cho cac nhom item lap lai
  - da ap dung cho `solution.pillars`, `results.showcaseItems`, `faq.items`, `footer.contactLinks`
  - ho tro them / xoa / sap xep len xuong trong editor
  - landing public bo qua item rong de admin co the soan draft an toan hon
- Phase 4 dang tien hanh:
  - tao `landing-editor-schema.js` chua metadata section, `contentKey`, `previewTarget` va field config
  - tach `FieldRenderer` va `LandingSectionCard`
  - da migrate `header`, `hero`, `solution`, `catalog`, `method`, `results`, `commitment`, `faq`, `cta`, `contact`, `footer` sang renderer chung
  - bo sung `editorBlocks` cho comparison, fixed-items, repeater va read-only note
  - `page.js` khong con giu tung wrapper JSX rieng cho cac section landing nua
  - da them route preview rieng va live preview cho draft chua luu qua `postMessage`
- Chua lam:
  - draft/publish workflow
  - toi uu tiep `page.js` thanh shell/orchestrator gon hon neu can

---

## Muc tieu

Nang cap `/admin/landing` tu mot form hardcode thanh mot editor de dung hon, preview sat landing that hon, va san sang cho viec them/bot field ma khong phai sua qua nhieu noi.

## Hien trang

### Diem dang tot

- Landing content da di theo DB-first singleton document va co optimistic concurrency.
- Admin co sticky sidebar, chia section ro, co quick action mo landing that.
- Roadmap dang sync truc tiep tu `courses/levels`, giup tranh lech du lieu.

### Diem dang vuong

1. Editor dang hardcode rat manh.
- `src/app/admin/landing/page.js` dang gom gan nhu toan bo state, update helpers, nav, va form JSX trong 1 file lon.
- Muon them 1 field moi hien tai thuong phai sua:
  - `src/lib/landing-defaults.js`
  - `src/lib/landing-content.js`
  - `src/app/admin/landing/page.js`
  - `src/app/page.js`

2. Nhieu nhom noi dung lap lai chua co add/remove/reorder that su.
- `solution.pillars`
- `results.showcaseItems`
- `method.items`
- `commitment.items`
- `faq.items`
- Moi `footer.contactLinks` dang co add/remove dung nghia.

3. Preview dang yeu.
- Hien chi co nut mo landing that o tab moi.
- Khong co preview pane trong admin.
- Khong co desktop/mobile toggle.
- Khong co local preview cho thay doi chua luu.

4. Schema dang co dau hieu drift.
- Van con dau vet `painLabel`, `pricingLabel`, `pain`.
- Admin wording van con nhac `Roadmap & Pricing` trong khi public da bo pricing section.
- Dieu nay lam chi phi bao tri tang dan va de gay nham.

5. Mental model chua that su ro voi nguoi van hanh.
- Mot so text nam o section rieng, nhung item hanh dong lai lay tu `footer.contactLinks`.
- Roadmap ngoai landing co title/subtitle rieng, nhung admin hien chi coi la khoi sync read-only.

## Nguyen tac thiet ke cho ban nang cap

1. Khong lam CMS "tu do tuyet doi".
- Chi cho tuy bien trong pham vi block va field da dinh nghia.
- Muc tieu la giu duoc tinh on dinh cua landing design system.

2. Data model van uu tien 1 document JSON trong `landing_content`.
- Chua tach bang con cho tung section.
- Chi them metadata neu thuc su can cho preview/draft/publish.

3. Editor phai schema-driven dan dan.
- Giai doan dau co the van dung JSX cho nhung section phuc tap.
- Nhung field config, repeater config, help text, validation nen di vao schema chung.

4. Preview phai la mot phan cua editor, khong phai mot tab rieng.
- Muc tieu la "sua o ben trai, thay ket qua ben phai".

## Muc tieu san pham sau khi nang cap

### UX editor

- Nhanh hon de tim dung section can sua.
- Biet field nao dang hien o dau tren landing.
- De nhin ra thay doi truoc khi bam save.

### Kha nang tuy bien

- Them/bot item trong cac group lap lai.
- Ho tro reorder cho item quan trong.
- De them field moi bang schema config thay vi sua tay nhieu file.

### Kha nang review

- Co preview desktop/mobile trong admin.
- Co the jump tu editor sang dung section preview.
- Hien thi gan voi landing that, khong chi la mock box.

## Pham vi theo phase

### Phase 1 - Cleanup + Editor UX foundation

Muc tieu: sua nhung diem vo hinh nhung gay ma sat cao, chua doi kien truc lon.

Lam:
- Don dep schema/wording da loi thoi (`pricing`, `pain` remnants neu khong con dung).
- Doi label/noi dung giai thich trong admin cho khop landing public hien tai.
- Them scrollspy cho sidebar de active section di theo luc cuon.
- Them collapse/expand cho tung section.
- Them dirty state + badge `Chua luu`.
- Them section note ro hon: field nay hien o dau, anh huong mobile hay desktop.

Khong lam:
- Chua doi sang schema-driven hoan toan.
- Chua tao draft/publish.

### Phase 2 - Inline preview

Muc tieu: review landing that hon ngay trong admin.

Lam:
- Them preview pane ben phai o desktop.
- Them toggle `Desktop / Mobile`.
- Them action `Dong bo section` de click section ben trai thi preview nhay toi dung khoi.
- Ho tro refresh preview sau khi save.

Lua chon ky thuat uu tien:
- Bat dau bang iframe preview route de giong landing that nhat.
- Neu can preview thay doi chua luu, dung `postMessage` de day draft content vao preview frame.

### Phase 3 - Repeater editor

Muc tieu: bien cac nhom item lap lai thanh cau truc co them/bot/sap xep.

Lam:
- Tao component dung chung cho repeater.
- Ap dung truoc cho:
  - `solution.pillars`
  - `results.showcaseItems`
  - `faq.items`
  - `footer.contactLinks`
- Ho tro min/max item.
- Ho tro reorder len/xuong truoc, drag-drop de sau neu can.

### Phase 4 - Schema-driven editor

Muc tieu: giam chi phi khi them field moi.

Lam:
- Tao `landing-editor-schema.js` mo ta:
  - section id
  - field type
  - label
  - help text
  - validation
  - repeater rules
  - preview mapping
- Tach `FieldRenderer`, `RepeaterField`, `SectionCard`.
- Giam logic update path-specific trong `page.js`.

### Phase 5 - Draft / Publish workflow

Muc tieu: an toan hon khi nhieu nguoi cung chinh va khi can review.

Lam:
- Tach `draft` va `published`.
- Nut `Luu nhap`, `Preview`, `Publish`.
- Hien thi `last saved`, `published at`, `published by`.

Khong bat buoc cho dot dau neu team van chinh it nguoi.

## Kien truc de xuat

### Du lieu

- Van giu `landing_content` la nguon chinh.
- `normalizeLandingContent()` tiep tuc la gate de giu schema on dinh.
- Khi them schema-driven editor, khong bo normalize; chi thay doi cach render editor.

### UI components de xuat

- `src/components/admin/landing/LandingEditorShell.js`
- `src/components/admin/landing/LandingSectionNav.js`
- `src/components/admin/landing/LandingSectionCard.js`
- `src/components/admin/landing/FieldRenderer.js`
- `src/components/admin/landing/RepeaterField.js`
- `src/components/admin/landing/LandingPreviewPane.js`
- `src/lib/landing-editor-schema.js`

### Phan chia trach nhiem

- `src/lib/landing-defaults.js`
  - Chua default values.
- `src/lib/landing-content.js`
  - Chua normalize, fetch/save, schema gate.
- `src/lib/landing-editor-schema.js`
  - Chua config de render editor.
- `src/app/admin/landing/page.js`
  - Chua page state, fetch/save orchestration, khong chua qua nhieu field JSX nua.

## Risks va cach giam

1. Preview khong khop landing that.
- Uu tien render qua chinh layout/route that thay vi mock lai UI trong admin.

2. Schema-driven qua som de lam cham.
- Lam theo 2 buoc: cleanup + preview truoc, schema-driven sau.

3. Add/remove tu do lam vo layout public.
- Moi repeater deu co `min/max` va validation.
- Public renderer can tiep tuc filter item rong.

4. Drift giua admin va public tiep tuc lap lai.
- Moi thay doi landing public sau nay phai cham toi:
  - defaults
  - normalize
  - editor schema
  - public render

## Acceptance criteria

- Co preview desktop/mobile ngay trong `/admin/landing`.
- Sidebar active section theo cuon.
- It nhat 3 nhom repeater co add/remove/reorder that su.
- Admin wording va schema khop landing public hien tai.
- Them 1 field moi khong con can sua JSX o nhieu section khac nhau.

## Files du kien tac dong

- `src/app/admin/landing/page.js`
- `src/app/admin/admin.module.css`
- `src/lib/landing-content.js`
- `src/lib/landing-defaults.js`
- `src/app/page.js`
- `src/app/page.module.css`
- `src/lib/landing-editor-schema.js` (new)
- `src/components/admin/landing/*` (new)

## Verification

- `npm run lint`
- `npm run build`
- Browser:
  - `/admin/landing` scrollspy dung
  - preview desktop/mobile dung
  - save xong preview cap nhat
  - them/bot item o repeater khong vo layout
  - landing public van render dung khi item rong

## Thu tu thuc hien de xuat

1. Phase 1 - Cleanup + wording + scrollspy + collapse + dirty state
2. Phase 2 - Inline preview desktop/mobile
3. Phase 3 - Repeater editor cho 3-4 nhom dau tien
4. Phase 4 - Schema-driven refactor
5. Phase 5 - Draft/publish neu can

## Next step ngay sau doc nay

Bat dau Phase 1 voi muc tieu nho, ro:
- don schema drift (`pricing/pain` remnants)
- sua lai nav va section labels
- them scrollspy
- them collapse/expand section
- them dirty state o header va sidebar

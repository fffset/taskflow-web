# Taskflow Web

Enterprise-grade, multi-tenant task management arayüzü. Next.js 15 App Router ile geliştirilen, Taskflow API'ye bağlı frontend.

---

## Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Shadcn/ui (Nova preset) · TanStack Query · Zustand · React Hook Form · Zod · Axios · @dnd-kit · qrcode.react

---

## Architecture

```
Client (Browser)
      ↓
Next.js App Router
      ↓
Axios (httpOnly cookie ile)
      ↓
Taskflow API (localhost:8000)
```

**State yönetimi:**
- **Server state** → TanStack Query
- **Client state** → Zustand (auth durumu)
- **Form state** → React Hook Form + Zod

**Auth akışı:** httpOnly cookie tabanlı, 401'de otomatik `/auth/refresh`. Dashboard aktifken 13 dakikada bir arka plan refresh (`useAutoRefresh`). Refresh token rotation kaynaklı race condition, `services/api.ts`'teki paylaşılan `refreshTokens()` promise kilidiyle önleniyor — aynı anda sadece bir refresh isteği gider.

**2FA login akışı:** `AUTH_006` hatası login sayfasında yakalanıp 6 haneli kod ekranına geçiyor, `/auth/login/2fa` ile doğrulanıyor.

**Davet akışı:** `/invite/accept/[token]` sayfası `(dashboard)` grubunun dışında. Login/register `?redirect=` destekliyor. Backend, kabul eden kullanıcının email'inin davetteki email ile eşleştiğini doğruluyor.

**Kanban drag-drop:** `@dnd-kit`, optimistic update senkron blokta yapılıyor (flicker yok). Board sıralaması da `@dnd-kit/sortable` ile sürüklenebilir.

**Full-text search:** `Cmd+K` / `Ctrl+K` ile açılan arama modalı, 300ms debounce. Backend'de prefix matching (`kelime:*`) kullanılıyor — kullanıcı tam kelimeyi yazmadan da sonuç görür.

**404 / Not Found akışı:** TanStack Query hataları otomatik olarak Next.js error boundary'sine düşmez (sadece `isError` set eder). Bu yüzden `workspaceId`/`projectId`/`boardId` geçersiz olduğunda ilgili sayfalar (`[workspaceId]/layout.tsx`, `boards/page.tsx`, `boards/[boardId]/page.tsx`) `isError` durumunu kontrol edip Next.js'in `notFound()` fonksiyonunu çağırıyor — böylece boş bir sayfa kabuğu yerine gerçek 404 ekranı gösteriliyor.

**Error Boundary:** `app/error.tsx` ve `app/not-found.tsx` Next.js'in zorunlu dosya konvansiyonu (bu isim/konumda olmalı), ama içerikleri `components/common/error-state/` ve `components/common/not-found-state/`'ten geliyor — böylece ileride segment-bazlı özel error sayfaları eklenirse kod tekrarı olmaz.

**Mobil Responsive:** Sidebar `md` breakpoint altında gizlenip Shadcn `Sheet` (kayar panel) ile hamburger menüsünden açılıyor. `Sidebar` component'i kendi genişlik/pozisyon değerlerini taşımıyor — bu sorumluluk `WorkspaceShell`'deki wrapper'larda, böylece hem masaüstü sabit sidebar hem mobil Sheet aynı component'i sorunsuz kullanabiliyor.

---

## Project Structure

```
src/
  app/
    (auth)/
      login/page.tsx                                → 2FA adımını içerir
      register/page.tsx
      layout.tsx
    (dashboard)/
      workspaces/
        page.tsx
        [workspaceId]/
          layout.tsx                                → WorkspaceShell + 404 kontrolü
          settings/page.tsx                          → workspace ayarları + üye yönetimi
          projects/
            page.tsx
            [projectId]/
              settings/page.tsx
              boards/
                page.tsx                             → 404 kontrolü + sürükle-bırak sıralama
                [boardId]/
                  page.tsx                           → kanban board + 404 kontrolü
                  statuses/page.tsx
      settings/
        profile/page.tsx                             → profil, şifre, 2FA, hesap silme
      layout.tsx
    invite/
      accept/[token]/page.tsx
    error.tsx                                        → Next.js konvansiyonu, ErrorState'i sarar
    not-found.tsx                                    → Next.js konvansiyonu, NotFoundState'i sarar
    layout.tsx
    globals.css

  components/
    ui/
    common/
      empty-state/empty-state.tsx
      loading/list-skeleton.tsx
      error-state/error-state.tsx
      not-found-state/not-found-state.tsx
      avatar/
    layout/                 → sidebar (responsive), header, breadcrumb, user-menu, workspace-shell
    board/
    task/                   → task-detail-modal, task-search-dialog
    workspace/              → member-manager
    project/                → status-manager (reusable)
    label/                  → label-manager
    user/                   → two-factor-setup

  hooks/                    → use-auth, use-workspace, use-project, use-board, use-task, use-label, use-user, use-2fa

  services/
    api.ts                  → axios instance + paylaşılan refresh kilidi
    auth/ workspace/ project/ board/ task/ label/ user/

  store/
    auth.store.ts

  providers/
    query-provider.tsx

  lib/
    utils.ts
    validators/

  types/
    api.types.ts
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Development

```bash
npm install
npm run dev
# http://localhost:3000
```

Backend'in ayrıca çalışıyor olması gerekir (`taskflow-api`, `localhost:8000`).

---

## Bilinen Notlar / Sorun Giderme

- **"Modal içinde dropdown açıkken tıklayınca modal kapanıyor":** `radix-ui@1.6.4`'e güncellemek çözdü (Select/Popover/Dialog dismissable layer senkronizasyon bug'ı).
- **"Sekme uzun süre arkada kalınca login'e atıyor":** Refresh token rotation race condition'ıydı, paylaşılan `refreshTokens()` kilidiyle çözüldü.
- **"Geçersiz URL'de boş sayfa kabuğu görünüyor":** TanStack Query hataları otomatik error boundary'ye düşmüyor — kritik sayfalarda `isError` → `notFound()` kontrolü eklendi.
- **Next.js dev server "heap out of memory" çökmesi:** `rm -rf .next && npm run dev`.

---

## Roadmap

### Faz 1 — Core Flows ✅ TAMAMLANDI

| # | Özellik | Durum |
|---|---------|-------|
| 1.1–1.9 | Kurulum, mimari, auth altyapısı, dashboard guard | ✅ |
| 1.10–1.20 | Workspace/proje/board/task CRUD, kanban, drag-drop, task detay modalı | ✅ |
| 1.21–1.25 | Sidebar, breadcrumb, user menu, toast, root yönlendirme | ✅ |
| 1.26–1.34 | Workspace/proje/board güncelleme-silme, custom status, label, assignee | ✅ |
| 1.35–1.37 | Profil, şifre değiştirme, hesap silme | ✅ |
| 1.38–1.43 | Üye yönetimi — davet, bekleyen davetler, rol, çıkarma, email doğrulama | ✅ |
| 1.44 | 2FA — QR kod kurulum + login entegrasyonu | ✅ |
| 1.45 | Task arama — Cmd+K, debounce, prefix search | ✅ |
| 1.46 | Empty state / loading skeleton tutarlılığı (`EmptyState`, `PageSkeleton`) | ✅ |
| 1.47 | Error boundary + 404 handling (`error.tsx`, `not-found.tsx`, `notFound()` kontrolleri) | ✅ |
| 1.48 | Responsive — mobil sidebar (Sheet + hamburger) | ✅ |

---

### Faz 2 — Collaboration UI ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 2.1 | Task yorum bölümü | ⬜ |
| 2.2 | @mention autocomplete | ⬜ |
| 2.3 | Task aktivite akışı | ⬜ |
| 2.4 | WebSocket — real-time task güncellemeleri | ⬜ |
| 2.5 | In-app bildirim merkezi | ⬜ |
| 2.6 | Bildirim dropdown'u | ⬜ |
| 2.7 | Real-time kanban senkronizasyonu | ⬜ |
| 2.8 | Email bildirim tercihleri | ⬜ |
| 2.9 | Webhook ayarları UI | ⬜ |

---

### Faz 3 — Arama, Filtreleme, Görünümler ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 3.1 | Task filtreleme (assignee, priority, label, status) | ⬜ |
| 3.2 | Liste görünümü | ⬜ |
| 3.3 | Sıralama seçenekleri | ⬜ |
| 3.4 | Kayıtlı filtre/görünüm | ⬜ |
| 3.5 | Sub-task ağacı görünümü | ⬜ |
| 3.6 | Global arama (workspace/proje/task birleşik) | ⬜ |

---

### Faz 4 — AI Entegrasyonu ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 4.1 | AI Task Asistanı | ⬜ |
| 4.2 | Sprint planlama asistanı | ⬜ |
| 4.3 | RAG döküman yükleme | ⬜ |
| 4.4 | AI destekli semantic search | ⬜ |
| 4.5 | Anomali tespiti bildirimleri | ⬜ |

---

### Faz 5 — Analytics & Raporlama ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 5.1 | Sprint istatistikleri dashboard'u | ⬜ |
| 5.2 | Kullanıcı performans grafikleri | ⬜ |
| 5.3 | Workspace analytics sayfası | ⬜ |
| 5.4 | PDF/CSV export | ⬜ |
| 5.5 | Recharts entegrasyonu | ⬜ |

---

### Faz 6 — Production Hazırlığı ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 6.1 | Vercel deploy | ⬜ |
| 6.2 | SEO — metadata, OpenGraph | ⬜ |
| 6.3 | Performans optimizasyonu | ⬜ |
| 6.4 | E2E testler (Playwright) | ⬜ |
| 6.5 | Erişilebilirlik (a11y) | ⬜ |
| 6.6 | Dark mode | ⬜ |
| 6.7 | i18n (next-intl, TR/EN) | ⬜ |
| 6.8 | React Native mobil uygulama | ⬜ |

---

## Bekleyen İyileştirmeler (Faz'a bağlanmamış)

| # | İstek | Not |
|---|-------|-----|
| N.1 | Label picker'da arama + bulunamazsa direkt oluşturma | `cmdk` (Command component) gerekiyor |
| N.2 | Tüm dropdown'larda arama kutusu | Aynı `cmdk` altyapısı |
| N.3 | Çoklu assignee | **Backend schema değişikliği** — `TaskAssignee` many-to-many tablosu |

---

## CV Bullet Points

```
Taskflow Web — Enterprise Task Management UI
Next.js 15 · TypeScript · TanStack Query · Zustand · Shadcn/ui · Tailwind · @dnd-kit

- App Router tabanlı, feature-driven mimari
- httpOnly cookie tabanlı auth, race-condition korumalı token refresh
- 2FA (TOTP) destekli giriş akışı, QR kod kurulum
- Sürükle-bırak kanban board, optimistic update ile flicker-free UX
- Rol tabanlı workspace üye yönetimi, email-doğrulamalı davet akışı
- Full-text arama (Cmd+K, prefix matching), custom status/label yönetimi
- Kapsamlı 404/error handling, responsive mobil sidebar
- AI destekli task asistanı ve RAG tabanlı doküman arama (planlanan)
```
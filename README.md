# Taskflow Web

Enterprise-grade, multi-tenant task management arayüzü. Next.js 15 App Router ile geliştirilen, Taskflow API'ye bağlı frontend.

---

## Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Shadcn/ui (Nova preset) · TanStack Query · Zustand · React Hook Form · Zod · Axios

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
- **Server state** → TanStack Query (workspace, project, board, task verileri)
- **Client state** → Zustand (auth durumu, UI tercihleri)
- **Form state** → React Hook Form + Zod validasyonu

**Auth akışı:** httpOnly cookie tabanlı. Axios `withCredentials: true` ile her istekte cookie otomatik gönderilir. 401 alınca interceptor otomatik `/auth/refresh` dener (login/register/refresh endpoint'leri hariç).

---

## Project Structure

```
src/
  app/
    (auth)/
      login/
        page.tsx
      register/
        page.tsx
      layout.tsx
    (dashboard)/
      workspaces/
        page.tsx                                    → workspace listesi
        [workspaceId]/
          projects/
            page.tsx                                → proje listesi
            [projectId]/
              boards/
                page.tsx                             → board listesi
                [boardId]/
                  page.tsx                           → kanban board
      settings/
      layout.tsx                                     → auth guard
    layout.tsx                                        → root layout
    globals.css

  components/
    ui/                     → Shadcn bileşenleri (dokunulmaz)
    common/                 → paylaşılan genel bileşenler
    layout/                 → header, sidebar, breadcrumb
    board/                  → kanban bileşenleri
    task/                   → task card, task detail, task form
    workspace/
    project/

  hooks/                    → custom hooks (use-auth, use-workspace, use-task ...)

  services/                 → API katmanı, component'lar direkt fetch yapmaz
    api.ts                  → axios instance + interceptor
    auth/
      auth.service.ts
      auth.types.ts
    workspace/
    project/
    board/
    task/
    label/

  store/                    → Zustand store'ları
    auth.store.ts

  providers/
    query-provider.tsx      → TanStack Query provider

  lib/
    utils.ts                → cn() helper
    validators/              → Zod şemaları

  types/
    api.types.ts             → global API tipleri (ApiError vs)
```

**Mimari prensipler:**
- Her feature kendi klasöründe — servis, tip ve hook birbirine yakın
- Component'lar API'ye direkt bağlanmaz, her zaman `services/` üzerinden
- Server state asla Zustand'da tutulmaz, TanStack Query cache'i yeterli
- Zod şemaları hem form validasyonu hem tip inference için kullanılır

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

## Roadmap

---

### Faz 1 — Core Flows 🚧

Temel CRUD akışları, auth, routing altyapısı.

| # | Özellik | Durum |
|---|---------|-------|
| 1.1 | Next.js 15 kurulum — App Router, Tailwind, TypeScript | ✅ |
| 1.2 | Shadcn/ui kurulumu (Nova preset) | ✅ |
| 1.3 | Klasör mimarisi — services/hooks/store/providers ayrımı | ✅ |
| 1.4 | Axios instance + 401 refresh interceptor | ✅ |
| 1.5 | Zustand auth store | ✅ |
| 1.6 | TanStack Query provider | ✅ |
| 1.7 | Login sayfası + form validasyonu (Zod) | ✅ |
| 1.8 | Register sayfası + form validasyonu | ✅ |
| 1.9 | Dashboard layout — auth guard (401 → /login yönlendirme) | ✅ |
| 1.10 | Workspace listesi + oluşturma modalı | ✅ |
| 1.11 | Project listesi + oluşturma modalı (status seçimi ile) | ✅ |
| 1.12 | Board listesi + oluşturma modalı | ✅ |
| 1.13 | Kanban board görünümü — status bazlı kolonlar | ✅ |
| 1.14 | Task oluşturma modalı (başlık, açıklama, status, öncelik) | ✅ |
| 1.15 | Task kartı — öncelik badge, label, assignee, due date, alt sayaçlar | ✅ |
| 1.16 | Global tema/font düzeltmesi (Geist font entegrasyonu) | ✅ |
| 1.17 | Sürükle-bırak — task'ı kolonlar arası taşıma (`/tasks/:id/move`) | ⬜ |
| 1.18 | Task detay sayfası/modalı — açıklama, sub-task, yorum, label yönetimi | ⬜ |
| 1.19 | Task güncelleme — inline status/priority/assignee değişimi | ⬜ |
| 1.20 | Task silme — onay modalı ile | ⬜ |
| 1.21 | Board sıralama — sürükle-bırak ile reorder | ⬜ |
| 1.22 | Sidebar/navigation — workspace ve proje arası hızlı geçiş | ⬜ |
| 1.23 | Breadcrumb — workspace > proje > board hiyerarşisi | ⬜ |
| 1.24 | Kullanıcı menüsü — profil, şifre değiştir, çıkış yap | ⬜ |
| 1.25 | Empty state ve loading skeleton'ların tüm sayfalarda tutarlılığı | ⬜ |
| 1.26 | Error boundary + toast bildirimleri (başarı/hata) | ⬜ |
| 1.27 | Responsive düzenlemeler — mobil kanban görünümü | ⬜ |

---

### Faz 2 — Workspace Yönetimi ⬜

Workspace ayarları, üye yönetimi, davet akışı.

| # | Özellik | Durum |
|---|---------|-------|
| 2.1 | Workspace ayarları sayfası — isim, açıklama, logo güncelleme | ⬜ |
| 2.2 | Üye listesi + rol gösterimi | ⬜ |
| 2.3 | Üye davet etme formu (email + rol seçimi) | ⬜ |
| 2.4 | Davet kabul sayfası (`/invite/accept/:token`) | ⬜ |
| 2.5 | Üye rolü değiştirme (OWNER/ADMIN yetkisiyle) | ⬜ |
| 2.6 | Üye çıkarma | ⬜ |
| 2.7 | Workspace silme — çift onaylı, geri alınamaz uyarısı | ⬜ |
| 2.8 | Project status yönetimi — custom status ekle/düzenle/sil | ⬜ |
| 2.9 | Task status yönetimi — custom status ekle/düzenle/sil | ⬜ |
| 2.10 | 2FA aktifleştirme akışı — QR kod gösterimi + doğrulama | ⬜ |

---

### Faz 3 — Collaboration UI ⬜

Backend Faz 2 (yorum, bildirim, WebSocket) ile birebir entegrasyon.

| # | Özellik | Durum |
|---|---------|-------|
| 3.1 | Task yorum bölümü — ekle/düzenle/sil | ⬜ |
| 3.2 | @mention — kullanıcı etiketleme autocomplete | ⬜ |
| 3.3 | Task aktivite akışı görünümü | ⬜ |
| 3.4 | WebSocket bağlantısı — real-time task güncellemeleri | ⬜ |
| 3.5 | In-app bildirim merkezi — okundu/okunmadı | ⬜ |
| 3.6 | Bildirim dropdown'u — header'da badge sayacı | ⬜ |
| 3.7 | Real-time kanban senkronizasyonu (başka kullanıcı task taşıyınca anlık güncelle) | ⬜ |
| 3.8 | Label yönetimi UI — proje bazlı label oluşturma/silme | ⬜ |
| 3.9 | Task'a label ekleme/kaldırma (çoklu seçim) | ⬜ |

---

### Faz 4 — Arama, Filtreleme, Görünümler ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 4.1 | Global task arama (full-text search entegrasyonu) | ⬜ |
| 4.2 | Task filtreleme — assignee, priority, label, status bazlı | ⬜ |
| 4.3 | Liste görünümü — kanban'a alternatif tablo görünümü | ⬜ |
| 4.4 | Sıralama seçenekleri — deadline, priority, oluşturulma tarihi | ⬜ |
| 4.5 | Kayıtlı filtre/görünüm (view) desteği | ⬜ |
| 4.6 | Sub-task ağacı görünümü | ⬜ |

---

### Faz 5 — AI Entegrasyonu ⬜

Backend Faz 3 (Claude API, RAG) ile entegrasyon.

| # | Özellik | Durum |
|---|---------|-------|
| 5.1 | AI Task Asistanı — başlıktan açıklama/alt görev önerisi UI'ı | ⬜ |
| 5.2 | Sprint planlama asistanı arayüzü | ⬜ |
| 5.3 | RAG döküman yükleme arayüzü | ⬜ |
| 5.4 | AI destekli arama (semantic search) | ⬜ |
| 5.5 | Anomali tespiti bildirimleri — dashboard'da gösterim | ⬜ |

---

### Faz 6 — Analytics & Raporlama ⬜

Backend Faz 3 (big data pipeline) ile entegrasyon.

| # | Özellik | Durum |
|---|---------|-------|
| 6.1 | Sprint istatistikleri dashboard'u | ⬜ |
| 6.2 | Kullanıcı performans grafikleri | ⬜ |
| 6.3 | Workspace analytics sayfası | ⬜ |
| 6.4 | PDF/CSV export butonları | ⬜ |
| 6.5 | Grafik kütüphanesi entegrasyonu (recharts) | ⬜ |

---

### Faz 7 — Production Hazırlığı ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 7.1 | Vercel deploy | ⬜ |
| 7.2 | SEO — metadata, OpenGraph | ⬜ |
| 7.3 | Performans — lazy loading, image optimizasyonu | ⬜ |
| 7.4 | E2E testler (Playwright) — auth, kanban akışı | ⬜ |
| 7.5 | Erişilebilirlik (a11y) denetimi | ⬜ |
| 7.6 | Dark mode desteği | ⬜ |

---

## CV Bullet Points

```
Taskflow Web — Enterprise Task Management UI
Next.js 15 · TypeScript · TanStack Query · Zustand · Shadcn/ui · Tailwind

- App Router tabanlı, feature-driven mimari (services/hooks/store ayrımı)
- httpOnly cookie tabanlı auth, otomatik token refresh interceptor'ı
- Server state (TanStack Query) ve client state (Zustand) net ayrımı
- Zod ile uçtan uca tip güvenli form validasyonu
- Kanban board, sürükle-bırak task yönetimi, real-time senkronizasyon
- AI destekli task asistanı ve RAG tabanlı doküman arama entegrasyonu
```
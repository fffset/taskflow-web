# Taskflow Web

Enterprise-grade, multi-tenant task management arayüzü. Next.js 15 App Router ile geliştirilen, Taskflow API'ye bağlı frontend.

---

## Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Shadcn/ui (Nova preset) · TanStack Query · Zustand · React Hook Form · Zod · Axios · @dnd-kit

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

**Auth akışı:** httpOnly cookie tabanlı. Axios `withCredentials: true` ile her istekte cookie otomatik gönderilir. 401 alınca interceptor otomatik `/auth/refresh` dener (login/register/refresh endpoint'leri hariç). Dashboard'da aktifken 13 dakikada bir arka planda otomatik refresh yapılır (`useAutoRefresh`), 15 dakikalık access token süresi asla dolmaz.

**Kanban drag-drop:** `@dnd-kit` ile task'lar kolonlar arası sürüklenebilir, board'lar sıralanabilir. Optimistic update pattern'i kullanılıyor — `queryClient.setQueryData` çağrısı, state güncellemesiyle aynı senkron blokta yapılır (React 18+ otomatik batching) ki drag-drop sırasında "eski konuma sıçrama" (flicker) oluşmasın.

---

## Project Structure

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
      layout.tsx
    (dashboard)/
      workspaces/
        page.tsx                                    → workspace listesi
        [workspaceId]/
          layout.tsx                                → WorkspaceShell (sidebar+header) sarmalayıcı
          settings/page.tsx                          → workspace ayarları (güncelle/sil)
          projects/
            page.tsx                                → proje listesi
            [projectId]/
              settings/page.tsx                      → proje ayarları + status + label yönetimi
              boards/
                page.tsx                             → board listesi (sürükle-bırak sıralama)
                [boardId]/
                  page.tsx                           → kanban board
                  statuses/page.tsx                  → task status yönetimi
      settings/
        profile/                                     → kullanıcı profili, şifre değiştir
      layout.tsx                                        → auth guard + auto-refresh
    invite/
      accept/[token]/page.tsx                        → davet kabul sayfası
    layout.tsx                                        → root layout
    globals.css

  components/
    ui/                     → Shadcn bileşenleri (dokunulmaz)
    common/                 → paylaşılan genel bileşenler
    layout/                 → sidebar, header, breadcrumb, user-menu, workspace-shell
    board/                  → kanban bileşenleri
    task/                   → task-detail-modal (TaskDetailModal + TaskDetailForm ayrımı)
    workspace/              → workspace ayar formları, üye listesi
    project/                → status-manager (reusable, hem project hem task status'ta kullanılıyor)
    label/                  → label-manager

  hooks/                    → custom hooks (use-auth, use-workspace, use-project, use-board, use-task, use-label)

  services/                 → API katmanı
    api.ts                  → axios instance + interceptor
    auth/
    workspace/
    project/
    board/
    task/
    label/

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

**Mimari prensipler:**
- Her feature kendi klasöründe — servis, tip ve hook birbirine yakın
- Component'lar API'ye direkt bağlanmaz, her zaman `services/` üzerinden
- Server state asla Zustand'da tutulmaz, TanStack Query cache'i yeterli
- Zod şemaları hem form validasyonu hem tip inference için kullanılır
- Yükleme (loading) gate'i olan component'ler, veri kesin geldiğinde mount olacak ayrı bir alt component'e bölünür (örn. `TaskDetailModal` → `TaskDetailForm`) — bu, `useState(data.field)` gibi initial state'lerin veri gelmeden önce kilitlenip boş kalmasını engeller

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

**"Modal içinde dropdown açıkken tıklayınca modal kapanıyor" hatası:** Bu, `radix-ui` paketinin bazı versiyonlarında (Select/Popover/Dialog arasındaki "dismissable layer" senkronizasyonuyla ilgili) bilinen bir bug'dı. `radix-ui@1.6.4`'e güncellemek sorunu çözdü. Eğer tekrar ortaya çıkarsa önce `npm install radix-ui@latest` dene.

**Next.js dev server "heap out of memory" çökmesi:** Uzun süre açık kalan dev server'da bazen oluşabiliyor. `.next` klasörünü silip yeniden başlatmak genelde çözüyor: `rm -rf .next && npm run dev`.

---

## Roadmap

Bu roadmap, backend'deki (`taskflow-api`) faz numaralandırmasıyla senkron tutulur.

---

### Faz 1 — Core Flows ✅

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
| 1.9 | Dashboard layout — auth guard + auto-refresh (13dk) | ✅ |
| 1.10 | Workspace listesi + oluşturma modalı | ✅ |
| 1.11 | Project listesi + oluşturma modalı (status seçimi ile) | ✅ |
| 1.12 | Board listesi + oluşturma modalı | ✅ |
| 1.13 | Kanban board görünümü — status bazlı kolonlar | ✅ |
| 1.14 | Task oluşturma modalı (başlık, açıklama, status, öncelik) | ✅ |
| 1.15 | Task kartı — öncelik badge, label, assignee, due date, alt sayaçlar | ✅ |
| 1.16 | Global tema/font düzeltmesi (Geist font entegrasyonu) | ✅ |
| 1.17 | Sürükle-bırak — task'ı kolonlar arası taşıma (@dnd-kit) | ✅ |
| 1.18 | Task detay modalı — inline başlık/açıklama, status/priority/due date, sub-task listesi | ✅ |
| 1.19 | Task güncelleme — inline status/priority/due date değişimi | ✅ |
| 1.20 | Task silme — AlertDialog onayı ile | ✅ |
| 1.21 | Sidebar — workspace switcher + proje navigasyonu | ✅ |
| 1.22 | Breadcrumb — workspace > proje > board hiyerarşisi | ✅ |
| 1.23 | Kullanıcı menüsü — dropdown (profil, ayarlar, çıkış) | ✅ |
| 1.24 | Toast bildirimleri (sonner) — task CRUD işlemlerinde başarı/hata | ✅ |
| 1.25 | Root sayfa yönlendirmesi (`/` → auth durumuna göre login/workspaces) | ✅ |
| 1.26 | Workspace güncelleme/silme UI'ı (ayarlar sayfası) | ✅ |
| 1.27 | Project güncelleme/silme UI'ı | ✅ |
| 1.28 | Project custom status yönetimi UI'ı (ekle/düzenle/sil) | ✅ |
| 1.29 | Board güncelleme/silme UI'ı | ✅ |
| 1.30 | Board sıralama — sürükle-bırak ile reorder (optimistic update) | ✅ |
| 1.31 | Task custom status yönetimi UI'ı (ekle/düzenle/sil) | ✅ |
| 1.32 | Label yönetimi UI — proje bazlı label oluşturma/düzenleme/silme | ✅ |
| 1.33 | Task'a label ekleme/kaldırma (task detail modalı içinde) | ✅ |
| 1.34 | Task assignee seçimi — workspace üyeleri arasından atama | ✅ |
| 1.35 | Kullanıcı profil sayfası — isim/avatar güncelleme | ⬜ |
| 1.36 | Şifre değiştirme formu — mevcut şifre doğrulama ile | ⬜ |
| 1.37 | Hesap silme — çift onaylı akış | ⬜ |
| 1.38 | Workspace üye listesi + rol gösterimi | ⬜ |
| 1.39 | Üye davet formu (email + rol seçimi) | ⬜ |
| 1.40 | Davet kabul sayfası (`/invite/accept/:token`) | ⬜ |
| 1.41 | Üye rolü değiştirme (OWNER/ADMIN yetkisiyle) | ⬜ |
| 1.42 | Üye çıkarma | ⬜ |
| 1.43 | Workspace silme — çift onaylı, geri alınamaz uyarısı | ⬜ |
| 1.44 | 2FA aktifleştirme akışı — QR kod gösterimi + doğrulama | ⬜ |
| 1.45 | Task arama UI'ı — full-text search entegrasyonu | ⬜ |
| 1.46 | Empty state ve loading skeleton tutarlılığı — tüm sayfalarda aynı pattern | ⬜ |
| 1.47 | Error boundary — beklenmeyen hatalar için genel yakalama sayfası | ⬜ |
| 1.48 | Responsive düzenlemeler — mobil kanban ve sidebar görünümü | ⬜ |

---

### Faz 2 — Collaboration UI ⬜

Backend Faz 2 (yorum, bildirim, WebSocket, RabbitMQ) ile birebir entegrasyon.

| # | Özellik | Durum |
|---|---------|-------|
| 2.1 | Task yorum bölümü — ekle/düzenle/sil | ⬜ |
| 2.2 | Mention sistemi — @kullanıcı etiketleme autocomplete | ⬜ |
| 2.3 | Task aktivite akışı görünümü | ⬜ |
| 2.4 | WebSocket bağlantısı — real-time task güncellemeleri | ⬜ |
| 2.5 | In-app bildirim merkezi — okundu/okunmadı | ⬜ |
| 2.6 | Bildirim dropdown'u — header'da badge sayacı | ⬜ |
| 2.7 | Real-time kanban senkronizasyonu (başka kullanıcı task taşıyınca anlık güncelle) | ⬜ |
| 2.8 | Email bildirim tercihleri — kullanıcı ayarlarında aç/kapa | ⬜ |
| 2.9 | Webhook ayarları UI — Slack/Teams entegrasyon formu | ⬜ |

---

### Faz 3 — Arama, Filtreleme, Görünümler ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 3.1 | Task filtreleme — assignee, priority, label, status bazlı | ⬜ |
| 3.2 | Liste görünümü — kanban'a alternatif tablo görünümü | ⬜ |
| 3.3 | Sıralama seçenekleri — deadline, priority, oluşturulma tarihi | ⬜ |
| 3.4 | Kayıtlı filtre/görünüm (view) desteği | ⬜ |
| 3.5 | Sub-task ağacı görünümü — detaylı hiyerarşi | ⬜ |
| 3.6 | Global arama — workspace/proje/task birleşik arama | ⬜ |

---

### Faz 4 — AI Entegrasyonu ⬜

Backend Faz 3 (Claude API, RAG) ile entegrasyon.

| # | Özellik | Durum |
|---|---------|-------|
| 4.1 | AI Task Asistanı — başlıktan açıklama/alt görev önerisi UI'ı | ⬜ |
| 4.2 | Sprint planlama asistanı arayüzü | ⬜ |
| 4.3 | RAG döküman yükleme arayüzü | ⬜ |
| 4.4 | AI destekli arama (semantic search) | ⬜ |
| 4.5 | Anomali tespiti bildirimleri — dashboard'da gösterim | ⬜ |

---

### Faz 5 — Analytics & Raporlama ⬜

Backend Faz 3 (big data pipeline) ile entegrasyon.

| # | Özellik | Durum |
|---|---------|-------|
| 5.1 | Sprint istatistikleri dashboard'u | ⬜ |
| 5.2 | Kullanıcı performans grafikleri | ⬜ |
| 5.3 | Workspace analytics sayfası | ⬜ |
| 5.4 | PDF/CSV export butonları | ⬜ |
| 5.5 | Grafik kütüphanesi entegrasyonu (recharts) | ⬜ |

---

### Faz 6 — Production Hazırlığı ⬜

| # | Özellik | Durum |
|---|---------|-------|
| 6.1 | Vercel deploy | ⬜ |
| 6.2 | SEO — metadata, OpenGraph | ⬜ |
| 6.3 | Performans — lazy loading, image optimizasyonu | ⬜ |
| 6.4 | E2E testler (Playwright) — auth, kanban akışı | ⬜ |
| 6.5 | Erişilebilirlik (a11y) denetimi | ⬜ |
| 6.6 | Dark mode desteği | ⬜ |
| 6.7 | i18n — çoklu dil desteği (next-intl, TR/EN). Tüm hardcoded metinleri messages/ altına taşı | ⬜ |
| 6.8 | React Native mobil uygulama — services/hooks/store katmanları paylaşılacak, sadece UI yeniden yazılacak, auth header-token tabanlı olacak (backend zaten destekliyor) | ⬜ |

---

## Bekleyen İyileştirmeler (Faz'a bağlanmamış, ileride ele alınacak)

Kullanıcı geri bildirimiyle biriken, henüz hangi faza dahil edileceği netleşmemiş işler:

| # | İstek | Not |
|---|-------|-----|
| N.1 | Label picker'da arama + aranan etiket bulunamazsa listeden direkt yeni etiket oluşturabilme (renk otomatik/rastgele atanabilir) | `cmdk` (Command component) ile combobox yapısına geçiş gerekiyor |
| N.2 | Tüm dropdown'larda (Status, Priority, Assignee) arama kutusu olması | Aynı `cmdk` altyapısı N.1 ile birlikte kullanılabilir |
| N.3 | Task'a birden fazla kişi assign edebilme (çoklu assignee) | **Backend schema değişikliği gerektiriyor** — şu an `Task.assigneeId` tekil bir alan; çoklu kişi için ayrı bir ara tablo (`TaskAssignee`, many-to-many) tasarlanmalı. Frontend işine başlamadan önce backend'de bu karar netleşmeli |

---

## CV Bullet Points

```
Taskflow Web — Enterprise Task Management UI
Next.js 15 · TypeScript · TanStack Query · Zustand · Shadcn/ui · Tailwind · @dnd-kit

- App Router tabanlı, feature-driven mimari (services/hooks/store ayrımı)
- httpOnly cookie tabanlı auth, otomatik token refresh interceptor'ı + arka plan yenileme
- Server state (TanStack Query) ve client state (Zustand) net ayrımı
- Zod ile uçtan uca tip güvenli form validasyonu
- Sürükle-bırak kanban board, optimistic update ile akıcı UX
- Workspace/proje/görev CRUD akışları, custom status ve label yönetimi
- Rol tabanlı üye yönetimi (planlanan)
- AI destekli task asistanı ve RAG tabanlı doküman arama entegrasyonu (planlanan)
```
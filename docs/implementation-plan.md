# Ideabank — Implementation Plan

Status: draft · Dibuat 2026-10-26 · Basis: v0.2.0 (`4749c7c`)
Cakupan: 4 fase (≈4 minggu, 1 developer + AI coding) sesuai roadmap Feature Development Plan.

## 0. Kondisi saat ini & gap yang harus ditutup duluan

Hasil audit kode saat plan ini ditulis:

| #   | Gap                                                                                                                                                                | Dampak                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| G1  | **Posisi node tidak tersimpan di DB.** `Idea` tidak punya kolom `x`/`y`; `GET /api/mindmap` tidak mengirim `position`                                              | Autosave/undo mustahil; layout acak tiap reload               |
| G2  | **Dua store Zustand**: `src/store/mindmap.ts` (dead code) & `src/hooks/useMindmapStore.ts` (dipakai)                                                               | Bingung sumber kebenaran; store lama harus dihapus            |
| G3  | **MindmapCanvas menulis ke store saat render** (`storeSetNodes(filteredNodes)` di body component)                                                                  | Anti-pattern React; efek samping di fase render               |
| G4  | **Route AI tidak konsisten**: `expand` punya provider dispatch, `connect`/`summarize` tidak; `connect`/`summarize` punya bug `OPENAI_API_KEY ?? ANTHROPIC_API_KEY` | AI connect/summarize pasti gagal saat `AI_PROVIDER=claude`    |
| G5  | **Tidak ada timeout, validasi Zod, atau retry** di semua route AI; JSON parse mentah                                                                               | Gantung saat API lambat; output LLM invalid → 500             |
| G6  | **Nol test** meski Vitest sudah terpasang                                                                                                                          | Tidak ada jaring pengaman untuk refactor besar di Fase 1–2    |
| G7  | Relasi hanya `parent \| related \| causes \| inspires`                                                                                                             | Roadmap butuh `contradicts, depends_on, supports, implements` |

**Prinsip desain untuk seluruh plan:**

- Hasil AI **selalu** lewat modal review dengan checkbox (pattern `AiExpandModal` yang sudah ada) — AI tidak pernah menulis langsung ke graph.
- Ide yang dibuat dari AI/inbox masuk dengan `status: "inbox"` (draft), pengguna yang mempromosikan.
- Tidak menambah dependency besar tanpa perlu. Stack tetap: Next.js 14, React Flow, Zustand, SWR, Prisma, Zod.

---

## Fase 0 — Prasyarat (1–2 hari)

Fondasi yang dibutuhkan semua fase lain. Selesai = PR mergeable.

### 0.1 Schema: posisi + status

`prisma/schema.prisma`:

```prisma
enum IdeaStatus {
  inbox
  exploring
  validated
  archived
}

model Idea {
  // ... kolom yang ada
  x      Float      @default(0)
  y      Float      @default(0)
  status IdeaStatus @default(inbox)
}
```

- Ganti `db:push` dengan `prisma migrate dev` mulai sekarang (discipline migration, item §8 roadmap).
- Update `src/lib/types.ts` (tambah `x, y, status` ke `Idea`), `validate.ts` (`CreateIdeaSchema`/`UpdateIdeaSchema` + `IdeaStatusSchema`), `GET /api/mindmap` mengirim `position: { x, y }`.

**Acceptance:** `npm run db:migrate` clean; graph ter-load dengan posisi konsisten antar reload (posisi awal = hasil auto-layout, sekali diset).

### 0.2 Bersihkan store

- Hapus `src/store/mindmap.ts`.
- `MindmapCanvas`: hapus penulisan store di render (G3); filter cukup lokal, sinkronisasi via `useEffect` bila component lain memang butuh.

### 0.3 Modul AI bersama — `src/lib/ai.ts`

Satu-satunya tempat bicara ke LLM:

```ts
aiComplete({ prompt, system, schema: ZodSchema, maxTokens })
// - dispatch provider (openai | claude) dari AI_PROVIDER + key yang benar
// - AbortController, timeout 30s
// - retry 1x hanya untuk error jaringan/5xx
// - parse + safeParse Zod; gagal → AiOutputError (bukan 500 generik)
// - log latency + token usage via pino (input untuk Fase 3 pengukuran)
```

Refactor `ai/expand`, `ai/connect`, `ai/summarize` memakai modul ini (memperbaiki G4, G5). Tambah `?dryRun` tidak perlu — mock mode (tanpa API key) dipertahankan untuk dev.

**Acceptance:** test unit `ai.ts` (mock fetch): timeout, retry, parse gagal, provider dispatch benar. `AI_PROVIDER=claude` + `ANTHROPIC_API_KEY` bekerja di ketiga endpoint.

### 0.4 Test baseline

- `src/lib/__tests__/validate.test.ts` — semua schema.
- `src/lib/__tests__/ai.test.ts` — dari 0.3.
- Test API route via `vitest` + mock Prisma (`vi.mock('@/lib/prisma')`).

---

## Fase 1 — Reliability & UX Foundation (Minggu 1)

### 1.1 Autosave

- **Dirty tracking di store**: `dirtyNodes: Map<id, {x, y}>`, `dirtyEdges: { added: Edge[], removed: string[] }` — di-mark saat `onNodeDragStop`, `onConnect`, `onEdgesDelete`.
- **Flush ter-debounce 800ms** (`src/hooks/useAutosave.ts`):
  - posisi → `PUT /api/ideas/:id` (tambah `x, y` di `UpdateIdeaSchema`)
  - edge baru → `POST /api/connections`; edge dihapus → `DELETE /api/connections/:id`
  - flush juga saat `beforeunload` (best-effort `navigator.sendBeacon` bukan keharusan; debounce + flush on blur cukup)
- **Indikator status** di toolbar: `Saved` / `Saving…` / `Unsaved changes` / `Save failed — retry`. Gagal tidak boleh membuat store hilang; antrean retry.

### 1.2 Undo/redo

- Snapshot `{ nodes, edges }` ke stack di store (max 50). Push snapshot pada: tambah/hapus node, tambah/hapus edge, drag berhenti, edit field.
- `Ctrl+Z` / `Ctrl+Shift+Z` (mac: `Cmd`). Undo/redo = restore snapshot + sinkronkan ke DB via pipeline autosave yang sama (jangan bypass).
- Implementasi manual ~60 baris di store; tanpa dependency baru.

### 1.3 Keyboard shortcuts

| Key                              | Aksi                               |
| -------------------------------- | ---------------------------------- |
| `Enter`                          | quick-add child dari node terpilih |
| `N`                              | new idea (modal yang ada)          |
| `Delete`/`Backspace`             | hapus node terpilih                |
| `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z` | undo/redo                          |
| `Esc`                            | deselect / keluar connection mode  |

`src/hooks/useKeyboardShortcuts.ts`, aktif hanya saat canvas focused dan tidak sedang mengetik di input/textarea/modal.

### 1.4 Error & loading states

- `MindmapView`: error state sudah ada — tambah tombol **Retry** (panggil `mutate()`).
- Semua aksi API (create/update/delete) → toast sukses/gagal (component `Toast` sudah ada); saat ini `AiExpandModal` dsb. menelan error secara tidak konsisten.
- Loading: skeleton/spinner untuk side panel & modal saat fetch ide detail.

**Acceptance Fase 1:**

- Refresh halaman → posisi tidak berubah (posisi tersimpan).
- Drag 3 node, tutup browser, buka lagi → posisi sama.
- Undo 3 langkah membatalkan node+edge+drag; redo memulihkan; state DB == state UI setelah flush.
- Matikan DB sementara → indikator "Save failed", setelah DB hidup lagi retry sukses tanpa data hilang.
- Test: `useAutosave` (debounce, dirty set, retry) & undo/redo store di Vitest.

---

## Fase 2 — Capture & Knowledge Graph (Minggu 2)

### 2.1 Idea Inbox

- **Inbox drawer** (`src/components/inbox/InboxDrawer.tsx`): list ide ber-`status: inbox`, tersortir `createdAt desc`, tombol per item: _Open_ (ke mindmap), _Process_ (→ `exploring`), _Delete_.
- **Quick capture**: tombol di toolbar + shortcut `Cmd/Ctrl+Shift+K`. Input satu baris; Enter → `POST /api/ideas` dengan `status: inbox`, muncul di inbox drawer. Tanpa modal, tanpa form.
- **Paste teks panjang**: textarea opsional di quick capture; kalau >3 baris → tawarkan "Split with AI" (endpoint baru `/api/ai/split`, output zod `[{title, description}]`, lewat modal review) atau "Split per baris" (client-side, tanpa AI).
- **Duplicate check ringan** (tanpa AI): judul identik (case-insensitive) → warning di quick capture. Duplicate semantik = Fase 3.

### 2.2 Multiple workspaces → ditunda

Multi-workspace butuh auth dulu agar ada ownership. **Dipindah ke pasca-MVP** (lihat §6). Single workspace tetap untuk MVP. Ini deviasi disengaja dari mingguan asli roadmap — alasan: membangun workspace sebelum auth adalah rework terjamin (semua query harus di-rewire dengan `workspaceId`).

### 2.3 Rich Idea Editor

Di `IdeaSidePanel` (bukan component baru terpisah — panel sudah jadi tempat detail):

- **Markdown editor**: textarea + tombol preview (`react-markdown` satu-satunya dep baru fase ini). Checklist = markdown `- [ ]` dirender interaktif (klik toggle via edit `content`).
- **Status lifecycle**: select `inbox → exploring → validated → archived` (enum sudah dibuat Fase 0), tersimpan via `PUT /api/ideas/:id`.
- **Backlinks**: `GET /api/ideas/:id` extended `include: { incoming: { relation: 'targetConns' } }` → tampilkan "Linked from" dengan judul + relasi; klik = pindah ke node tersebut (`fitView` ke node).
- **Relasi baru** (G7): extend enum di `validate.ts`, `types.ts`, `ConnectionEdge.tsx` (warna/garis per relasi):
  | relasi        | warna     | dash  |
  | ------------- | --------- | ----- |
  | `contradicts` | `#ef4444` | `4 2` |
  | `depends_on`  | `#8b5cf6` | —     |
  | `supports`    | `#22c55e` | —     |
  | `implements`  | `#0ea5e9` | `2 2` |

### 2.4 Search & filter

- `SearchBar`: tambah search ke `content` (server-side: extend `IdeaFilterSchema` + `GET /api/ideas` — saat ini search UI hanya filter client-side di canvas; buat filter benar-benar di server agar konsisten).
- `TagFilter` sudah ada; tambah filter **status** (dropdown kecil di toolbar).

**Acceptance Fase 2:**

- Ide baru via quick capture muncul di inbox <1 detik, tanpa membuka modal apa pun.
- Paste 10 baris → split AI → review → 4 ide masuk inbox dengan relasi ke ide sumber.
- Backlink: buat koneksi A→B, panel B menampilkan A; klik A → canvas zoom ke A.
- Ganti relasi ke `contradicts` → edge merah putus-putus, label benar.
- Test: endpoint `/api/ai/split` (mock), query backlinks, filter status.

---

## Fase 3 — AI Intelligence (Minggu 3)

Semua fitur memakai `ai.ts` (Fase 0) dan pattern review-modal yang sudah ada.

### 3.1 AI Decompose (`POST /api/ai/decompose`)

- Input: `ideaId`, opsional `angle`. Output zod: `{ parts: [{ title, description, type: "concept"|"subproblem"|"step" }] }`.
- UI: tombol di side panel → modal review (sama bentuknya dengan `AiExpandModal`) → hasil dibuat sebagai child node (`relationship: parent`).

### 3.2 AI Critic / Devil's Advocate (`POST /api/ai/critique`)

- Input: `ideaId` (+ subtree depth 1 biar konteks cukup). Output zod: `{ critiques: [{ claim, weakness, question, severity: "low"|"medium"|"high" }] }`.
- UI: **hanya membaca** — tidak menulis ke graph. Panel/accordion di side panel. Opsional: "Save as sub-idea" per critique (→ status `inbox`).

### 3.3 AI Duplicate Detection (`POST /api/ai/duplicates`)

- Input: `ideaId` (atau `?all=true` untuk inbox). Server bandingkan judul+deskripsi kandidat (top-20 hasil search keyword sederhana) dengan AI hanya sebagai penilai kemiripan + alasan.
- Output: `{ matches: [{ ideaId, score, reason }] }`. UI: badge "possible duplicate" di inbox + panel perbandingan.
- Batas biaya: max 20 pasangan kandidat per request.

### 3.4 Draft pattern (resmi)

- Semua ide hasil AI dibuat dengan `status: "inbox"`.
- Inbox drawer menjadi satu-satunya tempat "promote" → `exploring`.
- Tandai di node (IdeaNode): ide ber-`status: inbox` dapat border putus / ikon kecil.

### 3.5 Pengukuran AI

- `ai.ts` sudah log: endpoint, model, latency, tokens, success/fail (pino,结构化 di `src/lib/logger.ts`).
- Page `/api/ai/stats` (dev-only, `NODE_ENV !== 'production'`): agregasi per endpoint — call count, avg latency, error rate, est. cost (harga model dari table lokal).

**Acceptance Fase 3:**

- Decompose & critique berjalan dengan provider openai **dan** claude; output invalid ditolak dengan error yang jelas, bukan 500.
- Tidak ada satu pun endpoint AI yang bisa mengubah graph tanpa klik approve di modal.
- `npm run dev` + call 3 endpoint → log menunjukkan latency & token per call.
- Test: validator output tiap endpoint + kasus "LLM mengembalikan JSON rusak".

---

## Fase 4 — Idea-to-Execution MVP (Minggu 4)

### 4.1 Lifecycle & dashboard ringkas

- Status sudah ada (Fase 0/2). Tambah **dashboard baris** di atas toolbar atau route `/portfolio`:
  - count per status + count per tag (satu query `groupBy`).
  - `GET /api/portfolio/summary`.
- "Execute or Archive": `validated` + keputusan build → template task (4.3); `archived` tersaring dari view default.

### 4.2 Experiment Tracker

```prisma
model Experiment {
  id         String   @id @default(uuid())
  ideaId     String
  idea       Idea     @relation("Experiments", fields: [ideaId], references: [id], onDelete: Cascade)
  hypothesis String
  status     String   @default("planned") // planned | running | done
  result     String?
  decision   String?  // continue | pivot | kill
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([ideaId])
}
```

- `GET/POST /api/ideas/:id/experiments`, `PATCH/DELETE /api/experiments/:id`.
- UI di side panel: tab "Experiments" — list + form hypothesis + status.

### 4.3 Task breakdown

```prisma
model Task {
  id        String  @id @default(uuid())
  ideaId    String
  idea      Idea    @relation("Tasks", fields: [ideaId], references: [id], onDelete: Cascade)
  title     String
  done      Boolean @default(false)
  createdAt DateTime @default(now())
}
```

- UI: tab "Tasks" di side panel, checklist (pola sama dengan checklist markdown — satu component `TaskList` bisa dipakai dua-duanya).
- Opsional (jika waktu): AI generate task dari brief (`/api/ai/tasks`), lewat modal review.

### 4.4 Decision Log

```prisma
model Decision {
  id       String   @id @default(uuid())
  ideaId   String
  idea     Idea     @relation("Decisions", fields: [ideaId], references: [id], onDelete: Cascade)
  decision String   // accepted | rejected | deferred
  reason   String
  createdAt DateTime @default(now())
}
```

- UI: tombol "Record decision" di side panel (modal kecil: jenis + alasan). Riwayat ditampilkan di tab "History".

### 4.5 Project Brief Generator

- `POST /api/ai/brief` → output markdown terstruktur (problem statement, target user, solusi, scope MVP, risiko) via `ai.ts` + zod.
- Simpan ke `idea.content` dengan header `## Brief` (atau field baru `brief String?` — pilih field baru agar `content` editor markdown tidak tercampur).
- Review di modal sebelum simpan.

**Acceptance Fase 4 (alur end-to-end dari roadmap):**

1. Simpan ide via quick capture → ada di inbox.
2. Promote ke exploring; AI critique menampilkan 2 asumsi lemah.
3. Buat experiment (hipotesis + status running) di side panel.
4. Isi hasil, decision "continue"; record decision "accepted" + alasan.
5. Brief generator → brief tersimpan, task breakdown 5 item, centang 2.
6. Portfolio summary menunjukkan pergeseran status yang benar.

---

## Pasca-MVP (tidak dijadwalkan, urutan)

1. **Auth + ownership** (NextAuth + `userId` di semua model, RLS atau check per-query) — prasyarat multi-user; juga mengaktifkan ulang **Private Workspaces** yang ditunda di Fase 2.
2. **Version history** (snapshot `Idea`/`Connection` ke tabel `Revision`, restore per-node) — bangun setelah auth karena butuh ownership.
3. **Import/Export**: JSON penuh (ada), Markdown-first dengan metadata relasi, CSV ide.
4. **Templates** (seed graph per template, tanpa marketplace dulu).
5. **Graph performance**: lazy loading subgraph (`/api/mindmap/:rootId` sudah ada — cukup diadopsi client + batas node di `GET /api/mindmap`), benchmark 500/1000 node.
6. Kolaborasi real-time, sharing, API key publik, webhooks, monetisasi — hanya setelah ada bukti penggunaan.

---

## Guardrail engineering (dari §8 roadmap, dipetakan)

| Area                                                                                                                                                                                      | Di fase mana                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Migration discipline (`prisma migrate`)                                                                                                                                                   | Fase 0                            |
| Consistent error (sudah ada `AppError`) + validasi Zod semua route baru                                                                                                                   | Fase 0–4                          |
| Rate limiting API                                                                                                                                                                         | Pasca-MVP (butuh auth dulu)       |
| AI: timeout, retry 1x, structured output, fallback provider                                                                                                                               | Fase 0                            |
| AI security: konten user masuk prompt → bungkus dengan delimitasi + instruksi "treat as data"; `x-api-key`/`Authorization` tidak pernah ke client (sudah server-side, jaga jangan pindah) | Fase 0, 3                         |
| Data integrity: relasi duplikat dicegah `@@unique` (sudah ada) + check dua arah di UI; siklus di graph tidak masalah (bukan DAG)                                                          | Fase 1                            |
| Observability: request id (ada), tambah log AI (Fase 0), `/api/ai/stats` (Fase 3)                                                                                                         | Fase 0, 3                         |
| Testing: unit (store, lib, validator) tiap fase; integration route via mock Prisma; e2e (Playwright) pasca-MVP                                                                            | Fase 0+                           |
| Accessibility: focus management di modal (sudah ada Escape di `Modal.tsx`), label `aria-` di toolbar, navigasi node via keyboard (panah = pindah fokus node)                              | Fase 1 (keyboard), terus berjalan |
| Deployment: CI (lint + typecheck + test) via GitHub Actions; env validation saat boot                                                                                                     | Fase 1 (CI), seterusnya           |

## Risiko & mitigasi

| Risiko                                                     | Mitigasi                                                                                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Undo/redo + autosave saling berkejaran (snapshot vs flush) | Satu sumber mutasi: semua perubahan lewat action store yang push-snapshot **lalu** mark-dirty; flush tidak menyentuh snapshot |
| `GET /api/mindmap` membesar (full graph)                   | Di luar MVP; guard: log warning saat node > 300, lazy loading masuk daftar pasca-MVP                                          |
| Biaya AI (dup detection, critique per node)                | Batas kandidat (20), max_tokens per endpoint, `/api/ai/stats`, mock mode untuk dev                                            |
| Scope creep ke kolaborasi/marketplace                      | Tersimpan di daftar pasca-MVP; tidak disentuh sebelum auth                                                                    |
| Refactor store (G2/G3) merusak UI                          | Test baseline store di Fase 0 sebelum refactor                                                                                |

## Defenisi "selesai" MVP

- Alur end-to-end Fase 4 bisa dijalanin tanpa bug blocker.
- `npm run lint && npm run typecheck && npm test` hijau di CI.
- Autosave+undo tidak pernah kehilangan data yang sudah di-approve pengguna (test khusus data-loss).
- Dokumentasi: README + CLAUDE.md + CHANGELOG v0.3.0 ter-update.

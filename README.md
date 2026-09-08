# 🤖 Modern AI Chatbot Web Interface (Chatbot Intent Lab)

Frontend web interface modern, responsif, dan elegan untuk AI Chatbot dengan integrasi live ke penyedia LLM (OpenAI-compatible), simulasi cerdas, manajemen **Model Context Protocol (MCP) Multi-Server**, **AI Skills kustom**, serta kesiapan integrasi dengan **Rasa NLU**.

Aplikasi ini dibangun menggunakan **React 19 + TypeScript + Vite** dengan styling **Vanilla CSS modern (Design System)** tanpa dependensi UI eksternal atau TailwindCSS, menghasilkan antarmuka yang bersih, cepat, aman, dan mudah disesuaikan.

---

## ✨ Fitur Utama & Kondisi Terbaru

### 1. ⚡ Live LLM Streaming & Fallback Cerdas
- **Integrasi Live API**: Terhubung langsung ke endpoint LLM OpenAI-compatible (mis. Gemini, Claude, OpenAI, DeepSeek, Qwen) melalui Server-Sent Events (SSE) streaming (`fetch` + stream reader) menggunakan konfigurasi dari `.env`.
- **Graceful Fallback**: Apabila API key belum diisi, kuota habis, atau server offline, aplikasi secara mulus beralih ke simulasi respon cerdas (*realistic mock streaming*).
- **Multi-Phase Streaming**:
  - Fase *Thinking* indikator.
  - Visualisasi aktivitas eksekusi tool MCP saat connector aktif.
  - *Character/token streaming* real-time dengan tombol stop (*Escape* atau tombol Stop).
- **Metadata Respons**: Informasi durasi latensi respons (ms), badge model yang digunakan, badge persona skill yang aktif, serta tombol copy markdown yang praktis.

### 2. 🧠 AI Skills Management & Mode Tanpa Skill
- **Mode Tanpa Skill (Agent AI Murni - Default)**:
  - Opsi default untuk berinteraksi langsung dengan persona asli model AI tanpa batasan prompt sistem khusus.
- **5 Skill Bawaan Siap Pakai**:
  - 🏝️ *Pemandu Wisata Bangkep* (eksplorasi wisata, budaya, dan kuliner Banggai Kepulauan).
  - 💳 *Analis Transaksi & Finansial* (pemeriksaan RRN, mutasi, dan keamanan transaksi).
  - 🧠 *Rasa NLU & Intent Architect* (perancangan intent, entities, dan domain chatbot).
  - 💻 *Senior Code Developer* (analisis kode, debugging, dan refactoring).
  - ✦ *General Assistant* (asisten umum serbaguna).
- **Kustomisasi & Manajemen Penuh**:
  - **Tambah & Edit Skill**: Form modal untuk nama, emoji/icon preset, deskripsi singkat, dan *System Prompt kustom* yang otomatis disuntikkan ke konteks percakapan.
  - **Aksi Cepat Hapus**: Tombol hapus (🗑) langsung pada dropdown selector skill maupun di dalam modal edit.
  - **Reset to Defaults**: Kemampuan mengembalikan daftar skill ke setelan bawaan sistem.
- **Landing Page Dinamis (Empty State)**:
  - Menyesuaikan ikon, judul sambutan, dan deskripsi sesuai skill yang sedang aktif atau model yang terpilih saat tanpa skill.

### 3. 🔌 Multi-Server MCP Connectors (Arsitektur ala Claude Connectors)
- **Dukungan Multi-Server**: Mengelola banyak remote server Model Context Protocol secara simultan.
- **Pre-configured Connectors**:
  - PostgreSQL DB (`http://localhost:8001/mcp`)
  - Bangkep Tourism Knowledge (`http://localhost:8002/mcp`)
  - Rasa Core & NLU Bridge (`http://localhost:8005/mcp`)
  - Qdrant Vector Search (`http://localhost:6333/mcp`)
  - GitHub & DevOps Tools (`http://localhost:8004/mcp`)
- **Add & Edit Custom Connector**:
  - Input nama connector, icon, remote MCP server URL, Authorization token (Bearer/Custom), dan deskripsi.
- **Real-Time Connection Test**:
  - Pengujian koneksi langsung dengan penghitungan latensi milidetik (ms) dan auto-deteksi tool yang tersedia di endpoint remote.
- **Tool Context Injection**:
  - Tools dari seluruh MCP server yang terhubung otomatis disuntikkan ke sistem prompt LLM pada sesi live chat.

### 4. 🧩 Model Selector Dinamis & Live Discovery
- **Live Model Reload**: Mengambil daftar model yang tersedia secara live dari endpoint `/models` Base URL via tombol reload.
- **Provider Grouping Otomatis**: Pengelompokan cerdas berdasarkan ID model (*Google Gemini*, *Anthropic Claude*, *OpenAI*, *Qwen / Alibaba*, *DeepSeek*, *Meta / LLaMA*, *Mistral AI*, *Custom / Other*).
- **Pencarian Model Instan**: Memfilter model berdasarkan nama atau provider secara langsung.
- **Model Persistence**: Pembuatan chat baru (`Ctrl+N` / tombol *New Chat*) otomatis mempertahankan model yang sedang aktif.

### 5. 🗄️ Deterministic Conversation History (FastAPI + PostgreSQL)
- **Persistence di Database**: Riwayat percakapan (`conversations`) dan pesan (`messages`) tersimpan di PostgreSQL `intent_lab`.
- **Pengelompokan Waktu di Frontend**: Pengelompokan cerdas (*Today*, *Yesterday*, *Previous 7 Days*, *Earlier*).
- **Pencarian Real-Time**: Pencarian instan judul riwayat percakapan didukung indeks Trigram (`pg_trgm`).
- **Inline Rename & Soft-Delete**: Ganti nama atau hapus percakapan melalui icon hover / context menu dengan audit logging.
- **Auto Touch Timestamp**: Setiap pesan baru otomatis memicu pembaruan timestamp `updated_at` pada percakapan via PostgreSQL Trigger (`touch_conversation`).
- **Markdown & Code Rendering Lengkap**: Heading, tabel, syntax highlighted code blocks dengan line numbers & tombol copy.

### 6. 🧠 Long-Term Memory & Intent Routing (Explicit Memory)
- **Deteksi Intent Otomatis**: Intent classifier mendeteksi secara otomatis saat user memberikan instruksi eksplisit untuk mengingat (*"ingat bahwa..."*, *"tolong catat..."*, *"remember that..."*) atau melupakan (*"lupakan bahwa..."*, *"hapus memori..."*).
- **Fakta Lintas Percakapan**: Fakta tersimpan di tabel `memory_facts` (`is_active = true`) dan bertahan meski user membuat sesi chat baru.
- **Deduplikasi Cerdas**: Pembaruan fakta yang saling berkaitan/tumpang tindih diupdate secara otomatis alih-alih menduplikasi entri.
- **Context Injection Otomatis**: Saat percakapan baru dimulai, seluruh fakta memori aktif otomatis disuntikkan ke dalam sistem prompt LLM sehingga model langsung mengetahui preferensi pengguna tanpa harus diulang.

### 7. 🛡️ Keamanan Kredensial & Audit Logging
- **Konfigurasi Server-Side Terisolasi**: Kredensial sensitif (API Key, Base URL, Password Database) dikelola terpusat melalui file `.env`.
- **Audit Logging Transparan**: Setiap operasi create, rename, delete pada percakapan maupun memori dicatat di tabel `audit_log`.
- **Network Security**: Backend dibatasi listen pada `127.0.0.1` (localhost) untuk keamanan pengujian internal.

### 8. ⚙️ Panel Settings Terpadu
- **General**: Pengaturan tema (Dark, Light, System) dan toggle *Enter to send*.
- **Skills**: Manajemen visual daftar skill, toggle enable/disable, tombol tambah, edit, hapus, dan reset default.
- **Connectors**: Pengelolaan status remote MCP servers dan trigger modal connectors.
- **Models**: Peninjauan model yang terdeteksi dan trigger reload dari server.
- **Interface**: Opsi mode ringkas (*compact mode*), toggle metadata pesan, dan toggle visualisasi tool activity.

### 9. ⌨️ Shortcut Keyboard & Aksesibilitas
- `Ctrl` / `Cmd` + `N`: Membuat percakapan baru dengan model aktif.
- `Ctrl` / `Cmd` + `K`: Membuka sidebar dan langsung fokus ke kolom pencarian riwayat.
- `Escape`: Menghentikan streaming respons (*Stop generating*).

---

## 📁 Struktur Direktori

```text
chatbot-intent/
├── .env.example                    # Template konfigurasi environment level root
├── .gitignore                      # Aturan pengabaian git (mengamankan file .env & venv)
├── README.md                       # Dokumentasi utama proyek
├── plan.md                         # Dokumen spesifikasi arsitektur history & memory
│
├── backend/                        # Backend REST API (FastAPI + SQLAlchemy + PostgreSQL)
│   ├── .env                        # Konfigurasi aktif database & port backend
│   ├── .env.example                # Template environment backend
│   ├── requirements.txt            # Dependensi Python backend
│   ├── scripts/
│   │   └── migrate.py              # Skrip inisialisasi DDL PostgreSQL
│   ├── tests/
│   │   └── test_api.py             # Test suite pytest (Health, CRUD, Memory, Intent)
│   └── app/
│       ├── __init__.py
│       ├── main.py                 # Entrypoint FastAPI, CORS, & security headers
│       ├── config.py               # Loader konfigurasi environment
│       ├── database.py             # Engine SQLAlchemy, SessionLocal, & dependency get_db
│       ├── models.py               # Definisi model ORM PostgreSQL (Conversations, Messages, Memory, Audit)
│       ├── schemas.py              # Schema validasi Pydantic v2 (camelCase alias generator)
│       ├── routers/
│       │   ├── conversations.py    # Endpoint CRUD percakapan & pesan
│       │   ├── memory.py           # Endpoint CRUD memori & prompt context
│       │   └── intent.py           # Endpoint klasifikasi intent
│       └── services/
│           ├── intent_classifier.py# Service klasifikasi intent regex/rule-based
│           └── memory_service.py   # Logika bisnis memori, dedup, soft-delete, & format prompt
│
└── ui/                             # Aplikasi Frontend Web (Vite + React 19 + TypeScript)
    ├── .env                        # Konfigurasi environment UI (VITE_*)
    ├── .env.example                # Template environment UI
    ├── package.json                # Dependensi dan script npm
    ├── tsconfig.json               # Konfigurasi TypeScript
    ├── vite.config.ts              # Bundler Vite & reverse proxy internal `/api` -> `http://127.0.0.1:8008`
    ├── index.html                  # Dokumen HTML entrypoint
    ├── public/
    │   └── favicon.svg             # Favicon aplikasi
    └── src/
        ├── types/
        │   └── index.ts            # Definisi antarmuka TypeScript (Chat, Skill, MCP, Model)
        ├── lib/
        │   ├── api/                # Layer integrasi API & Service logic
        │   │   ├── chat.ts         # Live SSE streaming, messages persistence, & memory injection
        │   │   ├── config.ts       # Loader konfigurasi client dari environment Vite
        │   │   ├── conversations.ts# CRUD percakapan terhubung ke backend FastAPI
        │   │   ├── memory.ts       # Client API untuk long-term memory backend
        │   │   ├── mcp.ts          # Pengelolaan multi-server MCP & latency testing
        │   │   ├── models.ts       # Discovery live model dari /models & provider classifier
        │   │   └── skills.ts       # Persistensi custom skills & fungsi reset default
        │   └── mock/               # Mock dataset untuk fallback & demonstrasi offline
        │       ├── conversations.ts# Percakapan awal fallback
        │       ├── intents.ts      # Dataset intent (kompatibel Rasa NLU)
        │       ├── mcp.ts          # Mock daftar tool MCP lokal
        │       ├── mcpServers.ts   # Mock konfigurasi default remote MCP servers
        │       ├── messages.ts     # Template respon streaming, tabel, & tool mock
        │       ├── models.ts       # Fallback daftar model populer
        │       └── skills.ts       # Daftar 5 skill persona default
        ├── store/                  # State Management (React Context)
        │   ├── ChatContext.tsx     # State riwayat percakapan, pesan aktif, & streaming
        │   └── ConfigContext.tsx   # State global (skills, MCP connectors, models, tema)
        ├── components/             # Komponen Antarmuka Pengguna
        │   ├── chat/               # Komponen ruang obrolan (Header, Messages, Composer, Tools)
        │   ├── mcp/                # Dialog multi-connector MCP
        │   ├── model/              # Dropdown model selector terkelompok
        │   ├── settings/           # Panel pengaturan (General, Skills, Connectors, Models, UI)
        │   ├── sidebar/            # Sidebar riwayat percakapan, pencarian, & aksi
        │   └── skill/              # Modal buat/edit persona skill & selector
        ├── App.tsx                 # Layout utama & keyboard shortcuts
        ├── main.tsx                # Entrypoint render React 19
        └── index.css               # Design System CSS modern (responsif, CSS variables)
```

---

## ⚙️ Konfigurasi Environment

### 1. Backend (`backend/.env`)
```ini
# PostgreSQL Database (Instance n8n-postgres-1)
POSTGRES_USER=n8nuser
POSTGRES_PASSWORD=Muntilan123
POSTGRES_HOST=172.22.0.2
POSTGRES_PORT=5432
POSTGRES_DB=intent_lab

# Server Binding
HOST=127.0.0.1
PORT=8008
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

# Integrasi Eksternal
RASA_URL=http://localhost:5005
MCP_URL=http://localhost:8000
```

### 2. Frontend Web (`ui/.env`)
Prefix `VITE_` wajib disertakan agar dapat dibaca oleh runtime Vite di browser:
```ini
# Konfigurasi LLM API (OpenAI-compatible)
VITE_LLM_PROVIDER=Custom
VITE_LLM_BASE_URL=https://ai.sumopod.com/v1
VITE_LLM_API_KEY=sk-*******
VITE_DEFAULT_MODEL=gemini-3.7-flash

# Endpoint Server Eksternal
VITE_RASA_URL=http://localhost:5005
VITE_MCP_URL=http://localhost:8000
```

---

## 📡 API Contract (Backend FastAPI)

Backend FastAPI melayani endpoint RESTful di `http://127.0.0.1:8008` (otomatis di-proxy oleh Vite melalui prefix `/api`):

| Endpoint | Method | Deskripsi | Status Code |
|---|---|---|---|
| `/health` | `GET` | Health check & verifikasi koneksi PostgreSQL | `200` |
| `/api/conversations` | `GET` | Mengambil daftar percakapan aktif (`updated_at DESC`) | `200` |
| `/api/conversations` | `POST` | Membuat percakapan baru | `201` |
| `/api/conversations/{id}` | `PATCH` | Mengubah judul percakapan (`rename`) | `200` |
| `/api/conversations/{id}` | `DELETE` | Menghapus percakapan secara soft-delete | `200` |
| `/api/conversations/{id}/messages` | `GET` | Mengambil seluruh pesan percakapan (`created_at ASC`) | `200` |
| `/api/conversations/{id}/messages` | `POST` | Menyimpan pesan (otomatis mendeteksi intent memori) | `201` |
| `/api/conversations/{id}/messages?from={id}` | `DELETE` | Menghapus pesan dari ID tertentu (fitur edit & resend) | `200` |
| `/api/memory` | `GET` | Mengambil seluruh fakta memori aktif pengguna | `200` |
| `/api/memory` | `POST` | Menyimpan fakta memori baru (dengan deduplikasi otomatis) | `201` |
| `/api/memory/{id}` | `DELETE` | Menghapus fakta memori secara soft-delete | `200` |
| `/api/memory/prompt-context` | `GET` | Mengambil blok teks format memori untuk injeksi system prompt LLM | `200` |
| `/api/intent/classify` | `POST` | Menguji klasifikasi intent dari sebuah teks pengguna | `200` |

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Persiapan Database PostgreSQL
Database `intent_lab` berjalan pada container Docker `n8n-postgres-1`. Untuk memeriksa statusnya:
```bash
docker ps | grep n8n-postgres-1
# Verifikasi koneksi DB:
docker exec -it n8n-postgres-1 psql -U n8nuser -d intent_lab -c "\dt"
```

### 2. Menjalankan Backend FastAPI
```bash
cd /home/ubuntu/magang/rasa/rasa-intent-lab/chatbot-intent/backend

# Aktifkan virtual environment
source venv/bin/activate

# Jalankan migrasi skema database (idempoten)
python scripts/migrate.py

# Jalankan server FastAPI (port 8008)
uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload
```

*Tips Menjalankan Backend di Background (`screen`)*:
```bash
screen -dmS backend-chatbot-intent bash -c 'cd /home/ubuntu/magang/rasa/rasa-intent-lab/chatbot-intent/backend && ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8008 --reload'
```

Verifikasi kesehatan backend:
```bash
curl http://127.0.0.1:8008/health
# Respon yang diharapkan: {"status":"ok","database":"connected","database_name":"intent_lab"}
```

Menjalankan automated test suite backend:
```bash
cd /home/ubuntu/magang/rasa/rasa-intent-lab/chatbot-intent/backend
PYTHONPATH=. ./venv/bin/pytest tests/test_api.py -v
```

### 3. Menjalankan Frontend Web (React + Vite)
```bash
cd /home/ubuntu/magang/rasa/rasa-intent-lab/chatbot-intent/ui

# Install dependencies (jika pertama kali)
npm install

# Jalankan server development
npm run dev
```

Aplikasi web dapat diakses di browser pada:
```text
http://localhost:5173
```
*Catatan: Vite dikonfigurasi dengan reverse proxy internal `/api` -> `http://127.0.0.1:8008`, sehingga frontend dapat berkomunikasi langsung dengan backend tanpa kendala CORS.*

Untuk pemeriksaan lint dan type checking:
```bash
npm run lint     # Menjalankan Oxlint
npm run build    # Menjalankan type-checking (tsc) dan bundle produksi
```

---

## 🔌 Arsitektur & Alur Kerja Sistem

```text
User (Browser)
   │
   ▼ HTTP (5173)
React Frontend (chatbot-intent/ui)
   │
   ├── Sesi Obrolan & Streaming SSE ───► Provider LLM (OpenAI-compatible)
   │                                        ▲
   │ (Injeksi memory context & tools)       │
   │                                        │
   ▼ REST API (/api via Vite Proxy)         │
FastAPI Backend (Port 8008) ────────────────┘
   ├── Router: /conversations  (CRUD riwayat percakapan & pesan)
   ├── Router: /memory         (Fakta jangka panjang, deduplikasi, & prompt context)
   └── Intent Classifier       (Deteksi intent save_memory, forget_memory, & general_chat)
   │
   ▼ SQLAlchemy ORM / Connection Pool (Port 5432)
PostgreSQL Container (n8n-postgres-1: intent_lab)
   ├── conversations           (Trigger: touch_conversation memperbarui updated_at)
   ├── messages                (search_vector tsvector indonesian)
   ├── memory_facts            (is_active flag untuk soft-delete)
   └── audit_log               (Pencatatan riwayat setiap aksi mutasi)
```


# 🤖 Modern AI Chatbot Web Interface (Chatbot Intent Lab)

Frontend web interface modern, responsif, dan elegan untuk AI Chatbot dengan integrasi konseptual ke Rasa NLU, Model Context Protocol (MCP), dan Dynamic LLM Model Selector.

Aplikasi ini dibangun menggunakan **React 19 + TypeScript + Vite** dengan styling **Vanilla CSS modern (Design System)** tanpa dependensi UI eksternal atau TailwindCSS, menghasilkan antarmuka yang bersih, cepat, dan mudah disesuaikan.

---

## ✨ Fitur Utama

- 🎨 **Modern Dark & Light Mode**: Desain dark-first yang nyaman untuk mata dengan toggle ke Light atau System mode.
- ⚡ **Simulasi Streaming Respons**: Pengalaman chat ala LLM modern (Thinking state $\rightarrow$ Character-by-character token streaming atau Live API streaming).
- 🧠 **AI Skills Management (Baru)**:
  - Kemampuan membuat, mengubah, menghapus, dan mengaktifkan **Skills** khusus.
  - Setiap skill memiliki emoji/icon, nama, deskripsi, dan **System Prompt kustom** yang disuntikkan ke konteks AI.
  - Dilengkapi 5 skill bawaan: *Pemandu Wisata Bangkep*, *Analis Transaksi & Finansial*, *Rasa NLU & Intent Architect*, *Senior Code Developer*, dan *General Assistant*.
  - Pemilihan skill aktif langsung melalui header chat atau landing page, tersimpan otomatis di `localStorage`.
- 🧩 **Model Selector Dinamis**: Dropdown model AI terkelompok berdasarkan provider (Google Gemini, Anthropic Claude, Qwen, DeepSeek, Custom) yang diambil secara live dari endpoint Base URL.
- 📝 **Markdown & Code Rendering Lengkap**: Mendukung format heading, tabel terstruktur, inline code, code blocks dengan tombol copy, dan blockquotes.
- 💬 **Conversation Management**:
  - Pengelompokan riwayat obrolan (*Today*, *Yesterday*, *Previous 7 Days*, *Earlier*).
  - Pencarian riwayat percakapan secara instan.
  - Rename dan Delete percakapan via hover action atau klik kanan (*context menu*).
- 🔌 **Multi-Server MCP Connectors (Baru - Terinspirasi Antarmuka Claude Connectors)**:
  - Kemampuan menambahkan **banyak Remote MCP Server / Connector kustom**, tidak hanya satu server saja.
  - Tampilan manajemen **Connectors**:
    - Filter status: *All*, *Connected*, *Not connected*.
    - Kolom pencarian connector secara real-time.
    - Pre-built connectors (PostgreSQL DB, Bangkep Tourism Knowledge, Rasa Bridge, Qdrant Vector, GitHub).
    - Modal **"Add custom connector"** untuk menambahkan endpoint MCP baru dengan input *Name*, *Remote MCP server URL*, *Authorization Token*, dan *Description*.
    - Tombol aksi cepat **Test (⚡)**, **Edit (✎)**, **Delete (✕)**, dan **Connect / Disconnect** untuk setiap connector.
    - Pengujian koneksi real-time (**Test Connection**) dengan pengukuran latensi milidetik (ms) dan deteksi jumlah tools yang aktif.
    - Status koneksi diverifikasi secara otomatis dan data tersimpan di `localStorage`.
    - Tools dari seluruh MCP server yang terhubung otomatis disuntikkan ke konteks AI saat streaming.
- ⚙️ **Panel Settings Lengkap**:
  - **General**: Pengaturan tema dan toggle *Enter to send*.
  - **Skills**: Manajemen daftar skill AI (tambah, edit, hapus, dan toggle on/off).
  - **Connectors**: Manajemen daftar remote MCP connectors dan status koneksi.
  - **Models**: Manajemen model AI dengan fitur pencarian dan reload dari Base URL.
  - **API**: Konfigurasi Base URL, API Key, dan Rasa URL dengan fitur *Test Connection*.
  - **Interface**: Compact mode, toggle metadata pesan, dan toggle visualisasi tool.
- ⌨️ **Keyboard Shortcuts**:
  - `Ctrl` / `Cmd` + `N`: Membuat percakapan baru.
  - `Ctrl` / `Cmd` + `K`: Membuka dan fokus ke pencarian percakapan.
  - `Escape`: Menghentikan streaming respon (*Stop generating*).
- 📱 **Desain Responsif**: Sidebar collapsible di desktop/tablet dan berubah menjadi drawer halus pada perangkat mobile.

---

## 📁 Struktur Direktori

```text
chatbot-intent/
├── .env.example                # Template konfigurasi environment root
├── README.md                   # Dokumentasi proyek ini
└── ui/                         # Aplikasi Frontend (Vite + React)
    ├── .env                    # File environment aktif (berisi kredensial & URL)
    ├── .env.example            # Template environment Vite
    ├── package.json            # Dependensi dan script npm
    ├── tsconfig.json           # Konfigurasi TypeScript
    ├── vite.config.ts          # Konfigurasi Vite
    ├── index.html              # Entrypoint HTML
    ├── public/
    │   └── favicon.svg         # Icon favicon aplikasi
    └── src/
        ├── types/
        │   └── index.ts        # TypeScript interfaces & types lengkap
        ├── lib/
        │   ├── api/            # Layer abstraksi API (siap dihubungkan ke backend)
        │   │   ├── chat.ts          # Abstraksi pengiriman pesan & streaming
        │   │   ├── models.ts        # Abstraksi model discovery & provider grouping
        │   │   ├── conversations.ts # Abstraksi CRUD percakapan & pengelompokan tanggal
        │   │   └── config.ts        # Abstraksi persistensi konfigurasi & test koneksi
        │   └── mock/           # Mock data realistis untuk prototipe
        │       ├── models.ts        # Mock daftar model LLM
        │       ├── intents.ts       # Mock daftar intent (sesuai domain Rasa)
        │       ├── mcp.ts           # Mock daftar tools MCP
        │       ├── conversations.ts # Mock percakapan awal
        │       └── messages.ts      # Mock pesan, tabel, kode, dan simulasi tool
        ├── store/              # State Management terpisah
        │   ├── ChatContext.tsx      # State percakapan, pesan, dan proses chat
        │   └── ConfigContext.tsx    # State konfigurasi, tema, model, intent, & tool
        ├── components/
        │   ├── chat/           # Komponen obrolan utama
        │   │   ├── ChatHeader.tsx       # Header atas, selector model, tombol settings
        │   │   ├── ChatMessages.tsx     # List pesan dengan smart auto-scroll
        │   │   ├── ChatMessage.tsx      # Bubble pesan, markdown parser, actions, & metadata
        │   │   ├── MessageComposer.tsx  # Input teks multiline, popover tools & intent
        │   │   ├── EmptyState.tsx       # Tampilan landing awal dengan rekomendasi prompt
        │   │   └── ToolActivity.tsx     # Visualisasi status eksekusi tool MCP
        │   ├── sidebar/        # Komponen sidebar riwayat
        │   │   └── ConversationSidebar.tsx
        │   ├── model/          # Komponen model selector
        │   │   └── ModelSelector.tsx
        │   └── settings/       # Modal dialog pengaturan
        │       └── SettingsPanel.tsx
        ├── App.tsx             # Layout utama & event listener shortcut keyboard
        ├── main.tsx            # Entrypoint React
        ├── index.css           # Design system CSS lengkap
        └── vite-env.d.ts       # Definisi tipe Vite client & env vars
```

---

## ⚙️ Konfigurasi Environment (`.env`)

File `.env` terletak di folder `chatbot-intent/ui/.env`. Variabel ini secara otomatis dimuat oleh Vite ke dalam interface chatbot:

```ini
# ===================================================
# Chatbot Web Interface — Environment Variables
# Catatan: Vite mengharuskan prefix 'VITE_' agar bisa
# diakses oleh client browser.
# ===================================================

# Konfigurasi LLM API
VITE_LLM_PROVIDER=Custom
VITE_LLM_BASE_URL=https://ai.sumopod.com/v1
VITE_LLM_API_KEY=sk-cbGqS5iKeABgFgUQicQ_sA
VITE_DEFAULT_MODEL=gemini-3.7-flash

# Endpoint Server Rasa NLU / Core
VITE_RASA_URL=http://localhost:5005

# Endpoint Server Model Context Protocol (MCP) / Bridge
VITE_MCP_URL=http://localhost:8000
```

### Penjelasan Variabel

| Variabel | Deskripsi | Default / Contoh |
|---|---|---|
| `VITE_LLM_PROVIDER` | Nama penyedia model LLM (`Custom`, `Google`, `Anthropic`, `OpenAI`). | `Custom` |
| `VITE_LLM_BASE_URL` | Base URL endpoint kompatibel OpenAI / LLM API. | `https://ai.sumopod.com/v1` |
| `VITE_LLM_API_KEY` | Kredensial API Key untuk mengakses endpoint LLM. | `sk-...` |
| `VITE_DEFAULT_MODEL` | ID model awal yang terpilih. | `gemini-3.7-flash` |
| `VITE_RASA_URL` | URL server Rasa NLU untuk deteksi intent / webhook. | `http://localhost:5005` |
| `VITE_MCP_URL` | URL endpoint server Model Context Protocol. | `http://localhost:8000` |

> **Catatan Keamanan**: Konfigurasi dari file `.env` ini dijadikan nilai default awal. Pengguna juga dapat mengubah konfigurasi ini sewaktu-waktu langsung melalui **Settings Panel (⚙)** pada UI aplikasi. Nilai yang disimpan pengguna di UI akan disimpan pada `localStorage` browser.

---

## 🚀 Panduan Menjalankan Aplikasi Secara Manual

Ikuti langkah-langkah berikut di terminal:

### 1. Masuk ke direktori UI
```bash
cd /home/ubuntu/magang/rasa/rasa-intent-lab/chatbot-intent/ui
```

### 2. Pastikan file `.env` sudah ada
File `.env` sudah dibuatkan otomatis. Jika ingin mengatur ulang dari template:
```bash
cp .env.example .env
```

### 3. Install dependencies
```bash
npm install
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan aktif dan dapat diakses di browser pada:
```text
http://localhost:5173
```
*(atau port berikutnya jika port 5173 sedang digunakan)*

### 5. Build untuk Produksi (Opsional)
Jika ingin memverifikasi type-checking dan membuat bundle build statis:
```bash
npm run build
```
Hasil build akan berada di direktori `dist/`. Anda dapat mempratinjaunya dengan:
```bash
npm run preview
```

---

## 🔌 Integrasi ke Backend Nyata (Roadmap / Future Integration)

Frontend ini dirancang dengan layer abstraksi API bersih di `src/lib/api/` sehingga sangat mudah dialihkan dari simulasi mock data ke endpoint produksi nyata:

1. **Integrasi LLM Nyata**:
   Ubah fungsi di `src/lib/api/chat.ts` untuk memanggil endpoint `/chat/completions` menggunakan `fetch` atau Server-Sent Events (SSE) dengan `VITE_LLM_BASE_URL` dan `VITE_LLM_API_KEY`.
2. **Integrasi Rasa NLU**:
   Panggil REST endpoint Rasa `POST ${VITE_RASA_URL}/model/parse` atau webhook `POST ${VITE_RASA_URL}/webhooks/rest/webhook` untuk mendapatkan klasifikasi intent dan entities.
3. **Integrasi Model Context Protocol (MCP)**:
   Hubungkan selector tool ke endpoint bridge MCP (`VITE_MCP_URL`) untuk memanggil tools secara dinamis saat LLM menghasilkan tool calls.
# chatbot-intent

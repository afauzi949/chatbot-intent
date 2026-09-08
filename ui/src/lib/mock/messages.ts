import type { ChatMessage } from '../../types';

export const mockMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      role: 'user',
      content: 'Tolong cek transaksi dengan RRN 123456789012',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'msg-1-2',
      role: 'assistant',
      content: `Saya menemukan transaksi dengan RRN **123456789012**:

| Field | Detail |
|-------|--------|
| **RRN** | 123456789012 |
| **Tanggal** | 30 Agustus 2026 |
| **Jumlah** | Rp 2.500.000 |
| **Status** | ✅ Berhasil |
| **Merchant** | Toko Elektronik ABC |
| **Tipe** | Pembayaran |

Transaksi ini berhasil diproses pada pukul 14:32 WIB. Apakah ada yang ingin Anda tanyakan lebih lanjut tentang transaksi ini?`,
      createdAt: new Date().toISOString(),
      modelId: 'gemini-3.7-flash',
      intent: 'cek_transaksi',
      mcpTools: ['postgres-query'],
      toolExecutions: [
        { id: 'te-1', name: 'PostgreSQL Query', status: 'success', durationMs: 320 },
      ],
      responseTimeMs: 1200,
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      role: 'user',
      content: 'Rekomendasikan tempat wisata di Banggai Kepulauan',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'msg-2-2',
      role: 'assistant',
      content: `Berikut rekomendasi wisata di **Banggai Kepulauan** 🏝️:

## 1. Pulau Bandang
Pulau eksotis dengan pantai pasir putih dan air laut yang jernih. Cocok untuk snorkeling dan diving.

## 2. Taman Laut Banggai
Terkenal dengan **Banggai Cardinalfish** (*Pterapogon kauderni*), ikan endemik yang hanya ditemukan di perairan Banggai.

## 3. Pantai Paisuluno
Pantai berpasir putih dengan pemandangan sunset yang menakjubkan.

## 4. Air Terjun Salodik
Air terjun tersembunyi di tengah hutan tropis yang masih alami.

---

### Tips Perjalanan

\`\`\`
Waktu terbaik: April - Oktober (musim kemarau)
Akses: Pesawat ke Luwuk → kapal ke Banggai
Durasi ideal: 3-5 hari
Budget: Rp 3-5 juta/orang
\`\`\`

Apakah Anda ingin informasi lebih detail tentang salah satu destinasi?`,
      createdAt: new Date().toISOString(),
      modelId: 'gemini-3.7-flash',
      intent: 'cari_wisata',
      mcpTools: ['tourism-search', 'document-search'],
      toolExecutions: [
        { id: 'te-2', name: 'Tourism Search', status: 'success', durationMs: 450 },
        { id: 'te-3', name: 'Document Search', status: 'success', durationMs: 180 },
      ],
      responseTimeMs: 2100,
    },
    {
      id: 'msg-2-3',
      role: 'user',
      content: 'Ceritakan lebih detail tentang Pulau Bandang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'msg-2-4',
      role: 'assistant',
      content: `# Pulau Bandang 🏝️

Pulau Bandang adalah salah satu permata tersembunyi di Kabupaten Banggai Kepulauan, Sulawesi Tengah.

## Daya Tarik Utama

- **Pantai pasir putih** sepanjang 2 km
- **Terumbu karang** yang masih pristine
- **Spot diving** kelas dunia dengan visibility hingga 30 meter
- **Hutan mangrove** yang kaya biodiversitas

## Cara Menuju Pulau Bandang

\`\`\`python
# Contoh rute perjalanan
routes = {
    "dari_jakarta": [
        "Jakarta → Luwuk (pesawat, ~3 jam)",
        "Luwuk → Banggai (speedboat, ~2 jam)",
        "Banggai → Pulau Bandang (perahu, ~45 menit)"
    ],
    "estimasi_biaya": {
        "pesawat": "Rp 1.500.000 - 2.500.000",
        "speedboat": "Rp 150.000",
        "perahu_lokal": "Rp 50.000"
    }
}
\`\`\`

## Akomodasi

| Tipe | Harga/Malam | Rating |
|------|-------------|--------|
| Homestay lokal | Rp 150.000 | ⭐⭐⭐ |
| Penginapan pantai | Rp 300.000 | ⭐⭐⭐⭐ |
| Resort | Rp 750.000 | ⭐⭐⭐⭐⭐ |

Mau saya carikan informasi booking atau akomodasi lainnya?`,
      createdAt: new Date().toISOString(),
      modelId: 'gemini-3.7-flash',
      intent: 'tanya_detail_wisata',
      mcpTools: ['tourism-search'],
      toolExecutions: [
        { id: 'te-4', name: 'Tourism Search', status: 'success', durationMs: 380 },
      ],
      responseTimeMs: 1800,
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      role: 'user',
      content: 'Carikan hotel dekat pantai di Banggai Kepulauan',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'msg-3-2',
      role: 'assistant',
      content: `Berikut daftar hotel dekat pantai di Banggai Kepulauan:

### 🏨 Hotel & Penginapan

1. **Grand Banggai Beach Resort**
   - Lokasi: Pantai Paisuluno
   - Harga: Rp 500.000 - 1.200.000/malam
   - Rating: ⭐⭐⭐⭐

2. **Seaside Homestay Banggai**
   - Lokasi: Pelabuhan Banggai
   - Harga: Rp 200.000 - 350.000/malam
   - Rating: ⭐⭐⭐

3. **Island View Cottage**
   - Lokasi: Pulau Bandang
   - Harga: Rp 400.000 - 800.000/malam
   - Rating: ⭐⭐⭐⭐⭐

> **Tip**: Untuk pengalaman terbaik, pesan minimal 2 minggu sebelumnya terutama di musim liburan.

Ingin saya bantu dengan proses booking?`,
      createdAt: new Date().toISOString(),
      modelId: 'claude-sonnet-4.6',
      intent: 'cari_wisata',
      mcpTools: ['tourism-search', 'postgres-query'],
      toolExecutions: [
        { id: 'te-5', name: 'Tourism Search', status: 'success', durationMs: 290 },
        { id: 'te-6', name: 'PostgreSQL Query', status: 'success', durationMs: 210 },
      ],
      responseTimeMs: 1600,
    },
  ],
  'conv-4': [
    {
      id: 'msg-4-1',
      role: 'user',
      content: 'Transaksi saya gagal, RRN 987654321098. Kenapa?',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'msg-4-2',
      role: 'assistant',
      content: `Saya sudah memeriksa transaksi dengan RRN **987654321098**. Berikut detailnya:

| Field | Detail |
|-------|--------|
| **RRN** | 987654321098 |
| **Tanggal** | 28 Agustus 2026 |
| **Jumlah** | Rp 5.000.000 |
| **Status** | ❌ Gagal |
| **Error Code** | \`E-51\` |
| **Deskripsi** | Insufficient funds |

## Penyebab Kegagalan

Error code \`E-51\` menunjukkan bahwa saldo rekening tidak mencukupi pada saat transaksi dilakukan.

## Langkah Selanjutnya

1. Pastikan saldo mencukupi sebelum melakukan transaksi ulang
2. Periksa apakah ada limit harian yang terlampaui
3. Jika masalah berlanjut, hubungi bank penerbit kartu Anda

\`\`\`
Response Code: 51
Description: Insufficient Funds
Action: Check account balance and retry
\`\`\`

Apakah ada yang bisa saya bantu lagi?`,
      createdAt: new Date().toISOString(),
      modelId: 'gemini-3.1-pro',
      intent: 'cek_transaksi',
      mcpTools: ['postgres-query'],
      toolExecutions: [
        { id: 'te-7', name: 'PostgreSQL Query', status: 'success', durationMs: 280 },
      ],
      responseTimeMs: 1400,
    },
  ],
  'conv-5': [],
  'conv-6': [],
};

// Mock response generator for simulating streaming
const mockResponses = [
  `Tentu! Berikut informasi yang Anda minta.

Saya telah mencari melalui database kami dan menemukan beberapa hasil yang relevan.

## Ringkasan

Data menunjukkan bahwa permintaan Anda dapat diproses dengan baik. Berikut detail lengkapnya:

| Parameter | Nilai |
|-----------|-------|
| **Status** | Aktif |
| **Terakhir Update** | Hari ini |
| **Sumber** | Database Internal |

Apakah ada yang perlu saya jelaskan lebih lanjut?`,

  `Berdasarkan pencarian, berikut hasilnya:

### Hasil Pencarian

1. **Item pertama** — Deskripsi singkat tentang item ini
2. **Item kedua** — Informasi tambahan yang relevan
3. **Item ketiga** — Detail lebih lanjut tersedia

\`\`\`sql
SELECT * FROM wisata
WHERE lokasi = 'Banggai Kepulauan'
ORDER BY rating DESC
LIMIT 10;
\`\`\`

> Data ini diambil dari database internal dan mungkin memerlukan verifikasi lebih lanjut.

Semoga membantu! 😊`,

  `Saya akan membantu Anda dengan permintaan tersebut.

## Analisis

Setelah memeriksa data yang tersedia, berikut temuan saya:

- ✅ Data ditemukan dan valid
- ✅ Tidak ada anomali terdeteksi
- ⚠️ Beberapa field memerlukan update

### Rekomendasi

\`\`\`python
# Langkah-langkah yang disarankan
steps = [
    "Verifikasi data input",
    "Proses validasi",
    "Konfirmasi hasil"
]

for i, step in enumerate(steps, 1):
    print(f"{i}. {step}")
\`\`\`

Apakah Anda ingin saya melanjutkan dengan langkah-langkah tersebut?`,
];

export function getRandomMockResponse(): string {
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

export function getMockToolExecutions(): { id: string; name: string; status: 'success'; durationMs: number }[] {
  const tools = [
    { name: 'Tourism Search', durationMs: 250 + Math.floor(Math.random() * 300) },
    { name: 'PostgreSQL Query', durationMs: 150 + Math.floor(Math.random() * 250) },
    { name: 'Document Search', durationMs: 100 + Math.floor(Math.random() * 200) },
  ];

  const count = Math.random() > 0.4 ? Math.floor(Math.random() * 2) + 1 : 0;
  const selected = tools.sort(() => Math.random() - 0.5).slice(0, count);

  return selected.map((t, i) => ({
    id: `te-gen-${Date.now()}-${i}`,
    name: t.name,
    status: 'success' as const,
    durationMs: t.durationMs,
  }));
}

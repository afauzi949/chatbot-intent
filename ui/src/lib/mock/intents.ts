import type { Intent } from '../../types';

export const mockIntents: Intent[] = [
  { id: 'auto', name: 'Auto', description: 'Automatically detect intent' },
  { id: 'greet', name: 'Greet', description: 'Greeting' },
  { id: 'goodbye', name: 'Goodbye', description: 'Farewell' },
  { id: 'cari_wisata', name: 'Cari Wisata', description: 'Search tourism destinations' },
  { id: 'tanya_detail_wisata', name: 'Detail Wisata', description: 'Ask tourism details' },
  { id: 'cek_transaksi', name: 'Cek Transaksi', description: 'Check transaction' },
  { id: 'cek_status_booking', name: 'Status Booking', description: 'Check booking status' },
  { id: 'nlu_fallback', name: 'Fallback', description: 'Unrecognized intent' },
];

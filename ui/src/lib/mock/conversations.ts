import type { Conversation } from '../../types';

const now = new Date();
const today = now.toISOString();
const yesterday = new Date(now.getTime() - 86400000).toISOString();
const twoDaysAgo = new Date(now.getTime() - 86400000 * 2).toISOString();
const threeDaysAgo = new Date(now.getTime() - 86400000 * 3).toISOString();
const fiveDaysAgo = new Date(now.getTime() - 86400000 * 5).toISOString();
const tenDaysAgo = new Date(now.getTime() - 86400000 * 10).toISOString();

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Cek transaksi dengan RRN',
    modelId: 'gemini-3.7-flash',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'conv-2',
    title: 'Rekomendasi wisata Bangkep',
    modelId: 'gemini-3.7-flash',
    createdAt: today,
    updatedAt: today,
  },
  {
    id: 'conv-3',
    title: 'Cari hotel dekat pantai',
    modelId: 'claude-sonnet-4.6',
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: 'conv-4',
    title: 'Transaksi gagal — penjelasan',
    modelId: 'gemini-3.1-pro',
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: 'conv-5',
    title: 'Bandingkan model AI',
    modelId: 'claude-opus-4.6',
    createdAt: threeDaysAgo,
    updatedAt: fiveDaysAgo,
  },
  {
    id: 'conv-6',
    title: 'Pencarian dokumen wisata',
    modelId: 'gemini-3.7-flash',
    createdAt: tenDaysAgo,
    updatedAt: tenDaysAgo,
  },
];

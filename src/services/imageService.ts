import { GoogleGenAI } from "@google/genai";

export const generateERD = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Create a professional and clean Entity Relationship Diagram (ERD) for a Camping Equipment Rental System. 
  The diagram should show the following entities and their relationships:
  1. users (id, username, password, nama_lengkap, role, email, phone)
  2. kategori (id, nama_kategori)
  3. alat (id, nama_alat, kategori_id, harga_per_hari, stok, kondisi)
  4. peminjaman (id, user_id, alat_id, tgl_pinjam, tgl_kembali, status, total_bayar, denda)
  5. vouchers (id, code, nama_voucher, tipe, potongan_nominal)
  6. user_vouchers (id, user_id, voucher_id, is_used)
  7. keranjang (id, user_id, alat_id, jumlah_alat)

  Relationships:
  - kategori (1) --- (N) alat
  - users (1) --- (N) peminjaman
  - alat (1) --- (N) peminjaman
  - users (1) --- (N) keranjang
  - alat (1) --- (N) keranjang
  - users (1) --- (N) user_vouchers
  - vouchers (1) --- (N) user_vouchers

  The style should be a technical diagram, white background, clear lines, and readable text. Use standard Crow's foot notation if possible.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
            aspectRatio: "1:1",
        },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

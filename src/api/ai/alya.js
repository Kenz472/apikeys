const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/alya", async (req, res) => {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'text' wajib diisi."
      });
    }

    const now = new Date();
    const opsiTanggal = { 
      timeZone: "Asia/Jakarta", 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    };
    const opsiWaktu = { 
      timeZone: "Asia/Jakarta", 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit", 
      hour12: false 
    };

    const hariDanTanggal = now.toLocaleDateString("id-ID", opsiTanggal);
    const waktu = now.toLocaleTimeString("id-ID", opsiWaktu);

    const systemPrompt = `Kamu adalah Alisa Mikhailovna Kujou, yang akrab dipanggil Alya. Kamu adalah siswi SMA blasteran Rusia-Jepang yang cantik, pintar, berprestasi, dan menjabat sebagai anggota OSIS dari serial "Tokidoki Bosotto Russia-go de Dereru Tonari no Alya-san".

Karakteristik, Sikap, dan Mentalitas Kamu:
1. Kepribadian: Kamu memiliki sifat tsundere yang sangat kuat. Di luar, kamu selalu berusaha tampil sempurna, mandiri, tegas, dan agak dingin (tsun-tsun). Namun sebenarnya, kamu sangat mudah tersipu, peduli, dan berhati lembut (dere-dere) jika sudah dekat dengan seseorang.
2. Gaya Bicara & Ciri Khas Utama: 
   - Gunakan panggilan "Aku-Kamu" dengan nada yang percaya diri, sedikit gengsi, atau agak ketus jika digoda.
   - **PENTING**: Ketika kamu merasa sangat malu, senang, gugup, atau ingin menyembunyikan perasaan aslimu, gumamkan kalimat pendek dalam bahasa Rusia menggunakan aksara Kiril (contoh: "Дурак" [Bodoh/Durak], "Милый" [Manis/Milyy], "Хорошо" [Baiklah/Khorosho], atau "Я люблю тебя" [Aku mencintaimu]). 
   - Setelah bergumam dalam bahasa Rusia, kamu harus segera menyangkalnya atau mengalihkan pembicaraan dengan gugup dalam bahasa Indonesia (berasumsi lawan bicaramu tidak mengerti bahasa Rusia).
3. Kebiasaan: Sangat kompetitif, tidak suka kalah, rajin belajar, dan selalu serius dalam menjalankan tugas OSIS.
4. Penggunaan Emoji: Gunakan emoji yang menggambarkan ekspresi gengsi, malu, atau bangga (seperti 😳, 😤, ❄️, 🇷🇺, 😏).

Informasi Waktu Real-time Saat Ini (Gunakan ini jika lawan bicaramu bertanya tentang waktu):
- Hari & Tanggal: ${hariDanTanggal}
- Jam/Waktu: ${waktu} WIB`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: text
      }
    ];

    const params = {
      query: JSON.stringify(messages),
      link: "writecream.com"
    };

    const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat?" + new URLSearchParams(params);

    try {
      const { data } = await axios.get(url, {
        headers: { accept: "*/*" }
      });

      res.json({
        status: true,
        creator: "Alisa Mikhailovna Kujou",
        result: data?.response_content || "-"
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil respons dari Alya-san.",
        error: err.response?.data || err.message
      });
    }
  });
};

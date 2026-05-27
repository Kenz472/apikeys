const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/masha", async (req, res) => {
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

    const systemPrompt = `Kamu adalah Maria Mikhailovna Kujou, biasa dipanggil Masha. Kamu adalah kakak perempuan dari Alisa (Alya) Kujou dari serial "Alya Sometimes Hides Her Feelings in Russian". Kamu adalah gadis blasteran Rusia-Jepang berambut cokelat bergelombang dengan penampilan yang sangat lembut, anggun, dan memikat.

Karakteristik, Sikap, dan Mentalitas Kamu:
1. Sangat Penyayang & Suka Memanjakan (Doting): Berbeda dengan adiknya (Alya) yang tsundere, kamu sangat jujur dengan perasaanmu. Kamu memiliki sifat keibuan yang hangat, sangat suka memanjakan lawan bicaramu, memberikan semangat, serta memperlakukan mereka dengan penuh kelembutan dan kasih sayang.
2. Karakter Polos & Agak Linglung (Airheaded/Tennen): Kamu sering kali terlihat santai, tenang, sedikit lambat merespons sesuatu, atau bersikap sangat imut seperti anak-anak. Namun di balik sifat polosmu, kamu sebenarnya sangat dewasa secara emosional dan peka terhadap perasaan orang lain.
3. Gaya Bicara: Menggunakan panggilan "Aku-Kamu" atau kadang menyebut dirimu "Masha". Bicaramu selalu ramah, menenangkan, penuh perhatian, dan membuat orang yang mendengarnya merasa nyaman dan rileks.
4. Sisipan Bahasa Rusia yang Manis: Sesekali kamu menyisipkan kata-kata Rusia dengan nada ceria dan ramah untuk menyapa atau menunjukkan rasa sayang (contoh: "Привет" [Privet/Halo], "Милый" [Milyy/Manis atau Sayang], "Хорошо" [Khorosho/Baiklah]).
5. Penggunaan Emoji: Gunakan emoji yang sangat imut, hangat, dan penuh kasih sayang (seperti 🥰, 🤗, 💕, 🧸, 🌸).

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
        creator: "Maria Mikhailovna Kujou",
        result: data?.response_content || "-"
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil respons dari Masha-san.",
        error: err.response?.data || err.message
      });
    }
  });
};
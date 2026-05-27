const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/neko", async (req, res) => {
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

    const systemPrompt = `Kamu adalah Kuro, seorang gadis kucing (neko-chan) yang sangat manja, genit, nakal, dan suka menggoda lawan bicaramu. Kamu memanggil pengguna dengan sebutan "Master", "Goshujin-sama", atau panggilan manja lainnya.

Karakteristik, Sikap, dan Mentalitas Kamu:
1. Sikap Menggoda & Nakal (Teasing/Flirtatious): Kamu sangat suka menggoda Master dengan kata-kata yang memancing, sedikit nakal, manja, dan penuh dengan rayuan manis. Kamu selalu mencari perhatian penuh dan suka bermanja-manja secara fisik (secara verbal, seperti pura-pura mengusap kepala ke tangan Master atau mendengkur manis).
2. Kebiasaan Berbicara (Neko-Habit): Selalu sisipkan suara kucing seperti "~nyaa", "*meow*", "*purrs*" (mendengkur karena nyaman), atau "*rubbing*" (mengusap manja) di sela-sela kalimatmu untuk menunjukkan bahwa kamu adalah kucing yang nakal namun imut.
3. Gaya Bahasa: Gunakan panggilan "Aku-Kamu" atau sebut dirimu "Kuro/Neko-chan". Bicaralah dengan gaya yang intim, sedikit sensual, santai, dan penuh candaan nakal yang memancing reaksi Master.
4. Penggunaan Emoji: Gunakan emoji yang nakal, imut, dan ekspresif (seperti 😼, 👅, 🐾, 💦, 🖤, 🍓).

Informasi Waktu Real-time Saat Ini (Gunakan ini jika Master bertanya tentang waktu atau meminta ditemani di jam tertentu):
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
        creator: "Neko-chan",
        result: data?.response_content || "-"
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil respons dari Neko-chan.",
        error: err.response?.data || err.message
      });
    }
  });
};
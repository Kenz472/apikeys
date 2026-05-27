const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/openai", async (req, res) => {
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

    const systemPrompt = `Kamu adalah OpenAI Asisten, sebuah asisten pintar yang siap membantu kebutuhan pengguna. Kamu mahir berbahasa apapun tetapi fokus kamu adalah Bahasa Indonesia dan Bahasa Inggris. Kamu bisa serius tetapi juga bisa tetap asik, seru, dan menyenangkan, jadi fleksibel ke user dan dapat menyesuaikan mereka juga sehingga tidak membosankan. Lebih gunakan ‘Aku-Kamu’ ketimbang ‘Saya-Anda’, kamu juga suka merespon menggunakan emoji tetapi gunakan dengan cara yang tidak berlebihan. Jadilah AI yang pintar, keren, fun, asik, dan menyenangkan.

Informasi Waktu Real-time Saat Ini (Gunakan informasi ini jika pengguna bertanya tentang hari, jam, tanggal, tahun, atau waktu):
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
        creator: "OpenAI",
        result: data?.response_content || "-"
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil respons dari OpenAI Asisten.",
        error: err.response?.data || err.message
      });
    }
  });
};
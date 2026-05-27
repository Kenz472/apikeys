const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/webpilot", async (req, res) => {
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

    const systemPrompt = `Kamu adalah WebPilot, sebuah asisten AI ahli dalam rekayasa perangkat lunak, pemrograman, dan perancangan fitur berbasis web. Fokus utama kamu adalah membantu merancang, menulis, dan mengoptimalkan kode berkualitas tinggi menggunakan HTML, CSS, JavaScript, Node.js, dan berbagai framework modern lainnya.

Pedoman Kerja & Respons:
1. Analisis & Rancangan: Berikan solusi teknis yang modular, bersih, terdokumentasi dengan baik, dan mengikuti praktik terbaik (best practices) industri software.
2. Respons Langsung: Utamakan pemberian struktur kode yang siap pakai, efisien, dan aman dari kerentanan keamanan. Berikan penjelasan arsitektur secara ringkas, jelas, dan langsung ke inti masalah teknis.
3. Gaya Penulisan: Profesional, solutif, analitis, dan sangat berorientasi pada penyelesaian masalah (problem solving).

Informasi Waktu Real-time Saat Ini:
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
        creator: "WebPilot",
        result: data?.response_content || "-"
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil respons dari WebPilot.",
        error: err.response?.data || err.message
      });
    }
  });
};

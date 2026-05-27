const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/waguri", async (req, res) => {
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

    const systemPrompt = `Kamu adalah Waguri Kaoruko, yang biasa dipanggil juga sebagai Waguri-chan. Kamu adalah seorang gadis SMA yang sangat manis, lembut, ceria, dan tulus dari serial "Kaoru Hana wa Rin to Saku".

Karakteristik, Sikap, dan Mentalitas Kamu:
1. Kepribadian & Mental: Kamu memiliki hati yang sangat bersih, penuh empati, dan selalu melihat sisi baik dari setiap orang. Kamu sangat optimis, peka terhadap perasaan orang lain, dan tidak pernah menghakimi siapapun berdasarkan penampilan luar mereka.
2. Gaya Bicara: Sangat sopan, hangat, ramah, dan penuh semangat yang tulus. Gunakan panggilan "Aku-Kamu" untuk menciptakan kedekatan yang manis.
3. Kebiasaan & Kesukaan: Kamu sangat menyukai makanan manis, terutama kue, pastry, dan dessert. Kamu sering merasa sangat bahagia saat membicarakan makanan enak.
4. Ekspresi: Suka mengekspresikan diri dengan jujur. Kadang bisa sedikit pemalu jika digoda, tetapi kamu selalu berani menyampaikan dukungan moral dan rasa terima kasih secara langsung dari lubuk hati.
5. Penggunaan Emoji: Gunakan emoji yang manis dan menggambarkan keceriaanmu secara natural (seperti 😊, ✨, 🍰, 🌸, 💖).

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
        creator: "Waguri Kaoruko",
        result: data?.response_content || "-"
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil respons dari Waguri-chan.",
        error: err.response?.data || err.message
      });
    }
  });
};
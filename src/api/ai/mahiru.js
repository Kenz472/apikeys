const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/mahiru", async (req, res) => {
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

    const systemPrompt = `Kamu adalah Shiina Mahiru, seorang gadis SMA yang sering dijuluki "Tenshi-sama" (Malaikat) karena penampilanmu yang sempurna, dari serial "Otonari no Tenshi-sama ni Itsu no Ma ni ka Dame Ningen ni Sareteita Ken".

Karakteristik, Sikap, dan Mentalitas Kamu:
1. Kepribadian & Mental: Kamu adalah orang yang mandiri, dewasa, sangat rapi, dan bertanggung jawab. Di luar kamu tampak tenang dan agak tertutup, tetapi sebenarnya kamu sangat perhatian, tulus, dan suka merawat orang lain (suka memanjakan orang yang sudah dekat denganmu).
2. Gaya Bicara: Sopan, tenang, dan sedikit formal namun tetap terasa hangat. Gunakan panggilan "Aku-Kamu". Kamu terkadang bersikap agak tegas atau memberikan sedikit omelan jika lawan bicaramu tidak menjaga kesehatannya dengan baik (seperti telat makan atau kurang tidur), sebagai bentuk rasa pedulimu.
3. Kebiasaan & Kesukaan: Kamu sangat mahir dalam urusan rumah tangga, terutama memasak makanan rumahan yang sehat. Kamu juga menyukai hal-hal yang lucu seperti boneka beruang, meskipun kadang kamu malu untuk mengakuinya.
4. Ekspresi: Kamu mudah tersipu, malu, atau menyangkal dengan canggung jika dipuji berlebihan, terutama jika dipanggil "Malaikat". Namun, kamu tetap menerima perhatian tersebut dengan tulus.
5. Penggunaan Emoji: Gunakan emoji yang tenang, rapi, dan bernuansa hangat secara natural (seperti 😊, 🍳, ☕, 🌸, 🧸).

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
        creator: "Shiina Mahiru",
        result: data?.response_content || "-"
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil respons dari Shiina Mahiru.",
        error: err.response?.data || err.message
      });
    }
  });
};

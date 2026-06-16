const axios = require('axios');
const cheerio = require("cheerio");

module.exports = function(app) {
    async function getBokep() {
        try {
            // 1. Ambil HTML halaman
            let { data } = await axios.get(`https://cidey.biz/e/${Math.random().toString(36).substr(2, 6)}.mp4`);
            let $ = cheerio.load(data);
            let videoUrl = $('source').attr('src');
            
            if (!videoUrl) throw new Error("Video tidak ditemukan");

            // 2. Ambil data video sebagai ArrayBuffer
            let response = await axios.get(videoUrl, {
                responseType: 'arraybuffer'
            });

            return response.data; // Ini adalah buffer-nya
        } catch (e) {
            throw e;
        }
    }

    app.get('/nsfw/bokep', async (req, res) => {
        try {
            const videoBuffer = await getBokep();
            
            // Mengirim buffer ke client
            res.writeHead(200, {
                'Content-Type': 'video/mp4', // Ubah ke video/mp4
                'Content-Length': videoBuffer.length,
            });
            res.end(videoBuffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};

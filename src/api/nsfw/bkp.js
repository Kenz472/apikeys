const axios = require('axios');

module.exports = function(app) {
    function generateRandomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    async function getVideoUrl() {
        try {
            let urlList = [
                "https://viday.uk/v/viral",
                "https://viday.uk/v/trending",
                "https://viday.uk/v/live",
                "https://viday.uk/v/populer"
            ];

            let selectedUrlBase = urlList[Math.floor(Math.random() * urlList.length)];
            // Catatan: Jika randomId sering tidak ditemukan, sebaiknya ambil HTML dari kategori saja
            const { data: html } = await axios.get(selectedUrlBase, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            // Cari semua MP4 di halaman tersebut
            const matches = html.match(/src=["']([^"']+\.mp4[^"']*)["']/gi);

            if (matches) {
                // Ambil satu secara acak dari yang benar-benar ada di halaman
                let videoUrl = matches[Math.floor(Math.random() * matches.length)].replace(/src=|["']/g, "");
                if (videoUrl.startsWith('//')) videoUrl = 'https:' + videoUrl;
                return videoUrl;
            }
            return null;
        } catch (e) {
            console.log('Error ambil video:', e.message);
            return null;
        }
    }

    app.get('/nsfw/bokep', async (req, res) => {
        try {
            const videoUrl = await getVideoUrl();
            if (!videoUrl) return res.status(404).send('Video tidak ditemukan');

            // Ambil Range header dari browser (untuk fitur Fast Forward)
            const range = req.headers.range;

            const videoResponse = await axios({
                method: 'get',
                url: videoUrl,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Range': range // Teruskan range request browser ke sumber video
                }
            });

            // Teruskan status dan headers (PENTING untuk seek/durasi)
            res.writeHead(videoResponse.status, videoResponse.headers);
            
            // Pipe stream video langsung ke client
            videoResponse.data.pipe(res);

        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
const axios = require('axios');

module.exports = function(app) {
    async function getMediaSource() {
        try {
            const categories = [
                "https://viday.uk/v/viral",
                "https://viday.uk/v/trending",
                "https://viday.uk/v/live",
                "https://viday.uk/v/populer"
            ];
            const target = categories[Math.floor(Math.random() * categories.length)];
            const { data: html } = await axios.get(target, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const matches = html.match(/src=["']([^"']+\.mp4[^"']*)["']/gi);
            if (matches) {
                let url = matches[Math.floor(Math.random() * matches.length)].replace(/src=|["']/g, "");
                return url.startsWith('//') ? 'https:' + url : url;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    app.get('/nsfw/bokep', async (req, res) => {
        try {
            const videoUrl = await getMediaSource();
            if (!videoUrl) return res.status(404).send('Not Found');

            const range = req.headers.range;
            const videoStream = await axios({
                method: 'get',
                url: videoUrl,
                responseType: 'stream',
                headers: { 'Range': range, 'User-Agent': 'Mozilla/5.0' }
            });

            res.writeHead(videoStream.status, {
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes',
                ...videoStream.headers
            });

            videoStream.data.pipe(res);
        } catch (error) {
            res.status(500).send('Error');
        }
    });
};
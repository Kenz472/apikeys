const yts = require('yt-search');
    
module.exports = function(app) {
app.get('/search/youtube', async (req, res) => {
        const { text } = req.query;
        if (!text) {
            return res.status(400).json({ status: false, error: 'Query is required' });
        }
        try {
            const ytResults = await yts.search(text);
            const ytTracks = ytResults.videos.map(video => ({
                title: video.title,
                channel: video.author.name,
                duration: video.duration.timestamp,
                imageUrl: video.thumbnail,
                link: video.url
            }));
            res.status(200).json({
                status: true,
                result: ytTracks
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
}
const axios = require("axios");
const https = require("https");

async function pixivsearch(characterName, r18 = false) {
  const agent = new https.Agent({ rejectUnauthorized: false })
  const encodedCharacterName = encodeURIComponent(characterName)
  const mode = r18 ? 'r18' : 'all'
  const searchUrl = `https://www.pixiv.net/ajax/search/artworks/${encodedCharacterName}?word=${encodedCharacterName}&order=date_d&mode=${mode}&p=1&s_mode=s_tag_full&type=illust&lang=en`

  try {
    const searchResponse = await axios.get(searchUrl, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.pixiv.net/'
      },
      timeout: 10000
    })

    const data = searchResponse.data
    if (!data.body?.illustManga?.data?.length) return null

    const artwork = data.body.illustManga.data[Math.floor(Math.random() * data.body.illustManga.data.length)]
    const detailUrl = `https://www.pixiv.net/ajax/illust/${artwork.id}`
    const detailResponse = await axios.get(detailUrl, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://www.pixiv.net/artworks/${artwork.id}`
      }
    })

    const hdUrl = detailResponse.data.body.urls.original
    const imageResponse = await axios.get(hdUrl.replace('_webp', ''), {
      responseType: 'arraybuffer',
      httpsAgent: agent,
      headers: {
        'Referer': 'https://www.pixiv.net/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    })

    return {
      buffer: Buffer.from(imageResponse.data),
      caption:
        `${characterName} - Artwork${r18 ? ' (R-18)' : ''}\n` +
        `Judul: ${artwork.title}\n` +
        `Author: ${artwork.userName}\n` +
        `Tags: ${artwork.tags.join(", ")}\n` +
        `https://www.pixiv.net/artworks/${artwork.id}\n\n` +
        `${wm}`
    }
  } catch (error) {
    throw error
  }
}
module.exports = function(app) {
app.get('/search/pixiv', async (req, res) => {
       const { text } = req.query
        try {
            const results = await SnackVid(text);  
            res.status(200).json({
                status: true,
                result: results
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});

}
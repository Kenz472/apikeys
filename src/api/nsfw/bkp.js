const axios = require('axios');

module.exports = function(app) {
    function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
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
    let randomId = generateRandomString(8);
    const apiUrl = `${selectedUrlBase}=${randomId}`; 

    const { data: html } = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    const match = html.match(/<source[^>]+src=["']([^"']+\.mp4)["']/i);

    if (match && match[1]) {
      let videoUrl = match[1]; 
      let response = await axios.get(videoUrl, {
                responseType: 'arraybuffer'
            });
            return response.data;
    } else {
      console.log('Tidak ada URL video MP4 yang ditemukan dalam respons.');
      return null;
    }
  } catch (e) {
    console.log('Error ambil video:', e.message);
    return e.message; 
  }
}
    app.get('/nsfw/bokep', async (req, res) => {
        try {
            const videoBuffer = await getVideoUrl();
            
            // Mengirim buffer ke client
            res.writeHead(200, {
                'Content-Type': 'video/mp4',
                'Content-Length': videoBuffer.length,
            });
            res.end(videoBuffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};

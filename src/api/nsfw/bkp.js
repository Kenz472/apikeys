const axios = require('axios');
const cheerio = require('cheerio');

async function videyly() {
  try {
    let { data: Html1 } = await axios.get("https://videyly.site");
    let $ = cheerio.load(Html1);
    const urlrl = $('iframe#v').attr('src');
    if (!urlrl) throw new Error("Iframe tidak ditemukan");

    let { data: Html2 } = await axios.get(urlrl);
    let $$ = cheerio.load(Html2);
    const video = $$('video source');
    const downurl = video.attr('src');
    
    if (!downurl) throw new Error("Source video tidak ditemukan di videyly");
    return downurl;
  } catch (e) {
    throw new Error(`videyly: ${e.message}`);
  }
}

async function getVideoUrl() {
  try {
    const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let random = '';
    for (let i = 0; i < 5; i++) {
      random += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const response = await axios.get(`https://viday.uk/v/?viral=${random}`);
    const $ = cheerio.load(response.data);
    const videoUrl = $('#videoPlayer source').attr('src');
    
    if (!videoUrl) {
      throw new Error('Video URL tidak ditemukan di viday');
    }

    return videoUrl;
  } catch (error) {
    throw new Error(`getVideoUrl: ${error.message}`);
  }
}

module.exports = function(app) {
    app.get('/nsfw/bokep', async (req, res) => {
        try {
            const pilihSumber = Math.random() < 0.5;
            let videoUrl = "";

            if (pilihSumber) {
                videoUrl = await videyly();
            } else {
                videoUrl = await getVideoUrl();
            }

            if (!videoUrl) {
                return res.status(404).send("Gagal mendapatkan URL video.");
            }

            // Membaca header 'Range' dari browser pengguna (untuk fitur mempercepat video)
            const range = req.headers.range;
            const axiosHeaders = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            };

            if (range) {
                axiosHeaders['Range'] = range;
            }

            // Ambil data stream dari link video asli
            const videoResponse = await axios({
                method: 'get',
                url: videoUrl,
                responseType: 'stream',
                headers: axiosHeaders
            });

            // Kirim header respon yang tepat agar browser tahu video ini bisa dipercepat (Accept-Ranges: bytes)
            res.writeHead(videoResponse.status, {
                'Content-Type': videoResponse.headers['content-type'] || 'video/mp4',
                'Content-Length': videoResponse.headers['content-length'],
                'Content-Range': videoResponse.headers['content-range'],
                'Accept-Ranges': 'bytes'
            });

            // Membaca data stream dari link lalu menulisnya ke respon dan diakhiri dengan res.end()
            videoResponse.data.on('data', (chunk) => {
                res.write(chunk);
            });

            videoResponse.data.on('end', () => {
                res.end();
            });

            videoResponse.data.on('error', (err) => {
                res.end();
            });

        } catch (error) {
            if (!res.headersSent) {
                res.status(500).send(`Error: ${error.message}`);
            }
        }
    });
};

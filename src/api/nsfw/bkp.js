const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'Referer': 'https://videyly.site/'
};

async function videyly() {
  try {
    let { data: Html1 } = await axios.get("https://videyly.site", { headers });
    let $ = cheerio.load(Html1);
    let urlrl = $('iframe#v').attr('src');
    
    if (!urlrl) throw new Error('Iframe tidak ditemukan');

    if (urlrl.startsWith('//')) {
      urlrl = 'https:' + urlrl;
    } else if (urlrl.startsWith('/')) {
      urlrl = 'https://videyly.site' + urlrl;
    }

    let { data: Html2 } = await axios.get(urlrl, { headers });
    let $$ = cheerio.load(Html2);
    const video = $$('video source');
    const downurl = video.attr('src');

    if (!downurl) throw new Error('Sumber video tidak ditemukan');
    return downurl;
  } catch (e) {
    throw new Error(e.message);
  }
}

async function getVideoUrl() {
  const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
  
  for (let i = 0; i < 5; i++) {
    try {
      let random = '';
      for (let j = 0; j < 5; j++) {
        random += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      const response = await axios.get(`https://viday.uk/v/?viral=${random}`, { headers, timeout: 5000 });
      const $ = cheerio.load(response.data);
      const videoUrl = $('#videoPlayer source').attr('src');
      
      if (videoUrl) {
        return videoUrl;
      }
    } catch (error) {
    }
  }
  throw new Error('Gagal mendapatkan video setelah beberapa percobaan');
}

module.exports = function(app) {
    
    app.get('/nsfw/bokep', async (req, res) => {
        let videoUrl = null;
        const useVideyly = Math.random() < 0.5;

        try {
            if (useVideyly) {
                try {
                    videoUrl = await videyly();
                } catch (e) {
                    videoUrl = await getVideoUrl();
                }
            } else {
                try {
                    videoUrl = await getVideoUrl();
                } catch (e) {
                    videoUrl = await videyly();
                }
            }

            if (!videoUrl) {
                return res.status(404).send('Video tidak ditemukan');
            }

            const clientHeaders = {
                'User-Agent': headers['User-Agent']
            };

            if (req.headers.range) {
                clientHeaders['Range'] = req.headers.range;
            }

            const videoResponse = await axios({
                method: 'get',
                url: videoUrl,
                responseType: 'stream',
                headers: clientHeaders,
                validateStatus: (status) => status >= 200 && status < 300
            });

            res.writeHead(videoResponse.status, {
                'Content-Type': videoResponse.headers['content-type'] || 'video/mp4',
                'Content-Length': videoResponse.headers['content-length'],
                'Content-Range': videoResponse.headers['content-range'],
                'Accept-Ranges': 'bytes'
            });

            videoResponse.data.pipe(res);

        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};

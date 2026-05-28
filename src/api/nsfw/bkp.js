const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'Referer': 'https://videyly.site/'
};

async function checkVideo(url) {
  if (!url) return false;
  try {
    const res = await axios.get(url, {
      headers: { ...headers, Range: 'bytes=0-0' },
      timeout: 4000
    });
    const contentType = res.headers['content-type'];
    return contentType && contentType.includes('video');
  } catch (e) {
    return false;
  }
}

async function videyly() {
  try {
    let { data: Html1 } = await axios.get("https://videyly.site", { headers, timeout: 5000 });
    let $ = cheerio.load(Html1);
    let urlrl = $('iframe#v').attr('src');
    
    if (!urlrl) return null;

    if (urlrl.startsWith('//')) {
      urlrl = 'https:' + urlrl;
    } else if (urlrl.startsWith('/')) {
      urlrl = 'https://videyly.site' + urlrl;
    }

    let { data: Html2 } = await axios.get(urlrl, { headers, timeout: 5000 });
    let $$ = cheerio.load(Html2);
    const video = $$('video source');
    const downurl = video.attr('src');

    return downurl || null;
  } catch (e) {
    return null;
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
      
      const response = await axios.get(`https://viday.uk/v/?viral=${random}`, { headers, timeout: 4000 });
      const $ = cheerio.load(response.data);
      const videoUrl = $('#videoPlayer source').attr('src');
      
      if (videoUrl) {
        return videoUrl;
      }
    } catch (error) {
    }
  }
  return null;
}

module.exports = function(app) {
    app.get('/nsfw/bokep', async (req, res) => {
        const sources = Math.random() < 0.5 ? [videyly, getVideoUrl] : [getVideoUrl, videyly];
        let finalUrl = null;

        for (const getSrc of sources) {
            try {
                const videoUrl = await getSrc();
                if (videoUrl) {
                    const isValid = await checkVideo(videoUrl);
                    if (isValid) {
                        finalUrl = videoUrl;
                        break;
                    }
                }
            } catch (error) {
            }
        }

        if (finalUrl) {
            res.redirect(finalUrl);
        } else {
            res.status(404).end();
        }
    });
};

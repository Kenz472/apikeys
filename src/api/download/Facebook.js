const axios = require('axios');
const cheerio = require('cheerio');

async function FbDown(Url) {
    try {        
        let media = {
            image: [],
            videos: []
        };
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Cookie': 'datr=RR3kaWFpP_eOlSCWZ_TIoDhp; sb=RR3kadvkCa0qqLmKuqs4jQR0; m_pixel_ratio=1.445365309715271; wd=424x942; c_user=100085688500541; xs=40%3ArRW7DGFVxdPCew%3A2%3A1778603968%3A-1%3A-1; fr=0bPwG3VZAPbOFlFnY.AWcP0zoc49j36CIFII7Xrc5o7ilL8ffOuSO00GkPnVLolGglXac.BqA1c2..AAA.0.0.BqA1fF.AWcCeLLjkADN8LV7MN8vJdxZ3qk; locale=id_ID; pas=100085688500541%3AS3LMl0zV8b; wl_cbv=v2%3Bclient_version%3A3158%3Btimestamp%3A1778603974; fbl_st=100624934%3BT%3A29643399; vpd=v1%3B811x424x1.445365309715271',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.facebook.com/',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        };

        const response = await axios.get(Url, {
            headers,
            maxRedirects: 5
        });
        const $ = cheerio.load(response.data || "");
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.startsWith('https://scontent') && !media.image.find(m => m.url === src)) {
                media.image.push({
                    type: 'image',
                    url: src
                });
            }
        });

        const home = await axios.get("https://fbdownloader.to/id");
        const $home = cheerio.load(home.data || "");
        const payload = new URLSearchParams({
            k_exp: $home('input[name="k_exp"]').val(),
            k_token: $home('input[name="k_token"]').val(),
            q: Url,
            lang: "id",
            v: "v2"
        });

        const {
            data
        } = await axios.post("https://fbdownloader.to/api/ajaxSearch", payload.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        if (data && data.data) {
            const $$ = cheerio.load(data.data);
            let videoUrl = $$('.table tbody tr').find('a').attr('href') || $$('input#audioUrl').val() || $$('video#vid').attr('src');
            if (videoUrl) {
                media.videos.push({
                    title: $$('.content h3').text().trim(),
                    duration: $$('.content p').text().trim(),
                    thumbnail: $$('.thumbnail img').attr('src'),
                    media: videoUrl
                });
            }
        }
        return {
            status: 'success',
            url: Url,
            media: media
        };
    } catch (e) {
        return {
            status: "error",
            message: e.message
        };
    }
}

module.exports = function (app) {
app.get('/download/facebook', async (req, res) => {
       const { url } = req.query
        try {
            const results = await FbDown(url);
            res.status(200).json({
                status: true,
                result: results.media
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}

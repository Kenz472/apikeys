const axios = require("axios");
const cheerio = require("cheerio");

async function SnackVid(text) {
        try {
            let res = await axios.post("https://www.snackvideo.com/rest/o/w/pwa/discover", {
                searchWord: text,
                pcursor: "0",
                fromUser: false,
                mobile: true,
                request_source: 1102,
                seoDefaultFilterV2: true,
                url: `https://www.snackvideo.com/discover/${text}`,
                need_ld_json: false,
                need_tdk: false,
                ai_content: false,
                count: 8
            }, {
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "id-ID,id;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5",
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
                    "sec-ch-ua-mobile": "?1",
                    "sec-ch-ua-platform": "\"Android\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "cookie": "webDid=8e884d79-91f8-43ee-bc4c-1fc4ebf3b73e; did=8e884d79-91f8-43ee-bc4c-1fc4ebf3b73e; webDidWithTime=8e884d79-91f8-43ee-bc4c-1fc4ebf3b73e_1737028639470; _ga=GA1.1.628636143.1737028649; kwai_uuid=a70c7b292cd772452cb8bada09d81f73; _gcl_au=1.1.1635895756.1749826881; _k_gid_collect=1; _k_cp=1; kpn=KWAI_BULLDOG; apptype=43; sys=KWAI_BULLDOG; client_type=3003; bucket=in; countryInfo=IDN; client_key=65890b29; sessionId=28763c90-75bb-4084-bdfe-ab1215e9e8a8; _ga_H7QQTWR2RN=GS2.1.s1749826880$o2$g1$t1749826928$j12$l0$h0; i18n_redirected=",
                    "Referer": "https://www.snackvideo.com/discover/cosplay",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                }
            });

            let json = res.data;
            let result = json.feeds.map(v => {
                return {
                    time: v.time,
                    caption: v.caption,
                    author: v.user_name,
                    url_author: `https://www.snackvideo.com/@${v.kwai_id}`,
                    comment: v.comment_count,
                    view: v.view_count,
                    likes: v.like_count,
                    videos: v.main_mv_urls[0].url,
                    url: `https://www.snackvideo.com/@${v.kwai_id}/video/${v.photo_id_str}?pwa_source=web_share`
                };
            });

            let hasil = result[Math.floor(Math.random() * result.length)];
            return {
                status: true,
                Author: nameown,
                Data: hasil
            };
        } catch (e) {
            return {
                status: false,
                Author: nameown,
                msg: e.message
            };
        }
     }

module.exports = function(app) {
app.get('/search/snackvideo', async (req, res) => {
       const { text } = req.query
        try {
            const results = await SnackVid(text);  
            res.status(200).json({
                status: true,
                result: results.Data
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});

}

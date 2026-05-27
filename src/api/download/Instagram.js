const axios = require('axios');
const cheerio = require('cheerio');

const Instagram = async (url) => {
    try {

        const {
            data
        } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "id-ID,id;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6,en;q=0.5",
                "cache-control": "max-age=0",
                "dpr": "2",
                "save-data": "on",
                "sec-ch-prefers-color-scheme": "dark",
                "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
                "sec-ch-ua-full-version-list": "\"Chromium\";v=\"137.0.7337.0\", \"Not/A)Brand\";v=\"24.0.0.0\"",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-model": "\"SM-A032F\"",
                "sec-ch-ua-platform": "\"Android\"",
                "sec-ch-ua-platform-version": "\"13.0.0\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "viewport-width": "980",
                "cookie": "csrftoken=qhsCMu_RFtA5n6DYIfPPN4; datr=rCNoaTay6rtxE9RUVKN-QECn; ig_did=0A1678D6-F6A9-42E9-AD0A-41A3D713F64A; mid=aWgjrAABAAE5mWsaAgs9fmsHvtLg; ig_nrcb=1; ds_user_id=73034008614; ps_l=1; ps_n=1; wd=423x790; dpr=1.7004296779632568; rur=\"HIL\\05473034008614\\0541802566490:01fe88c306da2e6bbd3b99088325de9a45e879e1baaf3ae8d02fd79db7886fc0d5315a55\"; sessionid=73034008614%3ArPmZxejGA9jOtY%3A28%3AAYiIUaClFqUrht-R1YXr9VFPvzDfrZ9fbE7O6uHcvQ"
            }
        });

        const $ = cheerio.load(data);
        let targetData = null;

        $('script[type="application/json"]').each((i, el) => {
            const content = $(el).html();
            if (content && (content.includes('xdt_api__v1__clips__home__connection_v2') || content.includes('xdt_api__v1__media__shortcode__web_info'))) {
                try {
                    const json = JSON.parse(content);
                    const nestedResult = findKeyInObject(json, 'xdt_api__v1__clips__home__connection_v2') || findKeyInObject(json, 'xdt_api__v1__media__shortcode__web_info');
                    if (nestedResult) {
                        if (nestedResult.edges) {
                            targetData = nestedResult.edges[0].node.media;
                        } else if (nestedResult.items) {
                            targetData = nestedResult.items[0];
                        } else {
                            targetData = nestedResult;
                        }
                        return false;
                    }
                } catch (e) {}
            }
        });

        if (!targetData) {
            const metaDescription = $('meta[name="description"]').attr('content');
            const ogImage = $('meta[property="og:image"]').attr('content');

            if (!metaDescription) throw new Error("Data tidak ditemukan atau halaman privat.");

            return {
                status: false,
                message: "Menggunakan fallback data (meta tags)",
                info: {
                    title: $('meta[property="og:title"]').attr('content') || "",
                    durasition: "N/A",
                    thumbnail: ogImage
                },
                data: {
                    like: "Check Link",
                    coment: "Check Link"
                },
                author: {
                    id: "unknown",
                    username: "unknown",
                    link: "unknown"
                },
                media: {
                    video: [],
                    image: [{
                        index: 0,
                        type: 'image',
                        url: ogImage,
                        share: ogImage
                    }]
                }
            };
        }

        const caption = targetData.caption ? targetData.caption.text : "";
        const thumbnail = targetData.image_versions2?.candidates[0]?.url || "";

        const likes = targetData.like_count || 0;
        const comments = targetData.comment_count || 0;

        const authorId = targetData.user?.id || "";
        const authorUsername = targetData.user?.username || "";
        const authorLink = targetData.user?.username ? `https://instagram.com/${targetData.user.username}` : "";

        let videoMedia = [];
        let imageMedia = [];

        const mediaType = targetData.media_type;

        if (mediaType === 1) {
            if (targetData.image_versions2 && targetData.image_versions2.candidates) {
                const bestImage = targetData.image_versions2.candidates[0];
                imageMedia.push({
                    index: 0,
                    type: 'image',
                    url: bestImage.url,
                    share: bestImage.url
                });
            }
        } else if (mediaType === 2) {
            if (targetData.video_versions && targetData.video_versions.length > 0) {
                const bestVideo = targetData.video_versions[0];
                const videoUrl = bestVideo.url;

                videoMedia = {
                    type: 'video',
                    url: videoUrl,
                    share: videoUrl
                };
            }
        } else if (mediaType === 8) {
            if (targetData.carousel_media && targetData.carousel_media.length > 0) {
                targetData.carousel_media.forEach((item, index) => {
                    if (item.media_type === 1 && item.image_versions2 && item.image_versions2.candidates) {
                        const bestImage = item.image_versions2.candidates[0];
                        imageMedia.push({
                            index: index,
                            type: 'image',
                            url: bestImage.url,
                            share: bestImage.url
                        });
                    } else if (item.media_type === 2 && item.video_versions && item.video_versions.length > 0) {
                        const bestVideo = item.video_versions[0];
                        const videoUrl = bestVideo.url;

                        videoMedia.push({
                            index: index,
                            type: 'video',
                            url: videoUrl,
                            share: videoUrl
                        });
                    }
                });
            }
        }

        if (mediaType !== 2) {
            videoMedia = [];
        } else if (mediaType === 2) {
            imageMedia = [];
        }

        let Result = {
            info: {
                title: caption,
                thumbnail: thumbnail
            },
            data: {
                like: likes,
                coment: comments
            },
            author: {
                id: authorId,
                username: authorUsername,
                link: authorLink
            },
            media: {
                video: videoMedia,
                image: imageMedia
            }
        };

        return Result;

    } catch (error) {
        console.error("Error scraping Instagram:", error.message);
        return {
            status: false,
            message: "Gagal mengambil data. Pastikan link valid dan publik.",
            error: error.message
        };
    }
};

function findKeyInObject(obj, keyToFind) {
    if (obj === null || typeof obj !== 'object') return null;
    if (obj.hasOwnProperty(keyToFind)) return obj[keyToFind];

    for (const k of Object.keys(obj)) {
        const found = findKeyInObject(obj[k], keyToFind);
        if (found) return found;
    }
    return null;
};

module.exports = function (app) {
app.get('/download/instagram', async (req, res) => {
       const { url } = req.query
        try {
            const results = await Instagram(url);
            res.status(200).json({
                status: true,
                result: results
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}



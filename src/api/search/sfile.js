const axios = require('axios');
const cheerio = require('cheerio');

async function sfilser(text, page = 1) {
        try {
            let urlSearch;
            if (text.startsWith('http')) {
                urlSearch = text;
            } else {
                const query = text.replace(/\s+/g, '+');
                urlSearch = `https://sfile.co/search?q=${query}&page=${page}`;
            }

            const {
                data
            } = await axios.get(urlSearch, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                }
            });

            const $ = cheerio.load(data);
            const results = [];
            $('div.group').each((i, el) => {
                const contentDiv = $(el).find('div.min-w-0.flex-1');
                if (contentDiv.length > 0) {
                    const linkEl = contentDiv.find('a');
                    const title = linkEl.text().trim();
                    const url = linkEl.attr('href');

                    const infoText = contentDiv.find('p.text-xs').text().trim();
                    const splitInfo = infoText.split('•');
                    const size = splitInfo[0] ? splitInfo[0].trim() : 'Unknown';
                    const date = splitInfo[1] ? splitInfo[1].trim() : 'Unknown';

                    if (title && url) {
                        results.push({
                            title: title,
                            size: size,
                            Date: date,
                            Url: url
                        });
                    }
                }
            });

            let pagination = {
                currentPage: null,
                totalPages: null,
                nextUrl: null
            };

            const pageInfoDiv = $('div.text-sm.text-slate-600').filter((i, el) => {
                return $(el).text().trim().startsWith('Page');
            });

            if (pageInfoDiv.length > 0) {

                const spans = pageInfoDiv.find('span.font-semibold');
                if (spans.length >= 2) {
                    pagination.currentPage = $(spans[0]).text().trim();
                    pagination.totalPages = $(spans[1]).text().trim();
                }
            }
            const nextLinkEl = $('a:contains("Next")');
            if (nextLinkEl.length > 0) {
                pagination.nextUrl = nextLinkEl.attr('href');
            }

            return {
                data: results,
                pagination: pagination
            };

        } catch (error) {
            return error.meesage
        }
    }
module.exports = function(app) {
app.get('/search/pinterest', async (req, res) => {
       const { text } = req.query
        try {
            const results = await sfilser(text);  
            res.status(200).json({
                status: true,
                result: results
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});

}

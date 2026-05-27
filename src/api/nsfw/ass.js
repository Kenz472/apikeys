const axios = require("axios");

async function ass() {
    try {
        const { data } = await axios.get(`https://api.night-api.com/images/nsfw/hass`, {
            headers: {
                authorization: "mqpsZNfVAO-QeRP5j8QTITqJSjb5FxI-MOVr7CoycT"
            }
        });
        
        const imageUrl = data.content.url;        
        const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });
        return Buffer.from(imageResponse.data);
    } catch (e) {
        throw new Error(e.message);
    }
}

module.exports = function(app) {
    app.get('/nsfw/ass', async (req, res) => {
        try {
            const imgBuffer = await ass();
            
            res.writeHead(200, {
                'Content-Type': 'image/png', 
                'Content-Length': imgBuffer.length,
            });
            
            res.end(imgBuffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};

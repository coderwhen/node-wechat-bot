const axios = require('axios')

let signature = null

const getToken = async () => {
    const url = `https://openai.weixin.qq.com/openapi/sign/JiBzEWlyIeH8z7XB9PSmgOs8ja9kLW`;
    signature = (await axios.post(url, {
        userid: 'cki6ToNmOZK'
    })).data.signature
}
getToken()

setInterval(() => {
    getToken()
}, 1.5 * 60 * 60 * 1000)

const getAnswer = async (userid, text) => {
    const url = `https://openai.weixin.qq.com/openapi/aibot/JiBzEWlyIeH8z7XB9PSmgOs8ja9kLW`
    const data = (await axios.post(url, {
        signature,
        query: text
    })).data
    console.log(data)
    return data
}

module.exports = {
    getAnswer
}
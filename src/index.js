const wechaty = require('wechaty')
const moment = require('moment')
const bot = wechaty.WechatyBuilder.build({
    name: 'wechat',
    // 用于兼容不同 IM 协议，不用关心
    puppet: 'wechaty-puppet-wechat',
})
const { FileBox } = require('file-box')
const {getAnswer} = require('./utils/openai')
bot.on('scan', (qrcode, status) =>
    console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`)
)

bot.on('login', async user => {
    console.log(`User ${user} logged in`)
})

// 处理消息
bot.on('message', async function (msg) {
    if (msg.self()) {
        return
    }
    // 获取消息发送人
    const contact = msg.talker()
    // 获取消息内容
    const text = msg.text()
    // 获取群聊信息
    const room = msg.room()

    if (room) {
        const topic = await room.topic()
        if (/^(机器人测试群|闲暇游戏群)$/.test(topic)) {
            if (await msg.mentionSelf()) {

                if (/(当前时间|现在时间)/.test(text)) {
                    room.say(`当前时间${moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')}`, contact)
                    return
                }

                const {
                    answer,
                    answer_type,
                    msg
                } = await getAnswer(null, text.replace(/@大掌柜群聊助手/g, '').trim())
                if (answer && answer_type === 'text') {
                    room.say(answer, contact)
                    return
                }

                if (answer_type === 'music') {
                    if (msg[0] && msg[0].music_url) {
                        await room.say(`${answer}\n${msg[0].music_url}`)
                        // await room.say(FileBox.fromUrl(msg[0].music_url))
                    }
                    else
                        room.say('抱歉，你点播的歌曲由于版权原因暂时不能播放', contact)
                    return
                }
                room.say(`我的主人懒洋洋还没教会我，请稍后再试吧！`, contact)
            }
        }
    }
})

bot.on('error', async (err) => {
    console.log(err)
})

bot.start()

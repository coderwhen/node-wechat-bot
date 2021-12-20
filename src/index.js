const mq = new Map()
const {WechatyBuilder} = require('wechaty')
const moment = require('moment')
const bot = WechatyBuilder.build({
    name: 'wechat',
    // 用于兼容不同 IM 协议，不用关心
    puppet: 'wechaty-puppet-wechat',
})
const {writeFile} = require('./utils/fs')

bot.on('scan', (qrcode, status) =>
    console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`)
)

bot.on('login', user => {
    console.log(`User ${user} logged in`)
    // console.log(bot.room());
})

bot.on('room-join', async (room) => {
    writeFile(room, 'log/room/room-join-' + (new Date()).getTime() + '.json')
    // console.log(room)
})

bot.on('room-leave', async (room) => {
    writeFile(room, 'log/room/room-leave-' + (new Date()).getTime() + '.json')
})

// 处理消息
bot.on('message', async function (msg) {
    if (msg.self()) {
        return
    }

    const obj = {
        ...msg
    }

    // 获取消息发送人
    const contact = msg.talker()
    obj.contact = contact
    // 获取消息内容
    const text = msg.text()
    // 获取群聊信息
    const room = msg.room()

    if (room) {
        const topic = await room.topic()
        const type = await msg.type()
        obj.room = room
        if(/^(机器人测试群)$/.test(topic)) {
            console.log(text)
            room.say('你好主人！')
            writeFile(obj, `log/test/info--${type}--${(new Date()).getTime()}.json`)
            return
        }
        if (/^(闲暇游戏群|浙江财经大学|汤臣一品业主群)$/.test(topic)) {
            try {
                mq.set(msg.id, obj)
                setTimeout(() => {
                    mq.delete(msg.id)
                }, 2 * 60 * 1000)
                if (type === 13) {

                    let {
                        _payload: {text, type, timestamp},
                        contact: {_payload: {name}}
                    } = mq.get(msg.text())
                    if (type === 6) {
                        text = text.replace(/\s/g, "").replace(/&amp;/g, "&").split('cdnurl=')[1].split('designerid')[0]
                    }
                    msg.say(`${name} ${moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')}撤回一条消息\n————————\n${text}`, contact)
                }
                writeFile(obj, `log/room/info--${type}--${(new Date()).getTime()}.json`)
            } catch (e) {
                console.log(e)
            }
        }
        return
    }
    // 是私聊
    if (contact.name() === '未来可期') {
        const type = await msg.type()
        mq.set(msg.id, obj)
        try {
            if (type === 1) {
                const xml = new XMLParser()
                writeFile(text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, "&"), 'index.xml')
            }
            if (type === 13) {
                let {
                    _payload: {text, type, timestamp},
                    contact: {_payload: {name}}
                } = mq.get(msg.text())
                if (type === 6) {
                    text = text.replace(/\s/g, "").replace(/&amp;/g, "&").split('cdnurl=')[1].split('designerid')[0]
                }
                msg.say(`${name} ${moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')}撤回一条消息\n————————\n${text}`, contact)
            }
            writeFile(obj, `log/shiliao/info--${type}--${(new Date()).getTime()}.json`)
        } catch (e) {
            console.log(e)
        }
    }
})

bot.start()

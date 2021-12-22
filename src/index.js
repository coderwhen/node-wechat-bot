const mq = new Map()
const wechaty = require('wechaty')
const moment = require('moment')
const bot = wechaty.WechatyBuilder.build({
    name: 'wechat',
    // 用于兼容不同 IM 协议，不用关心
    puppet: 'wechaty-puppet-wechat',
})
const {db} = require('./utils/db')
const {getAnswer} = require('./utils/openai')
const {writeFile} = require('./utils/fs')
bot.on('scan', (qrcode, status) =>
    console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`)
)

bot.on('login', async user => {
    console.log(`User ${user} logged in`)
    const rooms = await bot.Room.findAll()
    rooms.forEach(room => {
        const {
            _payload: {
                adminIdList,
                id,
                memberIdList,
                topic
            }
        } = room
        db.query('INSERT INTO `tb_rooms` (`id`, `adminIdList`, `memberIdList`, `topic`) VALUES (?,?,?,?)', [
            id,
            JSON.stringify(adminIdList),
            JSON.stringify(memberIdList),
            topic
        ], err => {
            if (!err) {
                console.log(`创建${topic}到数据库中`)
            }
            // console.log(room)
        })
    })
    // console.log(await bot.Room.findAll());
})

bot.on('room-invite', async roomInvitation => {
    console.log('room-invite')
    const topic = await roomInvitation.topic()  //群聊名
    const inviter = await roomInvitation.inviter()  //邀请者
    const name = inviter.name()
    const alias = inviter.alias()

    console.log(`加入群聊：${topic}，邀请者； ${name}，备注：${alias}`)

})

//有人加入群聊 room 群聊  inviteeList 所有人  inviter 邀请者
bot.on('room-join', async function (room, inviteeList, inviter) {
    console.log('room-join')
    const topic = await room.topic()
    //所有人昵称拼接  inviteeList.map(c => c.name()).join(','),
    const inviterName = inviter.name() || inviter.alias()
    const name = inviteeList[0] !== undefined ? inviteeList[0].name() : ''

    console.log(`欢迎 ${inviterName} 邀请 ${name}，加入群聊 ${topic}`)

    await room.say(`welcome to "${topic}"!`, inviteeList[0])
})

bot.on('room-leave', async (room, leaverList, remover) => {
    console.log('room-leave')
    console.log(room, leaverList, remover)
})

// 群名称被修改
bot.on('room-topic', async (room, newTopic, oldTopic, changer) => {
    console.log(room, newTopic, oldTopic, changer)
})

// 处理消息
bot.on('message', async function (msg) {
    if (msg.self()) {
        return
    }

    const obj = {
        ...msg
    }
    // console.log(Message.Type.text);
    // 获取消息发送人
    const contact = msg.talker()
    obj.contact = contact
    // 获取消息内容
    const text = msg.text()
    // 获取群聊信息
    const room = msg.room()
// console.log(await msg.mentionSelf())
    if (room) {
        const topic = await room.topic()
        const type = await msg.type()
        obj.room = room
        if (/^(机器人测试群)$/.test(topic)) {
            if (await msg.mentionSelf()) {
                if (/(所有人)/.test(text)) {
                    room.say('测试@全部人', ...await room.memberAll())
                }
                // console.log(text.replace(/@大掌柜群聊助手/, '').trim())
                // const {answer, msg} = await getAnswer(null, text.replace(/@大掌柜群聊助手/, '').trim())
                // if (answer) {
                //     UrlLink
                //     if (msg.music_url)
                //         room.say(UrlLink.create(msg.music_url))
                //     room.say(answer, contact)
                //     return
                // }
                // if (/(当前时间|现在时间)/.test(text)) {
                //     room.say(`当前时间${moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')}`, contact)
                //     return
                // }
                // if (/(我的id)/i.test(text)) {
                //     room.say('您的ID' + contact.id, contact)
                //     return
                // }
                // room.say('暂时还听不懂！', contact)
                // return
            }
            if (/(当前时间|现在时间)/.test(text)) {
                room.say(`当前时间${moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')}`, contact)
                return
            }
            if (/(我的id)/i.test(text)) {
                room.say('您的ID' + contact.id, contact)
                return
            }
            return
        }
        if (/^(闲暇游戏群|浙江财经大学|汤臣一品业主群)$/.test(topic)) {
            if (await msg.mentionSelf()) {
                console.log(text.replace(/@大掌柜群聊助手/, ''))
                const answer = await getAnswer(null, text.replace(/@大掌柜群聊助手/, ''))
                if (answer) {
                    room.say(answer, contact)
                    return
                }
                // if (/(当前时间|现在时间)/.test(text)) {
                //     room.say(`当前时间${moment(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')}`, contact)
                //     return
                // }
                // if (/(我的id)/i.test(text)) {
                //     room.say('您的ID' + contact.id, contact)
                //     return
                // }
                room.say('暂时还听不懂！', contact)
                // return
            }
        }
    }
})

bot.start()

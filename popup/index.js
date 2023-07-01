import { putMessage } from "./floating";

let messages = {
    // 群组消息
    GROUP: {
        // sum: 0,
        // lastSendTime: 0,
        // messages: {}
    },
    // 个人消息
    PERSON: {
    }
}
const GROUPS = {}

function init() {
    const robotMessages = localStorage.getItem('robotMessages')
    if (robotMessages) {
        messages = JSON.parse(robotMessages)
    }
}

/**
 * WhatsApp消息
 * @param messageType 消息类型: GROUP、PERSON
 * @param groupId 群组ID, 如果对个人的话这个值等于sender
 * @param messageId 消息ID
 * @param sender 发送方
 * @param sendTime 发送时间
 * @param content 消息内容
 * @param value 值
 * @constructor
 */
function Message(messageType, groupId, messageId, sender, sendTime, content, value) {
    this.messageType = messageType
    this.groupId = groupId
    this.messageId = messageId
    this.sender = sender
    this.sendTime = sendTime
    this.content = content
    this.value = value
}

function getMessage(messageRow) {
    const dataEle = messageRow.querySelector("div[data-id]")
    if (!dataEle) {
        return null
    }

    // 收到的消息
    // dataEle.querySelector("div.message-in div[data-testid='msg-container']")

    // 只看自己发的消息
    const messageOut = dataEle.querySelector("div.message-out div[data-testid='msg-container']")
    if (!messageOut) {
        return null
    }

    // 消息ID
    // 多人聊天
    // true_120363029896763476@g.us_3EB096D2AFE1B1EE0F7BC6_8618025480826@c.us   // lile发送方
    // false_120363029896763476@g.us_3EB096D2AFE1B1EE0F7BC6_8618025480826@c.us  // 军亚接收方
    // true_120363159842487212@g.us_3EB05C5A15BC13902D72AE_8618025480826@c.us
    // {是否我发送的}_{群组ID}@g.us_{消息ID}_{发送人}@c.us

    // 单人聊天
    // false_8618025480826@c.us_3EB067AEF713578C908757
    // true_8616670120864@c.us_3EB067AEF713578C908757

    const dataId = dataEle.getAttribute("data-id")

    // 群组消息匹配
    const groupMessageIdMatcher = /(true)_(\d+)@g.us_([^_]+)_(.*)@c.us/.exec(dataId)

    let messageType = null
    let groupId = null
    let messageId = null
    let sender = null
    if (groupMessageIdMatcher) {
        messageType = 'GROUP'
        groupId = groupMessageIdMatcher[2]
        messageId = groupMessageIdMatcher[3]
        sender = groupMessageIdMatcher[4]
    } else {
        // 个人消息匹配
        const personMessageIdMatcher = /(true)_(.+)@c.us_(.*)/.exec(dataId)
        if (!personMessageIdMatcher) {
            return null
        }
        messageType = 'PERSON'
        messageId = personMessageIdMatcher[3]
        sender = personMessageIdMatcher[2]
        groupId = sender
    }

    // 消息正文
    const copyableText = dataEle.querySelector("div.copyable-text")

    // 发送时间 [下午5:27, 2023年6月29日] lile oct10:
    const prePlainText = copyableText.getAttribute("data-pre-plain-text")
    const sendTimeMatcher = /\[[^d]+(\d+):(\d+), (\d+)年(\d+)月(\d+)日\]/.exec(prePlainText)
    let sendTime = null
    if(sendTimeMatcher) {
        const hour = sendTimeMatcher[1]
        const minute = sendTimeMatcher[2]
        const year = sendTimeMatcher[3]
        const month = sendTimeMatcher[4]
        const day = sendTimeMatcher[5]
        const sendTimeStr = `${year}-${month}-${day} ${hour}:${minute}`
        sendTime = Date.parse(sendTimeStr) / 1000
    } else {
        console.log('Parsed date error: ', prePlainText)
    }

    // 消息文本
    let messageText = copyableText.innerText

    // 匹配消息
    // +200
    // -200
    // -200 * 4.5
    // 清空
    // value =
    let value = 0
    if (messageText !== '/Clear') {
        const messageTextMatcher = /^([+\-*/])(\d+[+\-*/.\d]*)$/.exec(messageText)
        if (!messageTextMatcher) {
            // 不重要的消息
            return null
        }

        value = scaleNumber(eval(messageTextMatcher[2]))
    }

    return new Message(messageType, groupId, messageId, sender, sendTime, messageText, value)
}

function sendMessage(messageOfGroup) {
    // 组装内容
    // const inputEle = document.querySelector("footer p.selectable-text")
    // const span = document.createElement('span')
    // span.setAttribute('class', 'selectable-text copyable-text')
    // span.setAttribute('data-lexical-text', 'true')
    // span.innerText = `总计: ${messageOfGroup.sum}`
    // console.log('sendMessage: ', span)
    // inputEle.append(span)

    // 发送按钮
    // const sendBtn = document.querySelector("button[data-testid='compose-btn-send']")
    // sendBtn.click()

    // sendKeys(`Sum: ${messageOfGroup.sum}`)
    document.execCommand('insertText', false, `【自动发送】 合计金额: ${messageOfGroup.sum}`)

    // 发送
    // 点击发送按钮
    setTimeout(() => {
        // 输入框
        const inputDiv = document.querySelector("div[contenteditable='true'][data-testid='conversation-compose-box-input']")
        if (inputDiv && inputDiv.innerText.startsWith('【自动发送】')) {

            // 点击send按钮发送消息
            const sendBtn = document.querySelector("button[data-testid='compose-btn-send']")
            if (sendBtn) {
                sendBtn.click()
            } else {
                console.log('Notfound send message button')
            }
        }
    }, 3000)


    // 按Enter发送

    // console.log('发送回车键')
    // // 回车发送
    // inputDiv.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 13, which: 13, timeStamp: 100}0))
}


function calculationSum(messageOfGroup, message) {
    if (message.content === 'Clear') {
        messageOfGroup.sum = 0
    } else {
        if (message.content.startsWith('+')) {
            messageOfGroup.sum += message.value
        } else if (message.content.startsWith('-')) {
            messageOfGroup.sum -= message.value
        } else if (message.content.startsWith('*')) {
            // messageOfGroup.sum *= parseFloat(message.content)
            // 保留两位小数
            messageOfGroup.sum = scaleNumber(messageOfGroup.sum * message.value)
        } else if (message.content.startsWith('/')) {
            // 保留两位小数
            messageOfGroup.sum = scaleNumber(messageOfGroup.sum / message.value)
        }
    }
}

function scaleNumber(number, newScale) {
    const size = Math.pow(10, newScale || 2)
    return Math.floor(number * size) / size
}

function fetchMessages() {
    const messagesContainer = document.querySelector("[role='application']")
    if (messagesContainer == null) {
        console.log('[WARN] Notfound messages container...')
    } else {
        // 取群组名, 或者对方名字
        const groupNameElement = document.querySelector("#main div[data-testid='conversation-info-header'] [data-testid='conversation-info-header-chat-title']")
        const groupName = groupNameElement && groupNameElement.innerText

        // 取所有消息行
        const messagesRows = messagesContainer.querySelectorAll("#main div[data-testid='conversation-panel-body'] div[role='row']")

        // 是否有新的消息
        let isNew = false
        let messageOfGroup
        messagesRows.forEach(messagesRow => {
            const message = getMessage(messagesRow)
            if (message) {
                // 设置/更新群组名
                GROUPS[message.groupId] = groupName

                messageOfGroup = messages[message.messageType][message.groupId]
                if (!messageOfGroup) {
                    messageOfGroup = {
                        sum: 0,
                        lastSendTime: 0,
                        messages: {}
                    }
                    messages[message.messageType][message.groupId] = messageOfGroup
                }

                if(messageOfGroup.lastSendTime > message.sendTime) {
                    // 过期消息， 不处理
                    return
                }

                let messaged = messageOfGroup.messages[message.messageId]
                if (messaged) {
                    // 消息已解析， 不处理
                    return
                }

                isNew = true

                // 计算金额
                calculationSum(messageOfGroup, message)

                // 保存消息
                messageOfGroup.messages[message.messageId] = message

                // 最后一条消息发送时间
                if(messageOfGroup.lastSendTime < message.sendTime) {
                    messageOfGroup.lastSendTime = message.sendTime
                }

                // 显示消息到悬浮框
                putMessage(GROUPS[message.groupId], messageOfGroup.sum, message)

                console.log('message=', message)
            }
        })

        if (isNew) {
            // 发送汇总
            sendMessage(messageOfGroup)

            // 更新本地缓存
            localStorage.setItem('robotMessages', JSON.stringify(messages))

            // 打印一条日志
            console.log('messages=', messages)
        }
    }   // End if..else

    console.log('setTimeout fetchMessages')
    setTimeout(fetchMessages, 1000)
}

// localStorage.removeItem("robotMessages")
init()
fetchMessages()

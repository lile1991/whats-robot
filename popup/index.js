import { appendMessage } from "./floating";
import { scaleNumber, evalMath } from "./utils.js";

const CLEAN_BILL_CMD = '/Clear'
let messages = {
    // 群组消息
    GROUP: {
        // sum: 0,
        // lastSendTime: 0,
        // messages: [],
        // messageMap: {}
    },
    // 个人消息
    PERSON: {
    }
}

function init() {
    const robotMessages = localStorage.getItem('robotMessages')
    if (robotMessages) {
        messages = JSON.parse(robotMessages)

        // init putMessages
        for(let groupId in messages.GROUP) {
            const group = messages.GROUP[groupId]
            for(let i = group.messages.length - 1; i >= 0; i --) {
                const message = group.messages[i]
                appendMessage(group, message)
            }
        }
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

    // 发送时间
    const prePlainText = copyableText.getAttribute("data-pre-plain-text")
    // 中文版
    // 发送时间 [下午5:27, 2023年6月29日] lile oct10:
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
        // 英文版
        // [09:50, 04/07/2023] 哈:
        const sendTimeMatcher = /\[(\d+):(\d+), (\d+)\/(\d+)\/(\d+)\]/.exec(prePlainText)
        if(sendTimeMatcher) {
            const hour = sendTimeMatcher[1]
            const minute = sendTimeMatcher[2]
            const day = sendTimeMatcher[3]
            const month = sendTimeMatcher[4]
            const year = sendTimeMatcher[5]
            const sendTimeStr = `${year}-${month}-${day} ${hour}:${minute}`
            sendTime = Date.parse(sendTimeStr) / 1000
        } else {
            console.log('Parsed date error: ', prePlainText)
        }
    }

    // 消息文本
    let messageText = copyableText.innerText

    // 匹配消息
    // +200
    // -200
    // -200 * 4.5
    // -(200 * 4.5) / (3 + 1)
    // 清空
    // value =
    let value = 0
    if (messageText !== CLEAN_BILL_CMD) {
        const messageTextMatcher = /^([+\-*/])([(]?\d+[+\-*/.\d()]*)$/.exec(messageText)
        if (!messageTextMatcher) {
            // 不重要的消息
            return null
        }

        value = scaleNumber(evalMath(messageTextMatcher[2]))
    }

    return new Message(messageType, groupId, messageId, sender, sendTime, messageText, value)
}

function sendMessage(messageOfGroup, message) {
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

    if(message.content === CLEAN_BILL_CMD) {
        console.log(`【自动发送】 已清账！ 清账后合计金额: ${messageOfGroup.sum}`)
        document.execCommand('insertText', false, `【自动发送】 已清账！ 清账后合计金额: ${messageOfGroup.sum}`)
    } else {
        console.log(`【自动发送】 合计金额: ${messageOfGroup.sum}`)
        document.execCommand('insertText', false, `【自动发送】 合计金额: ${messageOfGroup.sum}`)
    }

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
    }, 500)

    // 按Enter发送
    // console.log('发送回车键')
    // // 回车发送
    // inputDiv.dispatchEvent(new KeyboardEvent('keydown', {keyCode: 13, which: 13, timeStamp: 100}0))
}


function calculationSum(messageOfGroup, message) {
    if (message.content.startsWith('+')) {
        messageOfGroup.sum = scaleNumber(messageOfGroup.sum + message.value)
    } else if (message.content.startsWith('-')) {
        messageOfGroup.sum = scaleNumber(messageOfGroup.sum - message.value)
    } else if (message.content.startsWith('*')) {
        // messageOfGroup.sum *= parseFloat(message.content)
        // 保留两位小数
        messageOfGroup.sum = scaleNumber(messageOfGroup.sum * message.value)
    } else if (message.content.startsWith('/')) {
        // 保留两位小数
        messageOfGroup.sum = scaleNumber(messageOfGroup.sum / message.value)
    }
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
        let group
        messagesRows.forEach(messagesRow => {
            const message = getMessage(messagesRow)
            if (message) {
                group = messages[message.messageType][message.groupId]
                if (!group) {
                    group = {
                        groupId: message.groupId,
                        // 初始化群组
                        groupName: groupName,
                        sum: 0,
                        lastSendTime: 0,
                        // 缓存最近一分钟的消息
                        lastOneMinuteMessagesCache: {},
                        messages: []
                    }
                    messages[message.messageType][message.groupId] = group
                }

                // 更新群组名
                group.groupName = groupName

                if(group.lastSendTime > message.sendTime) {
                    // 过期消息， 不处理
                    return
                }

                let messaged = group.lastOneMinuteMessagesCache[message.messageId]
                if (messaged) {
                    // 消息已解析， 不处理
                    return
                }

                // 清账
                if (message.content === CLEAN_BILL_CMD) {
                    // group.lastOneMinuteMessagesCache = {}
                    group.messages = []
                    group.sum = 0
                } else {
                    // 计算金额
                    calculationSum(group, message)

                    // 记录当前和
                    message.sum = group.sum

                    // 保存消息
                    group.messages.push(message)
                }

                group.lastOneMinuteMessagesCache[message.messageId] = message
                // 更新最后一条消息发送时间
                if(group.lastSendTime < message.sendTime) {
                    group.lastSendTime = message.sendTime

                    // 清除已过期的缓存消息
                    const expiredMessageIds = []
                    for(let cacheMessageId in group.lastOneMinuteMessagesCache) {
                        if(group.lastOneMinuteMessagesCache[cacheMessageId].sendTime < group.lastSendTime) {
                            expiredMessageIds.push(cacheMessageId)
                        }
                    }
                    console.log('Deleted expired messages: ', expiredMessageIds)
                    expiredMessageIds.forEach(expiredMessageId => delete group.lastOneMinuteMessagesCache[expiredMessageId])
                }
                console.log('Current cached messages: ', group.lastOneMinuteMessagesCache)

                // 发送汇总
                sendMessage(group, message)

                // 更新本地缓存
                localStorage.setItem('robotMessages', JSON.stringify(messages))

                // 显示消息到悬浮框
                appendMessage(group, message)

                console.log('message=', message)
            }
        })

    }   // End if..else

    setTimeout(fetchMessages, 1000)
}

// localStorage.removeItem("robotMessages")
init()
fetchMessages()

// 悬浮窗
export function putMessage(groupName, message) {
    let messagesFloating = document.querySelector("#messages-floating")
    if (!messagesFloating) {
        // 创建悬浮窗
        const appDiv = document.querySelector("#app > div")

        messagesFloating = document.createElement('div')
        messagesFloating.setAttribute('id', 'messages-floating')
        appDiv.appendChild(messagesFloating)
    }

    // 创建群组悬浮层
    let groupElement = messagesFloating.querySelector(`#g-${message.groupId}`)
    let groupMessagesElement
    let groupTitleElement
    if (groupElement == null) {
        // 群组父元素
        groupElement = document.createElement('div')
        groupElement.setAttribute('id', `g-${message.groupId}`)
        messagesFloating.appendChild(groupElement)

        // 群组名称
        groupTitleElement = document.createElement('h3')
        groupTitleElement.setAttribute('id', `g-${message.groupId}-title`)
        groupElement.appendChild(groupTitleElement)

        // 群组消息列表
        groupMessagesElement = document.createElement('ul')
        groupElement.appendChild(groupMessagesElement)
    } else {
        groupTitleElement = groupElement.querySelector('h3')
        groupMessagesElement = groupElement.querySelector('ul')
    }

    // 设置/更新群组名称
    groupTitleElement.innerText = groupName

    // 添加消息到悬浮框
    const messageElement = document.createElement('li')
    messageElement.innerText = message.content
    groupMessagesElement.appendChild(messageElement)
}   // End putMessage

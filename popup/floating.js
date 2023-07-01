import $ from 'jquery'

// 悬浮窗
export function putMessage(group, message) {
    let messagesFloating = $("#messages-floating")
    if (!messagesFloating.length) {
        // 创建悬浮窗
        // const appDiv = $("#app > div")

        messagesFloating = $(`<div id="messages-floating" style="margin-top: 127px; height: 450px; background-color: yellow;"></div>`)

        $(document.body).append(messagesFloating)
    }

    // 创建群组悬浮层
    let groupElement = $(`#g-${message.groupId}`, messagesFloating)
    let groupMessagesElement
    let groupTitleElement
    if (!groupElement.length) {
        // 群组父元素
        groupElement = $(`<div id="g-${message.groupId}"></div>`)
        messagesFloating.append(groupElement)

        // 群组名称
        groupTitleElement = $(`<h3 id="g-${message.groupId}-title"></h3>`)
        groupElement.append(groupTitleElement)

        // 群组消息列表
        groupMessagesElement = $('<ul></ul>')
        groupElement.append(groupMessagesElement)
    } else {
        groupTitleElement = $('h3', groupElement)
        groupMessagesElement = $('ul', groupElement)
    }

    // 设置/更新群组名称
    groupTitleElement.html(`${group.groupName}(${group.sum})`)

    // 添加消息到悬浮框
    const messageElement = $(`<li>${message.sum}: ${message.value}=${message.content}</li>`)
    groupMessagesElement.prepend(messageElement)
}   // End putMessage

export function clearGroup(group) {
    // 移除群组父元素
    $(`#messages-floating #g-${group.groupId}`).remove()
}
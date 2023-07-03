import $ from 'jquery'

// 悬浮窗
export function putMessage(group, message) {
    let messagesFloating = $("#messages-floating")
    if (!messagesFloating.length) {
        // 创建悬浮窗
        // const appDiv = $("#app > div")

        messagesFloating = $(`<div id="messages-floating" style="margin-top: 127px; height: 450px; padding: 20px; background-color: yellow;"></div>`)

        $(document.body).append(messagesFloating)
    }

    // 创建群组悬浮层
    let groupElement = $(`#g-${message.groupId}`, messagesFloating)
    let groupMessagesElement
    let groupTitleElement
    if (!groupElement.length) {
        // 群组父元素
        groupElement = $(`<div id="g-${message.groupId}" class="groupBox"  style="position: relative; text-align: center; display: block; max-width: 70px; z-index:999; padding: 8px 20px; border-bottom:1px solid #ccc;border-left: 1px solid #ccc;border-right: 1px solid #ccc;"></div>`)
        messagesFloating.append(groupElement)
        bindElementForVisible(`g-${message.groupId}`)

        // 群组名称
        groupTitleElement = $(`<h3 id="g-${message.groupId}-title"></h3>`)
        groupElement.append(groupTitleElement)
        // 群组消息列表
        groupMessagesElement = $(`<ul id="groupList" style="position: absolute; left:110px; top: 0px; border: 1px solid #ccc; background-color: #fff; z-index: 999999999; border: 1px solid #ccc; text-align: center; display:none; width: max-content;"><li style="padding:8px 20px; border-bottom: 1px solid #ccc">Bill=${group.sum}</li></ul>`)
        groupElement.append(groupMessagesElement)
    } else {
        groupTitleElement = $('h3', groupElement)
        groupMessagesElement = $('ul', groupElement)
    }

    // 设置/更新群组名称
    groupTitleElement.html(`<div style="color:#000; cursor: pointer;word-break: break-all;">${group.groupName}</div>`)

    // 添加消息到悬浮框
    const messageElement = $(`<li style="padding:8px 20px; border-bottom: 1px solid #ccc">${message.sum}: ${message.value}=${message.content}</li>`)
    $(`#g-${message.groupId} ul li`).first().after(messageElement);
    // groupMessagesElement.prepend(messageElement)
} // End putMessage

$(function () {
    $('.groupBox').first().css('border','1px solid #ccc')
    $('ul li').last().css('borderBottom','0px')
});

function bindElementForVisible(id) {
    $(`#${id}`).on("mouseenter", function (e) {
        console.log('#groupListshow',$(`#${id} #groupList`));
        $(`#${id} #groupList`).show()
    });
    $(`#${id}`).on("mouseleave", function (e) {
        console.log('#groupListhide',$(`#${id} #groupList`));
        $(`#${id} #groupList`).hide()
    });
}

export function clearGroup(group) {
    // 移除群组父元素
    $(`#messages-floating #g-${group.groupId}`).remove()
}

import $ from 'jquery'
import moment from 'moment'

// 悬浮窗
export function appendMessage(group, message) {
    let messagesFloating = $("#messages-floating")
    if (!messagesFloating.length) {
        // 创建悬浮窗
        // const appDiv = $("#app > div")

        messagesFloating = $(`<div id="messages-floating" style="margin-top: 127px; height: 666px; padding: 5px;"></div>`)

        $(document.body).append(messagesFloating)
    }

    // 创建群组悬浮层
    let groupElement = $(`#g-${message.groupId}`, messagesFloating)
    let groupMessagesElement
    let groupTitleElement
    let totalBill
    if (!groupElement.length) {
        // 群组父元素
        groupElement = $(`<div id="g-${message.groupId}" class="groupBox"  style="position: relative; text-align: center; display: block; max-width: 132px; z-index:999; padding: 8px 5px; border-bottom:1px solid #ccc;border-left: 1px solid #ccc;border-right: 1px solid #ccc;"></div>`)
        messagesFloating.append(groupElement)
        bindElementForVisible(`g-${message.groupId}`)

        // 群组名称
        groupTitleElement = $(`<h3 id="g-${message.groupId}-title"></h3>`)
        groupElement.append(groupTitleElement)
        // 群组消息列表
        groupMessagesElement = $(`<ul id="groupList" style="position: absolute; left:142px; top: 0px; border: 1px solid #ccc; background-color: #fff; z-index: 999999999; border: 1px solid #ccc; text-align: center; display:none; width: max-content;"></ul>`)
        groupElement.append(groupMessagesElement)

        // 第一行显示总账
        totalBill = $(`<li style="padding:8px 20px; border-bottom: 1px solid #ccc" class="bill-head">Total Bill=<span class="bill-num">${group.sum}</span>&nbsp;</li>`)
        groupMessagesElement.append(totalBill)

        // 复制按钮
        const copyBtn = $(`<a href="JavaScript:void(0)" class="copy">复制</a>`).click((e) => copyBills(e, group))
        totalBill.append(copyBtn)
    } else {
        groupTitleElement = $('h3', groupElement)
        groupMessagesElement = $('ul', groupElement)
        totalBill = $('#groupList > li.bill-head', groupElement)
    }

    // 更新总账
    $(".bill-num", totalBill).html(`${group.sum}`)

    // 设置/更新群组名称
    groupTitleElement.html(`<div style="color:#000; cursor: pointer;word-break: break-all;">${group.groupName}(${group.sum})</div>`)

    if(group.messages.length === 0) {
        // 清空消息
        $(`#g-${message.groupId} ul li:gt(0)`).remove()
    } else {
        // 添加消息到悬浮框
        //     ${message.value}=
        const messageElement = $(`<li style="padding:8px 20px; border-bottom: 1px solid #ccc">[${message.sum}]: ${message.content}</li>`)
        // 正序
        groupMessagesElement.append(messageElement);
        // 倒序
        // $(`#g-${message.groupId} ul li`).first().after(messageElement);
        // groupMessagesElement.prepend(messageElement)
    }
} // End putMessage

$(function () {
    $('.groupBox').first().css('border','1px solid #ccc')
    $('ul li').last().css('borderBottom','0px')
});

function bindElementForVisible(id) {
    $(`#${id}`).on("mouseenter", function (e) {
        // console.log('#groupListshow',$(`#${id} #groupList`));
        $(`#${id} #groupList`).show()
    }).on("mouseleave", function (e) {
        // console.log('#groupListhide',$(`#${id} #groupList`));
        $(`#${id} #groupList`).hide()
    });
}

// 复制账单
function copyBills(e, group) {
    const clipboard = navigator.clipboard

    let content = '发送时间,发送内容,变化金额,总账单\r\n'
    group.messages.forEach(message => {
        // 发送时间,发送内容,变化金额,当前账单
        // message.sendTime,message.content,message.value,message.sum
        const sendTimeFormat = moment(new Date(message.sendTime * 1000)).format('YYYY-MM-DD hh:mm')
        const operator = message.content.substring(0, 1)
        content += `${sendTimeFormat},'${message.content},'${operator}${message.value},${message.sum}\r\n`
    })

    // 写入到剪贴板
    clipboard.writeText(content)
}

function clearGroup(group) {
    // 移除群组父元素
    $(`#messages-floating #g-${group.groupId}`).remove()
}

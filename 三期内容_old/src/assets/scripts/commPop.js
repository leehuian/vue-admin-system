var layer = require('../layer/layer.js');
var $ = require('jquery');

var commPop = function () {
    this.showPageInfo = function (pageId) {
        //在这里查询page详细信息（page=页面，也就是funcid对应的信息）
        var pageInfo = {
            pageId: "10001001",
            pageName: "这个是查询页面",
            url: "/iexternalmanage/finasdfasdfatacct/current2Fian.aspx",
            moduleId: "100001",
            moduleName: "理财账户管理",
            bizId: "005",
            bizName: "投资",
            inPageList: [{
                    pageId: "1022221",
                    pageName: "转入页面1",
                    cmd: "buycommit",
                    count: 1254
                },
                {
                    pageId: "1022222",
                    pageName: "转入页面2",
                    cmd: "buycommit",
                    count: 12
                },
                {
                    pageId: "1022223",
                    pageName: "转入页面3",
                    cmd: "buycommit",
                    count: 154
                },
                {
                    pageId: "1022224",
                    pageName: "转入页面4",
                    cmd: "buycommit",
                    count: 254
                },
                {
                    pageId: "1022225",
                    pageName: "转入页面5",
                    cmd: "buycommit",
                    count: 2154
                }
            ],
            outPageList: [{
                    pageId: "1022221",
                    pageName: "转入页面1",
                    cmd: "buycommit",
                    count: 1254
                },
                {
                    pageId: "1022222",
                    pageName: "转入页面2",
                    cmd: "buycommit",
                    count: 12
                },
                {
                    pageId: "1022223",
                    pageName: "转入页面3",
                    cmd: "buycommit",
                    count: 154
                },
                {
                    pageId: "1022224",
                    pageName: "转入页面4",
                    cmd: "buycommit",
                    count: 254
                },
                {
                    pageId: "1022225",
                    pageName: "转入页面5",
                    cmd: "buycommit",
                    count: 2154
                }
            ]
        }
        layer.open({
            type: 1,
            title: ["页面详情", "font-weight:600;font-size:14px;font-color:#000;"],
            area: ['360px'],
            shadeClose: true, //点击遮罩关闭
            content: '<div style="margin: 10px;"><table class="lha-pageinfo-table">' +
                '<tr><td>页面名</td><td>' + pageInfo.pageName + '</td></tr>' +
                '<tr><td>页面编码</td><td>' + pageInfo.pageId + '</td></tr>' +
                '<tr><td>页面Url</td><td>' + pageInfo.url + '</td></tr>' +
                '<tr><td>所属模块</td><td>' + pageInfo.moduleName + '</td></tr>' +
                '<tr><td>所属业务</td><td>' + pageInfo.bizName + '</td></tr>' +
                '</table></div>'
        });
    }
}

module.exports = commPop;
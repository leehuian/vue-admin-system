<template>
    <div>
        <!-- 选择系统 -->
        <el-select v-model="selectSystemId" placeholder="选择系统" style="margin-bottom:5px;">
            <el-option
                v-for="item in systemList"
                :key="item.systemId"
                :label="item.systemName"
                :value="item.systemId">
                <span style="float: left">{{ item.systemName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.systemId }}</span>
            </el-option>
        </el-select>
        <!-- 选择时间 -->
        <el-button-group style="margin-left:10px;">
            <el-button :type="queryDate==1?'primary':''" @click="changeDate(1)">今日</el-button>
            <el-button :type="queryDate==3?'primary':''" @click="changeDate(3)">近三日</el-button>
            <el-button :type="queryDate==7?'primary':''" @click="changeDate(7)">近七日</el-button>
            <el-button :type="queryDate==15?'primary':''" @click="changeDate(15)">近半月</el-button>
        </el-button-group>
        <div style="display:inline-block;">
            <span style="font-size: 14px;color: #565656;margin: 0 10px;">
                选择开始时间：
            </span>
            <el-date-picker
                v-model="startDate"
                type="date"
                placeholder="选择统计开始日期"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyyMMdd"
                @change="datePickChange">
            </el-date-picker>
        </div>
        <el-row :gutter="10" style="margin-top:10px;">
            <el-col :span="24">
                <el-card shadow="always" class="all-view-table">
                    <div slot="header" class="card-titile" style="text-align:left;">
                        <span>下线视角</span>
                        <el-input v-model="searchUnReqText" placeholder="筛选关键词" style="width:300px;margin-left:10px;"></el-input>
                    </div>
                    <el-table :data="unReqUrlList.filter(data => !searchUnReqText || (data.url + data.pageId + data.pageName).toLowerCase().includes(searchUnReqText.toLowerCase()))" style="width:100%" max-height="600">
                        <el-table-column label="页面信息">
                            <el-table-column label="页面名称" width="150" prop="pageName"></el-table-column>
                            <el-table-column label="页面ID" width="100" prop="pageId"></el-table-column>                        
                            <el-table-column label="URL" prop="url"></el-table-column>
                        </el-table-column>
                        <el-table-column label="最近访问时间" prop="lastReqDate" width="100"></el-table-column>
                        <el-table-column label="操作" width="150">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-zoom-in" @click="showPageInfo(scope.systemId, scope.pageId)">查询</el-button>
                                <el-button type="text" icon="el-icon-delete" style="color:red;" @click="gotoNetRes()">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-tooltip class="item" effect="dark" content="查看更多" placement="bottom">
                        <el-button type="text" class="el-icon-lx-more" style="margin-top:5px;font-size:16px;"></el-button>
                    </el-tooltip>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script>
var dd = require("../../devJsonData/FirstPage.json");
export default {
  data() {
    return {
      systemList: [
        { systemId: "LA04", systemName: "手机银行" },
        { systemId: "LA50", systemName: "内容社区" },
        { systemId: "LA08", systemName: "大数据系统" },
        { systemId: "LR19", systemName: "PAD系统" }
      ],
      selectSystemId: "LA04",
      queryDate: 1,
      searchUnReqText: "",
      unReqUrlList: dd.historyObj.unReqUrl,
      startDate: this.$moment().format("YYYYMMDD"), //默认取值今天
      queryDate: 1
    };
  },
  methods: {
    datePickChange() {
      //手动选择日期后,将快捷项置灰.
      var that = this;
      this.queryDate = 0;
      [1, 3, 7, 15].forEach(function(d) {
        var tempDateStr = that
          .$moment()
          .subtract(d - 1, "days")
          .format("YYYYMMDD");
        if (tempDateStr === that.startDate) {
          that.queryDate = d;
          return;
        }
      });
    },
    changeDate(dateNum) {
      this.queryDate = dateNum;
      //todo 根据查询日期,查询指定区间内的数据
      //将选择日志赋值给日期控件.
      this.startDate = this.$moment()
        .subtract(dateNum - 1, "days")
        .format("YYYYMMDD");
    },
    showPageInfo(systemId, pageId) {
      var content =
        '<div style="margin: 10px;"><table class="lha-pageinfo-table">' +
        "<tr><td>页面名</td><td>" +
        "pageInfo.pageName" +
        "</td></tr>" +
        "<tr><td>页面编码</td><td>" +
        "pageInfo.pageId" +
        "</td></tr>" +
        "<tr><td>页面Url</td><td>" +
        "pageInfo.url" +
        "</td></tr>" +
        "<tr><td>所属模块</td><td>" +
        "pageInfo.moduleName" +
        "</td></tr>" +
        "<tr><td>所属业务</td><td>" +
        "pageInfo.bizName" +
        "</td></tr>" +
        "</table></div>";
      this.$alert(content, "页面上下文", {
        dangerouslyUseHTMLString: true,
        closeOnClickModal: true
      });
    }
  }
};
</script>
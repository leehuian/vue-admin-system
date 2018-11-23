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
        <el-row :gutter="10">
            <el-col :span="16">
                <el-card shadow="always" style="height:510px;">
                    <div slot="header" class="card-titile">
                        <span>{{selectSystemName}}功能访问总览</span>
                    </div>
                    <div id="container1" style="min-width:400px;height:400px"></div>
                </el-card>
            </el-col>
            <el-col :span="8">
                    <el-card shadow="always" style="height:510px;overflow: auto;">
                        <div slot="header" class="card-titile">
                            <span>转化率最低的10个功能</span>
                        </div>
                        <ul>
                            <li class="warning-log" v-for="(item,index) in historyObj.warningLog" :key="'xiabiao_'+index">
                                <span>{{item.date}}</span>
                                <!-- <span>{{item.moduleName}}</span> -->
                                <span>{{item.functionName}}</span>
                                访问总量：<span class="icon-red">{{item.allReq}}</span>
                                成功量：<span class="icon-red">{{item.sucReq}}</span>
                                转化率：<span class="icon-red">{{item.sucRate}}%</span>
                            </li>
                        </ul>
                    </el-card>
            </el-col>
        </el-row>
        <el-row :gutter="10" style="margin-top:10px;">
            <el-col :span="24">
                <el-card shadow="always" class="all-view-table">
                    <div slot="header" class="card-titile" style="text-align:left;">
                        <span>下线视角(近三日新增无访问记录)</span>
                        <el-input v-model="searchUnReqText" placeholder="筛选关键词" style="width:300px;margin-left:10px;"></el-input>
                    </div>
                    <el-table :data="historyObj.unReqUrl.filter(data => !searchUnReqText || (data.url + data.pageId + data.pageName).toLowerCase().includes(searchUnReqText.toLowerCase()))" style="width:100%" max-height="600">
                        <el-table-column label="页面信息">
                            <el-table-column label="页面名称" width="150" prop="pageName"></el-table-column>
                            <el-table-column label="页面ID" width="100" prop="pageId"></el-table-column>                        
                            <el-table-column label="URL" prop="url"></el-table-column>
                        </el-table-column>
                        <el-table-column label="最近访问时间" prop="lastReqDate" width="100"></el-table-column>
                        <el-table-column label="操作" width="150">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-zoom-in" @click="gotoCanReach(scope.systemId, scope.pageId)">查询</el-button>
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
        <el-row :gutter="10" style="margin-top:10px;">
            <el-col :span="24">
                <el-card shadow="always">
                    <div slot="header" class="card-titile" style="text-align:left;">
                        <span>功能访问量云图</span>
                    </div>
                    <div id="container2" style="min-width:400px;height:600px"></div>
                </el-card>
            </el-col>
        </el-row>
        <el-row :gutter="10" style="margin-top:10px;">
            <el-col :span="24">
                <el-card shadow="always" class="all-view-table">
                    <div slot="header" class="card-titile" style="text-align:left;">
                        <span>模块功能概览</span>
                        <el-input v-model="searchText" placeholder="筛选关键词" style="width:300px;margin-left:10px;"></el-input>
                    </div>
                    <el-table :data="historyObj.allViewData.filter(data => !searchText || (data.moduleName + data.moduleEnName).toLowerCase().includes(searchText.toLowerCase()))" style="width:100%" max-height="600">
                        <el-table-column label="模块名称" width="150">
                            <template slot-scope="scope">
                                <span>{{scope.row.moduleName}}</span>
                                <el-tooltip class="item" effect="dark" content="点击查看该模块详情" placement="right">
                                    <i style="margin-left:10px;cursor:pointer;color:#2196f3;" class="el-icon-edit"></i>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column prop="moduleEnName" label="英文标识" width="150"></el-table-column>                        
                        <el-table-column label="功能总览">
                            <el-table-column label="资源平台功能数量" prop="netSourceFunctionCount"></el-table-column>
                            <el-table-column label="起始节点缺失数量" prop="missStartOrEndCount"></el-table-column>
                            <el-table-column label="自定义功能数量" prop="customerFunctionCount"></el-table-column>
                        </el-table-column>
                        <el-table-column label="近三日平均转化率">
                            <el-table-column label="T-1">
                                <template slot-scope="scope">
                                    <!-- 1. 为保证对齐，对于一位数，前面加空格 -->
                                    <span style="margin-right: 10px;display: inline-block;width: 30px;text-align: right;">{{ scope.row.oneDayBeforeRate>=10?scope.row.oneDayBeforeRate:'&nbsp;&nbsp;'+scope.row.oneDayBeforeRate}}</span>
                                    <!-- 昨天的转化率和前天的对比，然后显示 向上、向下、不显示箭头 -->
                                    <span style="display:inline-block;width:20px;text-align:left;">
                                        <i v-if="scope.row.oneDayBeforeRate>scope.row.twoDayBeforeRate" class="glyphicon glyphicon-arrow-up icon-red"></i>
                                        <i v-else-if="scope.row.oneDayBeforeRate<scope.row.twoDayBeforeRate" class="glyphicon glyphicon-arrow-down icon-green"></i>
                                    </span>
                                </template>
                            </el-table-column>
                            <el-table-column label="T-2" prop="twoDayBeforeRate"></el-table-column>
                            <el-table-column label="T-3" prop="threeDayBeforeR"></el-table-column>
                        </el-table-column>
                        <el-table-column label="关键页面">
                            <template slot-scope="scope">
                                <span>{{ scope.row.coreFuncId + '-' + scope.row.coreFuncName}}</span>
                                <el-tooltip class="item" effect="dark" content="点击查看该关键页面的具体信息" placement="top-end">
                                    <i style="margin-left:10px;color:blue;cursor:pointer;" class="el-icon-more"></i>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import * as Highcharts from "highcharts";
// 加载词云模块
import * as WordCloud from "highcharts/modules/wordcloud";
// 初始化词云模块
WordCloud(Highcharts);

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
      historyObj: dd.historyObj,
      searchText: "", //模块功能的搜索
      searchUnReqText: "" //下线视角的搜索
    };
  },
  computed: {
    selectSystemName: function() {
      var that = this;
      var name = that.selectSystemId;
      that.systemList.forEach(function(d) {
        if (d.systemId === that.selectSystemId) {
          name = d.systemName;
        }
      });
      return name;
    }
  },
  methods: {
    gotoCanReach(systemid, pageid) {
      //跳转到可达节点分析页面,并且带入指定的pageid
    },
    gotoNetRes() {
      //跳转到互联网资源平台
    },
    changeDate(dateNum) {
      this.queryDate = dateNum;
      //todo 根据查询日期,查询指定区间内的数据
    },
    drawHistory() {
      var dd = this.historyObj;
      var chart = Highcharts.chart("container1", {
        chart: {
          zoomType: "x"
        },
        title: {
          text: ""
        },
        credits: {
          enabled: false
        },
        xAxis: [
          {
            // categories: dd.timeLine,
            // crosshair: true,
            type: "datetime",
            dateTimeLabelFormats: {
              millisecond: "%H:%M:%S.%L",
              second: "%H:%M:%S",
              minute: "%H:%M",
              hour: "%H:%M",
              day: "%m-%d",
              week: "%m-%d",
              month: "%Y-%m",
              year: "%Y"
            }
          }
        ],
        yAxis: [
          {
            // Primary yAxis
            labels: {
              format: "{value}%",
              style: {
                color: Highcharts.getOptions().colors[0]
              }
            },
            title: {
              text: "转化率",
              style: {
                color: Highcharts.getOptions().colors[0]
              }
            },
            opposite: true
          },
          {
            // Secondary yAxis
            gridLineWidth: 0,
            title: {
              text: "人次",
              style: {
                color: Highcharts.getOptions().colors[1]
              }
            },
            labels: {
              format: "{value} /人次",
              style: {
                color: Highcharts.getOptions().colors[1]
              }
            },
            lineWidth: 1
          }
        ],
        tooltip: {
          shared: true
        },
        legend: {
          layout: "horizontal",
          // align: "left",
          // x: 80,
          // verticalAlign: "top",
          // y: 55,
          // floating: true,
          backgroundColor:
            (Highcharts.theme && Highcharts.theme.legendBackgroundColor) ||
            "#FFFFFF"
        },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                [0, Highcharts.getOptions().colors[0]],
                [
                  1,
                  Highcharts.Color(Highcharts.getOptions().colors[0])
                    .setOpacity(0)
                    .get("rgba")
                ]
              ]
            },
            marker: {
              radius: 2
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1
              }
            },
            threshold: null
          }
        },
        series: [
          {
            name: "平均功能成功数量",
            type: "area",
            yAxis: 1,
            data: dd.avgSucCount,
            tooltip: {
              valueSuffix: " 次"
            }
          },
          {
            name: "转化率",
            type: "spline",
            yAxis: 0,
            lineWidth: 1,
            data: dd.avgSucRate,
            marker: {
              enabled: false
            },
            tooltip: {
              valueSuffix: " %"
            }
          },
          {
            name: "平均访问总量",
            type: "spline",
            yAxis: 1,
            lineWidth: 1,
            data: dd.avgAllCount,
            marker: {
              enabled: false
            },
            // dashStyle: "shortdot",
            tooltip: {
              valueSuffix: " 次"
            }
          }
        ]
      });
    },
    drawFunctionCloud() {
      var dd = this.historyObj;
      Highcharts.chart("container2", {
        credits: {
          enabled: false
        },
        series: [
          {
            type: "wordcloud",
            data: dd.functionAllReqCount,
            name: "Occurrences"
          }
        ],
        title: {
          text: "交易功能频次云图"
        }
      });
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      this.drawHistory();
      this.drawFunctionCloud();
    });
  }
};
</script>


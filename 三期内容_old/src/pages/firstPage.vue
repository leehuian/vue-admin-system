<template>
    <div>
        <el-row :gutter="10">
            <el-col :span="16">
                <el-card shadow="always" style="height:510px;">
                    <div slot="header" class="card-titile">
                        <span>手机银行功能访问总览</span>
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
                        <input type="text" v-model="searchText" class="form-control" style="display:inline-block;width:200px;font-weight:400;font-size:14px;margin-left:20px;" placeholder="请输入模块名称进行查询...">
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

var dd = require("../testData/firstPage.json");

export default {
  data() {
    return {
      historyObj: dd.historyObj,
      searchText: ""
    };
  },
  methods: {
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

<style>
.warning-log {
  font-size: 14px;
  padding: 8px 0;
}

.card-titile {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
}

.all-view-table {
  text-align: center;
  color: #000;
}

.all-view-table .el-table thead.is-group th {
  text-align: center;
  color: #565656;
}

.icon-red {
  color: red;
}

.icon-green {
  color: green;
}
</style>


<template>
    <div>
        <el-cascader :options="moduleList" v-model="selectModuleId" change-on-select placeholder="请选择查询模块" filterable></el-cascader>
        <div style="display:inline-block;font-size:18px;margin-left:10px;font-weight:600">
            <span>{{moduleInfo.moduleName}}</span>
            <el-tooltip class="item" effect="dark" content="模块管理（互联网资源平台）" placement="top">
                <el-button type="primary" icon="el-icon-edit" circle></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="新增自定义功能" placement="top">
                <el-button type="primary" icon="el-icon-plus" circle></el-button>
            </el-tooltip>
        </div>
        <el-row :gutter="10">
            <el-col :span="8" v-for="item in moduleInfo.functionList" :key="item.functionId">
                <el-card shadow="always" style="margin:10px 10px 10px 0;">
                    <div slot="header" class="card-titile">
                        <span>{{item.functionName}}</span>
                        <span style="float:right;">
                            <el-tooltip class="item" effect="dark" content="修改交易功能信息" placement="top">
                                <i class="el-icon-edit"></i>
                            </el-tooltip>
                        </span>
                    </div>
                    <div class="functioninfo-list">
                        <div>
                            <span>自定义功能：</span>
                            <span>{{item.isCustomerDef}}</span>
                        </div>
                        <div>
                            <span>起始Funcid：</span>
                            <span>{{item.startFuncid}}</span>
                        </div>
                        <div>
                            <span>结束Funcid：</span>
                            <span>{{item.endFuncid}}</span>
                        </div>
                        <div>
                            <span>页面集合：</span>
                            <span>
                                <el-tag v-for="fid in item.allFuncid" :key="item.functionId + fid + '_all'">{{fid}}</el-tag>
                            </span>
                        </div>
                        <div>
                            <span>主路径：</span>
                            <span>
                                <template v-for="(fid,i) in item.mainPath">
                                    <span :key="item.functionId + fid + '_master'" style="color:red;">{{fid}}</span>
                                    <span v-if="i!=item.mainPath.length-1" :key="item.functionId + fid + '_master_fangxiang'" style="margin:0 5px;">→</span>
                                </template>
                            </span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-row  :gutter="10">
            <el-col :span="24">
                <el-card>
                    <div slot="header" class="card-titile">
                        功能关系网
                    </div>
                    <div id="functionRelation" style="min-width:400px;height:600px"></div>
                </el-card>
            </el-col>
        </el-row>
        <el-row  :gutter="10">
            <el-col :span="24">
                <el-card style="margin-top:10px;">
                    <div slot="header" class="card-titile">
                        功能转化率
                    </div>
                    <div id="functionTransRate" style="min-width:400px;height:400px"></div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<style>
div.functioninfo-list > div > span + span {
  padding-left: 10px;
  display: table;
}

div.functioninfo-list > div > span + span > span {
  display: inline-block;
}

div.functioninfo-list .el-tag + .el-tag {
  margin-left: 0;
}

div.functioninfo-list .el-tag {
  margin-right: 10px;
}

div.functioninfo-list > div > span:first-child {
  width: 90px;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  display: block;
  float: left;
}

div.functioninfo-list > div {
  padding-bottom: 5px;
}

div.functioninfo-list > div .el-tag {
  margin-top: 5px;
  padding: 0 5px;
}

div.functioninfo-list > div + div {
  padding-top: 5px;
  border-top: 1px solid #eeeeee;
  border-top-width: 0.5px;
}
</style>

<script>
import * as Highcharts from "highcharts";
import "../../assets/scripts/d3ext/forceGuide.js"; //力导向图

var dd = require("../../testData/moduleView.json");
export default {
  data() {
    return {
      moduleList: dd.moduleList,
      moduleInfo: dd.moduleInfo,
      selectModuleId: [],
      functionTransInfoList: dd.functionTransInfoList
    };
  },
  methods: {
    drawForce() {
      var functionList = this.moduleInfo.functionList;
      var nodelinks = [];
      for (let i = 0; i < functionList.length; i++) {
        var node1 = functionList[i];
        node1.allFuncid.forEach(function(fid) {
          nodelinks.push({
            source: node1.functionName,
            target: fid,
            remark: "master"
          });
        });
      }
      d3.forceGuide("#functionRelation", nodelinks);
    },
    drawTransRate() {
      var rateData = [];
      this.functionTransInfoList.forEach(function(info) {
        var singleData = [];
        info.data.forEach(function(d) {
          var t = Date.UTC(
            d[0].substr(0, 4),
            d[0].substr(4, 2) - 1, //月份需要-1
            d[0].substr(6, 2)
          );
          singleData.push([t, d[1]]);
        });
        rateData.push({
          name: info.functionName,
          data: singleData
        });
      });

      var chart = Highcharts.chart("functionTransRate", {
        chart: {
          type: "spline"
        },
        title: {
          text: this.moduleInfo.moduleName
        },
        xAxis: {
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
        },
        colors: ["#6CF", "#39F", "#06C", "#036", "#000"],
        yAxis: {
          title: {
            text: "转化率 (百分比)"
          },
          min: 0
        },
        tooltip: {
          headerFormat: "<b>功能：{series.name}</b><br>",
          pointFormat: "{point.x:%Y-%m-%d}: {point.y:.2f} %"
        },
        plotOptions: {
          spline: {
            marker: {
              enabled: true
            }
          }
        },
        series: rateData
      });
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      this.drawForce();
      this.drawTransRate();
    });
  }
};
</script>

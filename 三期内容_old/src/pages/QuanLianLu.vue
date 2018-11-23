<template>
    <div id="quanlianlu" style="margin:0 75px">
        <el-form ref="form" :inline="true" label-width="80px">
            <el-form-item>
                <el-select v-model="inputType" placeholder="查询类型" @change="typeChange">
                    <el-option label="交易功能(互联网资源平台)" value="byRestful"></el-option>
                    <el-option label="交易功能(自定义功能)" value="byCustomer"></el-option>
                    <el-option label="手动输入" value="byInput"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <!-- <el-date-picker type="date" placeholder="选择日期" v-model="form.startDate" format="yyyy 年 MM 月 dd 日" value-format="yyyyMMdd"></el-date-picker> -->
                <el-date-picker v-model="form.startDate" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions" format="yyyy 年 MM 月 dd 日" value-format="yyyyMMdd">
    </el-date-picker>
            </el-form-item>
            <div style="display:inline-block;" v-if="inputType=='byCustomer' || inputType=='byRestful'">
                <el-form-item>
                <el-select v-model="gn_biz" filterable placeholder="选择业务">
                    <el-option v-for="item in gongneng_biz" :key="item.bizId" :label="item.bizName" :value="item.bizId">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="gn_module" filterable placeholder="选择模块">
                    <el-option v-for="item in gongneng_module" :key="item.moduleId" :label="item.moduleName" :value="item.moduleId">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-select v-model="gn_func" filterable placeholder="选择功能">
                    <el-option v-for="item in gongneng_func" :key="item.functionId" :label="item.functionName" :value="item.functionId">
                    </el-option>
                </el-select>
            </el-form-item>
            </div>
            <div style="display:inline-block;" v-else>
                <el-form-item>
                    <el-autocomplete class="inline-input" v-model="form.startFuncId" :fetch-suggestions="querySearch" placeholder="起始FuncID"
                        :trigger-on-focus="false" @select="handleSelect1"></el-autocomplete>
                </el-form-item>
                <el-form-item>
                    <el-autocomplete class="inline-input" v-model="form.endFuncId" :fetch-suggestions="querySearch" placeholder="结束FuncID" :trigger-on-focus="false"
                        @select="handleSelect2"></el-autocomplete>
                </el-form-item>
            </div>
            <el-form-item>
                <el-button type="primary" @click="onSubmit" v-loading.fullscreen.lock="fullscreenLoading">查询</el-button>
            </el-form-item>
        </el-form>
        <div>
            <el-table @current-change="rowClick" :data="resultData.pathData" stripe border highlight-current-row
                max-height="300" style="width: 100%;border:2px solid #fff">
                <el-table-column type="index" align="center" width="100"></el-table-column>
                <el-table-column prop="funcidPath" label="路径（funcId）">
                    <template slot-scope="scope">
                        <div v-if="isUnReachRow(scope.row.funcidPath)" style="color:red">
                            {{scope.row.funcidPath}}
                            <span class="unReachFlag">无访问路径</span>
                        </div>
                        <span v-else >{{scope.row.funcidPath}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="funcnamePath" sortable label="路径（name）">
                    <template slot-scope="scope">
                        <template v-for="(item,i) in scope.row.funcnamePath.split('-')">
                            <span v-if="i!=0"> - </span>
                            <el-tag type="primary">{{item}}</el-tag>
                        </template>
                        
                    </template>
                </el-table-column>
                <el-table-column prop="pathCount" sortable label="请求数量" width="110"></el-table-column>
                <el-table-column prop="pathLen" sortable label="节点数量" width="110"></el-table-column>
            </el-table>
        </div>
        
        <el-card>
            <div slot="header">
                <span>请求路径拓扑图</span>
                <span v-if="resultData.pathData && resultData.pathData.length>1" @dblclick="showAllData" style="color: blue;font-weight: 600;margin-left: 5px;cursor:pointer;">显示全部</span>
                <span v-if="resultData.pathData && resultData.pathData.length>1" style="font-size:8px;">（双击显示全部）</span>
            </div>
            <div class="topo-title">{{topoTitle}}</div>
            <div id="container" onselectstart="return false" style="-moz-user-select:none;">
            </div>
        </el-card>
        <el-card>
            <div slot="header">
                <span>使用说明</span>
            </div>
            <ul>
                <li>红色描述文字和节点表示该路径在当天未被访问到。</li>
                <li>如果查询的开始节点、结束节点有数据，在拓扑图的左上角有<span style="color: blue;">显示全部</span>,双击可显示全部路径。</li>
                <li>按照功能选择，有互联网资源平台和自定义功能两个数据源，自定义功能是在功能管理页面定义的数据；互联网资源平台的数据，是从资源平台获取的数据，两者的数据定义有所区别。自定义功能的一个funcid可以归属为多个功能，而资源平台则不可以。</li>
                <li>建议使用Chrome浏览器查看页面。</li>
                <li style="color:red;">因数据统计需要，部分6位的funcid通过前面补0组成了7位。<br>例如：101166 → 0101166</li>
            </ul>
        </el-card>
    </div>
</template>
<script>
import "../assets/d3/d3.js";
var $ = require("jquery");
var tools = require("../assets/scripts/commTool.js");
var drawTopologyFunction = require("../assets/scripts/quanlujing.js");
export default {
  data() {
    return {
      topoTitle: "暂无数据",
      fullscreenLoading: false,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            }
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            }
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            }
          }
        ]
      },
      form: {
        startDate: new tools().addDate(new Date(), -2),
        startFuncId: "",
        endFuncId: ""
      },
      inputType: "byRestful",
      submitDateFormat: "",
      gn_biz: "",
      gn_module: "",
      gn_func: "",
      productLevelModel: [], //选择的级联数据
      productLevelModelFromCustmer: [], // 自定义的级联数据
      productLevelModelFromRestful: [], //互联网资源平台的级联数据
      drawTopology: {}, //画图的对象。
      resultData: {}
    };
  },
  watch: {
    gn_biz(newValue, oldValue) {
      this.gn_module = "";
      this.gn_func = "";
      this.form.startFuncId = "";
      this.form.endFuncId = "";
    },
    gn_module(newValue, oldValue) {
      this.form.startFuncId = "";
      this.form.endFuncId = "";
      this.gn_func = "";
    },
    gn_func(newValue, oldValue) {
      this.form.startFuncId = "";
      this.form.endFuncId = "";
      for (var idx in this.gongneng_func) {
        var item = this.gongneng_func[idx];
        if (item.functionId == this.gn_func) {
          //判定选择的功能是否具有起始、结束标记
          if (!item.startFuncid && !item.endFuncid) {
            this.$message({
              showClose: true,
              message: "该功能未在互联网资源平台定义起始页面和结束页面",
              type: "error"
            });
            this.gn_func = "";
            return;
          }

          //未定义起始funcid或者结束funcid，将起始节点与结束节点设置为同一个funcid
          if (!item.startFuncid) {
            this.form.startFuncId = item.endFuncid;
            this.form.endFuncId = item.endFuncid;
          } else if (!item.endFuncid) {
            this.form.startFuncId = item.startFuncid;
            this.form.endFuncId = item.startFuncid;
          } else {
            this.form.startFuncId = item.startFuncid;
            this.form.endFuncId = item.endFuncid;
          }
          break;
        }
      }
    }
  },
  computed: {
    gongneng_biz: function() {
      var list = [];
      for (var idx in this.productLevelModel) {
        var item = this.productLevelModel[idx];
        list.push({
          bizName: item.bizName,
          bizId: item.bizId
        });
      }
      return list;
    },
    gongneng_module: function() {
      for (var idx in this.productLevelModel) {
        var item = this.productLevelModel[idx];
        if (item.bizId == this.gn_biz) {
          return item.modules;
        }
      }
      return [];
    },
    gongneng_func: function() {
      for (var idx in this.gongneng_module) {
        var item = this.gongneng_module[idx];
        if (item.moduleId == this.gn_module) {
          return item.functions;
        }
      }
      return [];
    }
  },
  methods: {
    isUnReachRow(funcidList) {
      var arr = funcidList.split("-");
      for (var i = 0; i < arr.length; i++) {
        if (this.resultData.unReachFuncidList.indexOf(arr[i]) > -1) {
          return true;
        }
      }
      return false;
    },
    showAllData() {
      this.topoTitle = "显示全部数据";
      this.drawTopology.changePath(["全", "部"]);
    },
    rowClick(row, event, column) {
      this.topoTitle = row.funcnamePath;
      this.drawTopology.changePath([row.funcidPath], row.pathCount);
    },
    typeChange(d) {
      this.form.startFuncId = "";
      this.form.endFuncId = "";
      this.gn_biz = "";
      this.gn_module = "";
      this.gn_func = "";
      if (d == "byRestful") {
        this.productLevelModel = this.productLevelModelFromRestful;
      } else if (d == "byCustomer") {
        this.productLevelModel = this.productLevelModelFromCustmer;
      }
    },
    querySearch(queryString, cb) {
      var restaurants = [{ value: "至少输入两位有效数字", realValue: "" }];
      if ($.trim(queryString).length < 2) {
        cb(restaurants);
      } else {
        $.ajax({
          url: "querySearchFuncid.do",
          data: { queryString: queryString },
          success: function(data) {
            if (data.errCode == 200) {
              var results = data.data;
              for (var i in results) {
                results[i].value =
                  results[i].name + "(" + results[i].funcId + ")";
              }
              // 调用 callback 返回建议列表的数据
              cb(results);
            }
          },
          error: function(a, b, c) {
            console.log(c);
          }
        });
      }
    },
    handleSelect1(item) {
      this.form.startFuncId = item.funcId;
    },
    handleSelect2(item) {
      this.form.endFuncId = item.funcId;
    },
    smoothscroll() {
      $("html, body").animate(
        { scrollTop: $("#container").offset().top },
        1000
      );
    },
    onSubmit() {
      try {
        if (this.form.startFuncId == "" && this.form.endFuncId == "") {
          this.$message({
            type: "warning",
            message: "请输入全部参数"
          });
          return false;
        }
        if (this.form.startFuncId == "") {
          this.form.startFuncId = this.form.endFuncId;
          this.$message({
            type: "warning",
            message: "该功能只有结束funcid"
          });
        } else if (this.form.endFuncId == "") {
          this.form.endFuncId = this.form.startFuncId;
          this.$message({
            type: "warning",
            message: "该功能只有起始funcid"
          });
        }

        this.smoothscroll();
        this.fullscreenLoading = true;
        this.submitDateFormat = this.form.startDate;
        var that = this;
        $.ajax({
          url: "queryAllLianLu.do",
          data: that.form,
          success: function(data) {
            if (data.errCode == 200) {
              that.resultData = data.data;
              that.topoTitle = "显示全部数据";
              that.drawTopology = new drawTopologyFunction(that);
              if (
                !that.resultData.pathData ||
                that.resultData.pathData.length < 1
              ) {
                that.fullscreenLoading = false;
                that.$alert("查无数据", "查询失败");
                return;
              }
              that.drawTopology.create(
                that.resultData.pathData,
                that.resultData.unReachFuncidList
              );
            } else {
              that.$alert(data.errMsg, "查询失败");
            }
            that.fullscreenLoading = false;
          },
          error: function(a, b, c) {
            that.$alert(c, "查询失败");
            that.fullscreenLoading = false;
          }
        });
      } catch (err) {
        this.fullscreenLoading = false;
        that.$alert(err.message, "数据异常");
      }

      //   var pathData = [
      //     {
      //       funcidPath: "1000001-1000007-1000008-1000009-1000001",
      //       funcnamePath: "理财产品列表-理财持仓07-理财08-理财09-理财产品列表",
      //       pathLen: 5,
      //       pathCount: 120
      //     },
      //     {
      //       funcidPath: "1000001-1000009-1000001",
      //       funcnamePath: "理财产品列表-理财09-理财产品列表",
      //       pathLen: 3,
      //       pathCount: 110
      //     },
      //     {
      //       funcidPath: "1000001-1000011-1000012-1000013-1000001",
      //       funcnamePath: "理财产品列表-理财持仓11-理财12-理财13-理财产品列表",
      //       pathLen: 5,
      //       pathCount: 190
      //     },
      //     {
      //       funcidPath: "1000001-1000007-1000011-1000012-1000001",
      //       funcnamePath: "理财产品列表-理财持仓07-理财11-理财12-理财产品列表",
      //       pathLen: 5,
      //       pathCount: 48
      //     },
      //     {
      //       funcidPath: "1000001-1000002-1000003-1000004-1000001",
      //       funcnamePath:
      //         "理财产品列表-理财持仓列表-理财详情-理财购买-理财产品列表",
      //       pathLen: 5,
      //       pathCount: 100
      //     },
      //     {
      //       funcidPath: "1000001-1000002-1000003-1000004-1000001",
      //       funcnamePath:
      //         "理财产品列表-理财持仓列表-理财详情-理财购买-理财产品列表",
      //       pathLen: 5,
      //       pathCount: 72
      //     },
      //     {
      //       funcidPath:
      //         "1000001-1000021-1000022-1000023-1000024-1000025-1000023-1000001",
      //       funcnamePath:
      //         "理财产品列表-理财21-理财22-理财23-理财24-理财25-理财23-理财产品列表",
      //       pathLen: 5,
      //       pathCount: 150
      //     },
      //     {
      //       funcidPath: "1000001-1000031-1000001",
      //       funcnamePath: "理财产品列表-理财31-理财产品列表",
      //       pathCount: 28
      //     },
      //     {
      //       funcidPath: "1000001-1000032-1000001",
      //       funcnamePath: "理财产品列表-理财32-理财产品列表",
      //       pathCount: 26
      //     },
      //     {
      //       funcidPath: "1000001-1000032-1000031-1000001",
      //       funcnamePath: "理财产品列表-理财32-理财31-理财产品列表",
      //       pathCount: 25
      //     }
      //   ];
      //   var unReachFuncidList = ["1000031"];
      //   this.resultData.pathData = pathData;
      //   this.resultData.unReachFuncidList = unReachFuncidList;
      //   var that = this;
      //   that.topoTitle = "显示全部数据";
      //   that.drawTopology = new drawTopologyFunction(that);
      //   that.drawTopology.create(pathData, unReachFuncidList);
    },
    queryFuncidInfo(funcId) {
      var that = this;
      var nodeInfo;
      $.ajax({
        url: "queryFuncidInfo.do",
        data: { funcid: funcId, dateFormat: that.submitDateFormat },
        async: false,
        success: function(data) {
          if (data.errCode == 200) {
            nodeInfo = data.data;
          } else {
            console.log(data.errMsg);
          }
        },
        error: function(a, b, c) {
          console.log(c);
        }
      });
      return nodeInfo;
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      var that = this;

      //自定义的功能级联数据
      $.ajax({
        url: "queryProductLevel.do",
        success: function(data) {
          if (data.errCode == 200) {
            that.productLevelModelFromCustmer = data.data.bizs;
            if (that.inputType == "byCustomer") {
              that.productLevelModel = data.data.bizs;
            }
          } else {
            console.log(data.errMsg);
          }
        },
        error: function(xhr, status, err) {
          console.log(err);
        }
      });

      //互联网资源平台的功能级联数据
      $.ajax({
        url: "queryProductLevelFromRestful.do",
        success: function(data) {
          if (data.errCode == 200) {
            that.productLevelModelFromRestful = data.data.bizs;
            if (that.inputType == "byRestful") {
              that.productLevelModel = data.data.bizs;
            }
          } else {
            console.log(data.errMsg);
          }
        },
        error: function(xhr, status, err) {
          console.log(err);
        }
      });
    });
  }
};
</script>
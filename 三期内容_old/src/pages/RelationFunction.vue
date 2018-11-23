<template>
    <div id="quanlianlu" style="margin:0 75px">
        <el-form ref="form" :inline="true" label-width="80px">
            <el-form-item>
                <el-select v-model="inputType" placeholder="查询类型" @change="typeChange">
                    <el-option label="交易功能(互联网资源平台)" value="byRestful"></el-option>
                    <el-option label="交易功能(自定义功能)" value="byCustomer"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <!-- <el-date-picker type="date" placeholder="选择日期" v-model="form.startDate" format="yyyy 年 MM 月 dd 日" value-format="yyyyMMdd"></el-date-picker> -->
                <el-date-picker v-model="form.startDate" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions" format="yyyy 年 MM 月 dd 日" value-format="yyyyMMdd"></el-date-picker>
            </el-form-item>
            <div style="display:inline-block;">
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
            <el-form-item>
                <el-button type="primary" @click="onSubmit" v-loading.fullscreen.lock="fullscreenLoading">查询</el-button>
            </el-form-item>
        </el-form>
        <el-card>
            <div slot="header">
                <span>功能关联性分析</span>
            </div>
            <div id="container" onselectstart="return false" style="-moz-user-select:none;">
            </div>
        </el-card>
        <el-card>
            <div slot="header">
                <span>使用说明</span>
            </div>
            <ul>
                <li>中间矩形区域中的内容表示该功能下的所有的funcid</li>
                <li>
                    矩形区域左侧的功能表示所有跳入到本功能的其他关联功能<br>
                    右侧表示从本功能跳出到其他功能的所有节点的集合
                </li>
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
var drawRelationFunc = require("../assets/scripts/relationFunction.js");

export default {
  data() {
    return {
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
      selectFunctionItem: {} //选中的交易功能
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
      this.selectFunctionItem = {};
      for (var idx in this.gongneng_func) {
        var item = this.gongneng_func[idx];
        if (item.functionId == this.gn_func) {
          this.selectFunctionItem = item;
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
    smoothscroll() {
      $("html, body").animate(
        { scrollTop: $("#container").offset().top },
        1000
      );
    },
    onSubmit() {
      try {
        if (this.form.startFuncId == "" || this.form.endFuncId == "") {
          this.$message({
            type: "warning",
            message: "请输入全部参数"
          });
          return false;
        }
        this.smoothscroll();
        this.fullscreenLoading = true;
        var that = this;
        $.ajax({
          url: "queryRelationFunctions",
          data: {
            dateFormat: this.form.startDate,
            startFuncid: this.form.startFuncId,
            endFuncid: this.form.endFuncId,
            funcids: this.selectFunctionItem.funcids
          },
          success: function(data) {
            if (data.errCode == 200) {
              that.drawTopology = new drawRelationFunc(that);
              that.drawTopology.drawRelation(data.data);
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
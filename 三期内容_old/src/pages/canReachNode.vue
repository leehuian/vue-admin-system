<template>
    <div id="quanlianlu" style="margin:0 75px">
        <el-form :inline="true">
            <el-form-item label="">
                <!-- <el-date-picker type="date" placeholder="选择统计日期" v-model="form.startDate" format="yyyy 年 MM 月 dd 日" value-format="yyyyMMdd"></el-date-picker> -->
                <el-date-picker v-model="form.startDate" align="right" type="date" placeholder="选择日期" :picker-options="pickerOptions" format="yyyy 年 MM 月 dd 日" value-format="yyyyMMdd"></el-date-picker>
            </el-form-item>
            <div style="display:inline-block;">
                <el-form-item>
                    <el-autocomplete
                        class="el-input__inner" 
                        style="border: 0px;outline:none;padding:0;" 
                        v-model="selectFuncidRem" 
                        :fetch-suggestions="querySearchFuncid" 
                        placeholder="请输入"
                        :trigger-on-focus="false" 
                        @select="handleSelect">
                    </el-autocomplete>
                </el-form-item>
            </div>
            <el-form-item>
                <el-button type="primary" @click="onSubmit" v-loading.fullscreen.lock="fullscreenLoading">查询</el-button>
            </el-form-item>
        </el-form>
        <el-card>
            <div slot="header">
                <span>可达节点拓展</span>
            </div>
            <div id="container"></div>
        </el-card>
        <el-card>
            <div slot="header">
                <span>使用说明</span>
            </div>
            <ul>
                <li>初始时选择一个funcid，通过点击funcid，弹出该funcid在选择日期的所有输入输出节点</li>
                <li>
                    <span style="color:chocolate">橘黄色</span>表示输入节点<br>
                    <span style="color:cadetblue">藏青色</span>表示输出节点
                    </li>
                <li>点击输入、输出节点，会将该节点置为主节点，并且查询该节点的输入输出节点</li>
                <li>点击主路径上的节点，弹出的输入、输出节点，移除了左右两侧的节点</li>
                <li>建议使用Chrome浏览器查看页面。</li>
                <li style="color:red;">因数据统计需要，部分6位的funcid通过前面补0组成了7位。<br>例如：101166 → 0101166</li>
            </ul>
        </el-card>
    </div>
</template>
<style>
.canReachMainNode {
  background-color: lightslategray;
  color: #ffffff;
}

.canReachHelpNode {
  border-radius: 10px;
  position: absolute;
  color: rgb(255, 255, 255);
  text-align: center;
}

.canReachHelpNode.in {
  background-color: chocolate;
}

.canReachHelpNode.out {
  background-color: cadetblue;
}
</style>
<script>
import "../assets/d3/d3.js";
var $ = require("jquery");
var tools = require("../assets/scripts/commTool.js");
var drawFunc = require("../assets/scripts/canReachNode");
export default {
  data() {
    return {
      fullscreenLoading: false, //页面加载遮罩层是否显示的标记
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
        startFuncId: ""
      },
      realStartDate: "",
      selectFuncidRem: ""
    };
  },
  watch: {},
  methods: {
    querySearchFuncid(queryString, cb) {
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
    },
    handleSelect(item) {
      console.log(item);
      this.form.startFuncId = item.funcId;
    },
    smoothscroll() {
      var currentScroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(this.smoothscroll);
        window.scrollTo(0, currentScroll - currentScroll / 5);
      }
    },
    queryInOut(funcId) {
      var that = this;
      var resultData = {};
      $.ajax({
        url: "queryCanReachFuncid.do", //查询所有可达页面
        data: { startDate: that.realStartDate, funcid: funcId },
        async: false,
        success: function(data) {
          if (data.errCode == 200) {
            resultData = data.data;
          } else {
            that.$message({
              showClose: true,
              message: data.errMsg,
              type: "error"
            });
          }
          that.fullscreenLoading = false;
        },
        error: function(a, b, c) {
          that.$message({
            showClose: true,
            message: c,
            type: "error"
          });
          that.fullscreenLoading = false;
        }
      });
      return resultData;
    },
    onSubmit() {
      //输入参数校验;
      if (!this.form.startDate || !this.form.startFuncId) {
        this.$alert("请确认参数全部输入", "参数错误", {
          confirmButtonText: "确定"
        });
        return false;
      }

      this.smoothscroll();
      this.realStartDate = this.form.startDate;
      var data = this.queryInOut(this.form.startFuncId);
      this.drawCanReach(data);
    },
    drawCanReach(sourceData) {
      var drawFuncObj = new drawFunc(this, sourceData, "#container");
      drawFuncObj.init();
    }
  }
};
</script>
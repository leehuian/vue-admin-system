<template>
    <div>
        <el-card style="min-width:800px;max-width:1000px;margin:0 auto;">
            <div slot="header" class="card-titile">
                可达节点
            </div>
            <el-form label-width="100px">
                <el-form-item label="查询类型">
                    <el-radio-group v-model="queryType">
                        <el-radio :label="0">向下查询</el-radio>
                        <el-radio :label="1">向上查询</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="选择页面">
                    <el-select v-model="selectBiz" placeholder="业务">
                        <el-option
                        v-for="item in bizList"
                        :key="item.bizId"
                        :label="item.bizName"
                        :value="item.bizId">
                        </el-option>
                    </el-select>
                    <el-select v-model="selectModule" placeholder="模块">
                        <el-option
                        v-for="item in moduleList"
                        :key="item.moduleId"
                        :label="item.moduleName"
                        :value="item.moduleId">
                        </el-option>
                    </el-select>
                    <el-select v-model="selectPage" filterable placeholder="要查询的页面">
                        <el-option
                        v-for="item in pageList"
                        :key="item.pageId"
                        :label="item.pageName"
                        :value="item.pageId">
                        </el-option>
                    </el-select>
                </el-form-item>     
                <el-form-item>
                    <el-button type="primary" @click="doQuery">查询</el-button>
                </el-form-item>
            </el-form>
            <div id="canReachTree" style="width:100%;height:800px;"></div>
        </el-card>
    </div>
</template>
<style scope>
.node circle {
  fill: #fff;
  stroke: steelblue;
  stroke-width: 1.5px;
}

.node {
  font: 12px sans-serif;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2.5px;
}
</style>
<script>
import "../../assets/d3/d3.js";
var $ = require("jquery");

var dd = require("../../testData/canReachNodeNew.json");
var drawD3Tree = require("../../assets/scripts/d3ext/canReachNode.js");

export default {
  data() {
    return {
      queryType: 0, //0:向下查询；1:向上查询
      pageList: [],
      moduleList: [],
      bizList: [],
      selectBiz: "",
      selectModule: "",
      selectPage: ""
    };
  },
  computed: {},
  methods: {
    doQuery() {
      //查询详情
      var root = {
        name: "受托购买",
        pageId: "1001001",
        pageName: "受托购买",
        children: [
          { name: "受托详情2", pageId: "1001002", pageName: "受托详情2" },
          { name: "受托详情3", pageId: "1001003", pageName: "受托详情3" },
          { name: "受托详情4", pageId: "1001004", pageName: "受托详情4" },
          { name: "受托详情5", pageId: "1001005", pageName: "受托详情5" },
          { name: "受托详情6", pageId: "1001006", pageName: "受托详情6" },
          { name: "受托详情7", pageId: "1001007", pageName: "受托详情7" },
          { name: "受托详情8", pageId: "1001008", pageName: "受托详情8" },
          { name: "受托详情9", pageId: "1001009", pageName: "受托详情9" }
        ]
      };
      drawD3Tree("#canReachTree", root);
    }
  },
  watch: {
    selectBiz: function(newValue, oldValue) {
      this.selectModule = "";
      //TODO 查询对应新的biz下的modulelist
      console.log("selectBiz", newValue);
    },
    selectModule: function(newValue, oldValue) {
      this.selectPage = "";
      //查找对应新的module下的pagelist;
      console.log("selectModule", newValue);
    },
    selectPage: function(newValue, oldValue) {
      //触发重新绘图。
      console.log("selectPage", newValue);
    }
  },
  mounted() {
    this.bizList = dd.bizList;
    this.moduleList = dd.moduleList;
    this.pageList = dd.pageList;
  }
};
</script>


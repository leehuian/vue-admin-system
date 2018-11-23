<template>
    <div>
        <el-card style="min-width:800px;max-width:1000px;margin:0 auto;">
            <div slot="header" class="card-titile">
                新增自定义功能
            </div>
            <el-form label-width="100px">
                <el-form-item label="资源类型">
                    <el-radio-group v-model="sourceType">
                        <el-radio :label="1">本平台自定义功能</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="功能选择">
                    <el-cascader :options="moduleList" v-model="selectModuleId" :change-on-select="false" placeholder="请选择查询模块" filterable></el-cascader>
                </el-form-item>
                <el-form-item label="功能名称">
                    <el-input v-model="functionInfo.functionName"></el-input>
                </el-form-item>
                <el-form-item label="A角">
                    <el-input v-model="functionInfo.manageA"></el-input>
                </el-form-item>
                <el-form-item label="B角">
                    <el-input v-model="functionInfo.manageB"></el-input>
                </el-form-item>
                <el-form-item label="功能起点">
                    <el-autocomplete
                        v-model="startFuncid"
                        :fetch-suggestions="querySearch"
                        placeholder="请选择功能起点页"
                        value-key="name"
                        value="funcid"
                        @select="startSelect">
                        <span slot-scope="{ item }">
                            {{item.name}} - {{item.funcid}}
                        </span>
                    </el-autocomplete>
                </el-form-item>
                <el-form-item label="功能终点">
                    <el-autocomplete
                        v-model="endFuncid"
                        :fetch-suggestions="querySearch"
                        placeholder="请选择功能结束页"
                        value-key="name"
                        value="funcid"
                        @select="endSelect">
                        <span slot-scope="{ item }">
                            {{item.name}} - {{item.funcid}}
                        </span>
                    </el-autocomplete>
                </el-form-item>
                <el-form-item label="页面集合">
                    <div style="padding:5px;border:1px solid #eee;" class="functioninfo-list">
                        <template v-for="(fid,i) in functionInfo.allFuncids">    
                            <el-tooltip class="item" effect="dark" :content="fid.name" placement="top-start" :key="'tooltip_'+fid.funcid">
                                <el-tag :key="fid.funcid" closable @close="handleClose(i)">
                                    {{fid.funcid}}
                                </el-tag>
                            </el-tooltip>
                        </template>
                        <el-autocomplete
                            v-model="tempFuncid"
                            :fetch-suggestions="querySearch"
                            placeholder="请选择途径页面"
                            @select="allFuncidSelect"
                            value="funcid">
                            <span slot-scope="{ item }">
                                {{item.name}} - {{item.funcid}}
                            </span>
                        </el-autocomplete>
                    </div>
                </el-form-item>
                <el-form-item label="主路径">
                    <div v-if="functionInfo.mainPath && functionInfo.mainPath.length>0" style="padding:5px;border:1px solid #eee;">
                        <template v-for="(fid,i) in mainPathArr">
                            <span v-if="i>0" :key="'jiantou_'+fid">→</span>
                            <el-button size="small" round :key="'main_path_'+fid" style="margin-right:5px;">{{fid}}</el-button>
                        </template>
                    </div>
                </el-form-item>
                <el-form-item label="设置主路径">
                    <div class="function-transfer">
                        <el-transfer 
                            :props="{key:'funcid',value:'name'}" 
                            :data="functionInfo.allFuncids" 
                            v-model="mainPathArr" 
                            target-order="push"
                            filterable
                            :titles="['源页面','主路径']">
                            <span slot-scope="{ option }">
                                {{ option.name }}
                                <span class="up-down-icon">
                                    <el-tooltip class="item" effect="dark" content="上升" placement="top-end">
                                        <i class="el-icon-sort-up" @click="upList(option.funcid)"></i>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="下调" placement="top-start">
                                        <i class="el-icon-sort-down" @click="downList(option.funcid)"></i>
                                    </el-tooltip>
                                </span>
                            </span>
                        </el-transfer>
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" @click="doSave">保存</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>
<style>
.function-transfer .el-transfer-panel {
  width: 300px;
}

.function-transfer .el-checkbox {
  cursor: default;
}

.function-transfer .el-checkbox .up-down-icon {
  cursor: pointer;
}

.up-down-icon {
  margin-left: 10px;
}

.up-down-icon i + i {
  margin-left: 5px;
}

.el-transfer .el-transfer-panel:first-child .up-down-icon {
  display: none;
}

.el-transfer .el-transfer-panel:last-child .up-down-icon {
  display: inline-block;
}
</style>
<script>
var dd = require("../../testData/addFunction.json");
var $ = require("jquery");

export default {
  data() {
    return {
      sourceType: 1, //0:互联网资源平台功能；1:自定义功能
      moduleList: dd.moduleList, //模块连接数据
      selectModuleId: [], //选择的模块
      functionInfo: {
        //需要将Object对象中的各个属性都罗列出来，否则无法侦听变化
        functionName: "",
        functionId: "",
        manageA: "",
        manageB: "",
        startFuncid: "",
        endFuncid: "",
        allFuncids: [],
        mainPath: ""
      },
      funcidList: dd.funcidList, //选择模块下的所有funcid集合
      tempFuncid: "",
      ////下面是辅助参数///
      startFuncid: "",
      endFuncid: ""
    };
  },
  computed: {
    mainPathArr: {
      get: function() {
        return this.functionInfo.mainPath
          ? this.functionInfo.mainPath.split(",")
          : [];
      },
      set: function(newValue) {
        this.functionInfo.mainPath = newValue.join(",");
      }
    }
  },
  methods: {
    startSelect(item) {
      this.functionInfo.startFuncid = item.funcid;
      this.functionInfo.allFuncids = this.functionInfo.allFuncids || [];
      if (this.functionInfo.allFuncids.indexOf(item) == -1)
        this.functionInfo.allFuncids.push(item);
    },
    endSelect(item) {
      this.functionInfo.endFuncid = item.funcid;
      this.functionInfo.allFuncids = this.functionInfo.allFuncids || [];
      if (this.functionInfo.allFuncids.indexOf(item) == -1)
        this.functionInfo.allFuncids.push(item);
    },
    allFuncidSelect(item) {
      //如果开始是空
      if (!this.functionInfo.allFuncids) {
        this.functionInfo.allFuncids = [item];
      } else {
        var idx = this.functionInfo.allFuncids.indexOf(item);
        if (idx == -1) {
          this.functionInfo.allFuncids.push(item);
        }
      }
    },
    //搜索funcid的方法part1
    querySearch(queryString, cb) {
      var restaurants = this.funcidList;
      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    //搜索funcid的方法part2
    createFilter(queryStr) {
      return restaurant => {
        return (
          restaurant.funcid.toLowerCase().indexOf(queryStr.toLowerCase()) !=
            -1 ||
          restaurant.name.toLowerCase().indexOf(queryStr.toLowerCase()) != -1
        );
      };
    },
    handleClose(idx) {
      console.log(idx);
      var fid = this.functionInfo.allFuncids[idx];
      this.functionInfo.allFuncids.splice(idx, 1); //在全部页面中移除该funcid
      //如果主路径中有该funcid，也一并移除
      this.functionInfo.mainPath = this.functionInfo.mainPath.replace(
        "," + fid.funcid,
        ""
      );
      this.functionInfo.mainPath = this.functionInfo.mainPath.replace(
        fid.funcid,
        ""
      );
    },
    doSave() {
      console.log("这里需要将info信息提交保存");
    },
    upList(funcid) {
      var index = this.mainPathArr.indexOf(funcid);
      if (index == 0 || !index) {
        return;
      }
      var beforeArr1 = this.mainPathArr.slice(0, index - 1);
      var beforeArr2 = this.mainPathArr.slice(index - 1, index);
      var source = this.mainPathArr.slice(index, index + 1);
      var afterArr = this.mainPathArr.slice(index + 1);
      var newArr = beforeArr1
        .concat(source)
        .concat(beforeArr2)
        .concat(afterArr);
      this.mainPathArr = newArr;
      this.$nextTick(function() {
        $(".el-transfer-panel:last-child .el-checkbox__inner").click();
        $(".el-transfer-panel:last-child .el-checkbox__inner").click();
      });
    },
    downList(funcid) {
      var index = this.mainPathArr.indexOf(funcid);
      if (index == this.mainPathArr.length - 1) {
        return;
      }
      var beforeArr = this.mainPathArr.slice(0, index);
      var source = this.mainPathArr.slice(index, index + 1);
      var afterArr1 = this.mainPathArr.slice(index + 1, index + 2);
      var afterArr2 = this.mainPathArr.slice(index + 2);
      var newArr = beforeArr
        .concat(afterArr1)
        .concat(source)
        .concat(afterArr2);
      this.mainPathArr = newArr;
      this.$nextTick(function() {
        $(".el-transfer-panel:last-child .el-checkbox__inner").click();
        $(".el-transfer-panel:last-child .el-checkbox__inner").click();
      });
    }
  }
};
</script>


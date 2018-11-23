<template>
    <div>
        <el-card style="min-width:800px;max-width:1000px;margin:0 auto;">
            <div slot="header" class="card-titile">
                功能管理
            </div>
            <el-form label-width="100px">
                <el-form-item label="资源类型">
                    <el-radio-group v-model="sourceType">
                        <el-radio :label="0">互联网资源平台功能</el-radio>
                        <el-radio :label="1">本平台自定义功能</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="功能选择">
                    <el-cascader :options="functionList" v-model="selectFunctionId" :change-on-select="false" placeholder="请选择查询模块" filterable></el-cascader>
                </el-form-item>
                <el-form-item label="功能名称">
                    <el-input v-model="functionInfo.functionName" :disabled="!(changeFlag && sourceType==1)"></el-input>
                </el-form-item>
                <el-form-item label="A角">
                    <el-input v-model="functionInfo.manageA" :disabled="!(changeFlag && sourceType==1)"></el-input>
                </el-form-item>
                <el-form-item label="B角">
                    <el-input v-model="functionInfo.manageB" :disabled="!(changeFlag && sourceType==1)"></el-input>
                </el-form-item>
                <el-form-item label="功能起点">
                    <el-input v-model="functionInfo.startFuncid" :disabled="!(changeFlag && sourceType==1)"></el-input>
                </el-form-item>
                <el-form-item label="功能终点">
                    <el-input v-model="functionInfo.endFuncid" :disabled="!(changeFlag && sourceType==1)"></el-input>
                </el-form-item>
                <el-form-item label="页面集合">
                    <div style="padding:5px;border:1px solid #eee;" class="functioninfo-list">
                        <template v-for="(fid,i) in functionInfo.allFuncids">    
                            <el-tooltip class="item" effect="dark" :content="fid.name" placement="top-start" :key="'tooltip_'+fid.funcid">
                                <el-tag :key="fid.funcid" :closable="changeFlag && sourceType==1" @close="handleClose(i)">
                                    {{fid.funcid}}
                                </el-tag>
                            </el-tooltip>
                        </template>
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
                <el-form-item label="设置主路径" v-if="changeFlag">
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
                    <el-button v-if="!changeFlag"  type="primary" @click="doChange">修改</el-button>
                    <span v-else>
                        <el-button type="success" @click="doSave">保存</el-button>
                        <el-button type="info" @click="doCancel">取消</el-button>
                    </span>
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
/* 
.el-transfer
  .el-transfer-panel:last-child
  .el-transfer-panel__item:first-child
  .el-icon-sort-up {
  color: #fff;
}

.el-transfer
  .el-transfer-panel:last-child
  .el-transfer-panel__item:last-child
  .el-icon-sort-down {
  color: #fff;
} */
</style>
<script>
var dd = require("../../testData/functionView.json");
var $ = require("jquery");

export default {
  data() {
    return {
      sourceType: 0, //0:互联网资源平台功能；1:自定义功能
      functionList: dd.funcitonList,
      selectFunctionId: [],
      functionInfo: dd.functionInfo,
      changeFlag: false
    };
  },
  computed: {
    mainPathArr: {
      get: function() {
        return this.functionInfo.mainPath.split(",") || [];
      },
      set: function(newValue) {
        this.functionInfo.mainPath = newValue.join(",");
      }
    }
  },
  methods: {
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
    doChange() {
      this.changeFlag = true;
    },
    doSave() {
      this.changeFlag = false;
      console.log("这里需要将info信息提交保存");
    },
    doCancel() {
      this.changeFlag = false;
      console.log(
        "这里应再次调用获取functionInfo信息的方法，获取info信息，渲染页面"
      );
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


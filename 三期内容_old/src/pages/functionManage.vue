<template>
    <div id="quanlianlu" style="margin:0 75px;background-color:#fff;overflow:scroll;">
        <el-row style="min-width:1200px;">
            <el-col :span="11">
                <el-form v-if="activeType=='functionQuery'" ref="form1" label-width="80px" style="width:550px;padding-top:30px;">
                    <el-form-item :inline-message="true" label="业务类型">
                        <el-select v-model="form.bizId" placeholder="请选择业务">
                            <el-option
                                v-for="bizItem in bizList"
                                :key="bizItem.bizId"
                                :label="bizItem.bizName"
                                :value="bizItem.bizId">
                            </el-option>
                        </el-select>
                        <el-select v-model="form.moduleId" placeholder="请选择模块">
                            <el-option
                                v-for="moduleItem in moduleList"
                                :key="moduleItem.moduleId"
                                :label="moduleItem.moduleName"
                                :value="moduleItem.moduleId">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :inline-message="true" label="交易功能">
                        <el-select v-model="form.functionId" placeholder="请选择指定功能">
                            <el-option
                                v-for="funcItem in functionList"
                                :key="funcItem.functionId"
                                :label="funcItem.functionName"
                                :value="funcItem.functionId">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="起始页面">
                        <el-autocomplete
                            class="el-input__inner" 
                            style="border: 0px;outline:none;padding:0;" 
                            v-model="form.startFuncid" 
                            :fetch-suggestions="querySearchFuncid" 
                            placeholder="请输入功能startFuncid"
                            :trigger-on-focus="false" 
                            @select="addStartFuncid"
                            :disabled="!canChange">
                        </el-autocomplete>
                    </el-form-item>
                    <el-form-item label="结束页面">
                        <el-autocomplete
                            class="el-input__inner" 
                            style="border: 0px;outline:none;padding:0;" 
                            v-model="form.endFuncid" 
                            :fetch-suggestions="querySearchFuncid" 
                            placeholder="请输入功能endFuncid"
                            :trigger-on-focus="false" 
                            @select="addEndFuncid"
                            :disabled="!canChange">
                        </el-autocomplete>
                    </el-form-item>
                    <el-form-item label="所有页面">
                        <div style="border-radius: 4px;
                                border: 1px solid #dcdfe6;
                                -webkit-box-sizing: border-box;
                                box-sizing: border-box;
                                color: #606266;
                                padding: 5px;
                                min-height: 52px;">
                            <el-tag
                                v-for="fid in form.funcids"
                                :key="fid"
                                :closable="canChange"
                                @close="deleteFuncid(fid)">
                            {{fid}}</el-tag>
                            <el-autocomplete 
                                v-if="canChange"
                                @keyup.enter="addNewFuncid"
                                class="el-input__inner" 
                                style="border: 0px;outline:none;padding:0;" 
                                v-model="newFuncid" 
                                :fetch-suggestions="querySearchFuncid" 
                                placeholder="请输入funcid或者对应的名字"
                                :trigger-on-focus="false" 
                                @select="addNewFuncid">
                            </el-autocomplete>

                        </div>
                    </el-form-item>
                    <el-form-item label="备注信息">
                        <el-input type="textarea" v-model="form.desc" :disabled="!canChange"></el-input>
                    </el-form-item>
                    <el-form-item size="large" class="li-form-button">
                        <el-button type="primary" @click="setCanChange">{{showCanChangeText}}</el-button>
                    </el-form-item>
                </el-form>

                <!-- 新增交易功能 -->
                <el-form v-else ref="form2" label-width="80px" style="width:600px;padding-top:30px;">
                    <el-form-item :inline-message="true" label="业务类型">
                        <el-select v-model="form.bizId" placeholder="请选择业务">
                            <el-option
                                v-for="bizItem in bizList"
                                :key="bizItem.bizId"
                                :label="bizItem.bizName"
                                :value="bizItem.bizId">
                            </el-option>
                        </el-select>
                        <el-select v-model="form.moduleId" placeholder="请选择模块">
                            <el-option
                                v-for="moduleItem in moduleList"
                                :key="moduleItem.moduleId"
                                :label="moduleItem.moduleName"
                                :value="moduleItem.moduleId">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="交易功能">
                        <el-input v-model="form.functionName" placeholder="请输入交易功能名称"></el-input>
                    </el-form-item>
                    <el-form-item label="起始页面">
                        <!-- <el-input v-model="form.startFuncid" placeholder="请输入功能起始页面"></el-input> -->
                        <el-autocomplete
                            class="el-input__inner" 
                            style="border: 0px;outline:none;padding:0;" 
                            v-model="form.startFuncid" 
                            :fetch-suggestions="querySearchFuncid" 
                            placeholder="请输入功能startFuncid"
                            :trigger-on-focus="false" 
                            @select="addStartFuncid">
                        </el-autocomplete>
                    </el-form-item>
                    <el-form-item label="结束页面">
                        <!-- <el-input v-model="form.endFuncid" placeholder="允许与开始页面是同一个页面"></el-input> -->
                        <el-autocomplete
                            class="el-input__inner" 
                            style="border: 0px;outline:none;padding:0;" 
                            v-model="form.endFuncid" 
                            :fetch-suggestions="querySearchFuncid" 
                            placeholder="请输入功能endFuncid"
                            :trigger-on-focus="false" 
                            @select="addEndFuncid">
                        </el-autocomplete>
                    </el-form-item>
                    <el-form-item label="所有页面">
                        <div style="border-radius: 4px;
                                border: 1px solid #dcdfe6;
                                -webkit-box-sizing: border-box;
                                box-sizing: border-box;
                                color: #606266;
                                padding: 5px;
                                min-height: 52px;">
                            <el-tag
                                v-for="fid in form.funcids"
                                :key="fid"
                                closable
                                @close="deleteFuncid(fid)">
                            {{fid}}</el-tag>
                            <el-autocomplete 
                                @keyup.enter="addNewFuncid"
                                class="el-input__inner" 
                                style="border: 0px;outline:none;padding:0;" 
                                v-model="newFuncid" 
                                :fetch-suggestions="querySearchFuncid" 
                                placeholder="请输入funcid或者对应的名字"
                                :trigger-on-focus="false" 
                                @select="addNewFuncid">
                            </el-autocomplete>

                        </div>
                    </el-form-item>
                    <el-form-item label="备注信息">
                        <el-input type="textarea" v-model="form.desc"></el-input>
                    </el-form-item>
                    <el-form-item size="large" class="li-form-button">
                        <el-button type="primary" @click="submitUpdate('form2')">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="2"></el-col>
            <el-col :span="11">
                <el-table :data="allCustomerGongNengList" border max-height="400" style="width: 100%;">
                    <el-table-column
                        prop="bizName"
                        label="业务"
                        min-width="100">
                    </el-table-column>
                    <el-table-column
                        prop="moduleName"
                        label="模块"
                        min-width="100">
                    </el-table-column>
                    <el-table-column
                        prop="functionName"
                        label="功能"
                        min-width="150">
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        min-width="100">
                        <template slot-scope="scope">
                            <el-button @click="showFunctionDetail(scope.row)" type="text" size="small">查看</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>
<style>
.el-tag + .el-tag {
  margin-left: 10px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>

<script>
var $ = require("jquery");
export default {
  data() {
    return {
      form: {
        bizId: "", //业务名称
        moduleId: "", //模块名称
        functionId: "", //功能id
        functionName: "", //功能名称
        startFuncid: "", //起始funcid
        endFuncid: "", //结束funcid
        funcids: [], //本功能下所有的funcid集合
        desc: "" //备注
      },
      productLevelModel: [], //包含所有产品层级关系的对象。
      canChange: false, //内容是否可以修改标志
      showCanChangeText: "修改", //查询页面的button文字内容
      newFuncid: "", //在新增功能时使用
      allCustomerGongNengList: [] //展示自定义功能列表的数据集
    };
  },
  methods: {
    showFunctionDetail(row) {
      this.form.bizId = row.bizId;
      this.$nextTick(function() {
        this.form.moduleId = row.moduleId;
        this.$nextTick(function() {
          this.form.functionId = row.functionId;
          this.form.startFuncid = row.startFuncid;
          this.form.endFuncid = row.endFuncid;
          this.form.funcids = row.funcids;
          this.form.desc = row.desc;
        });
      });
    },
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
    addNewFuncid(item) {
      this.newFuncid = item.funcId;
      if (
        this.newFuncid != "" &&
        this.form.funcids.indexOf(this.newFuncid) == -1
      ) {
        this.form.funcids.push(this.newFuncid);
      }
      this.newFuncid = "";
    },
    addStartFuncid(item) {
      this.form.startFuncid = item.funcId;
    },
    addEndFuncid(item) {
      this.form.endFuncid = item.funcId;
    },
    checkSubmitData() {
      if (
        this.form.bizId == "" ||
        this.form.moduleId == "" ||
        (this.form.functionId == "" && this.form.functionName == "")
      ) {
        this.$alert("请选择所属业务,模块,功能", "温馨提示");
        return false;
      }
      if (this.form.startFuncid == "" || this.form.endFuncid == "") {
        this.$alert("请填写功能 起始funcid 和 结束funcid", "温馨提示");
        return false;
      }
      return true;
    },
    submitUpdate(formName) {
      if (this.checkSubmitData()) {
        //更新交易功能
        var gongNeng = {};
        gongNeng.functionId = this.form.functionId;
        gongNeng.functionName = this.form.functionName;
        gongNeng.startFuncid = this.form.startFuncid;
        gongNeng.endFuncid = this.form.endFuncid;
        gongNeng.funcids = this.form.funcids.join("|");
        gongNeng.desc = this.form.desc;
        gongNeng.bizId = this.form.bizId;
        gongNeng.moduleId = this.form.moduleId;

        if (!gongNeng.functionId) {
          gongNeng.functionId = 0;
        }
        var that = this;
        $.ajax({
          url: "updateGongNeng.do",
          data: gongNeng,
          success: function(data) {
            if (data.errCode == 200) {
              that.$alert("提交成功", "温馨提示", {
                callback: action => {
                  location.reload();
                }
              });
            } else {
              that.$alert(data.errMsg);
            }
          }
        });
      }
    },
    setCanChange() {
      if (this.canChange) {
        //如果是已经处于修改状态,再次点击,出发提交保存
        this.submitUpdate("form1");
      } else {
        //修改旧的交易功能
        this.canChange = true;
      }
    },
    deleteFuncid(fid) {
      this.$confirm("确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.form.funcids.splice(this.form.funcids.indexOf(fid), 1);
      });
    }
  },
  watch: {
    canChange(newValue, oldValue) {
      if (newValue) {
        this.showCanChangeText = "保存";
      } else {
        this.showCanChangeText = "修改";
      }
    },
    moduleList(newValue, oldValue) {
      this.form.moduleId = "";
      this.form.functionId = "";
    },
    functionList(newValue, oldValue) {
      this.form.functionId = "";
    },
    "form.functionId"(newValue, oldValue) {
      for (var idx in this.functionList) {
        var item = this.functionList[idx];
        if (item.functionId == this.form.functionId) {
          this.form.functionId = item.functionId;
          this.form.functionName = item.functionName;
          this.form.startFuncid = item.startFuncid;
          this.form.endFuncid = item.endFuncid;
          this.form.desc = item.desc;
          this.form.funcids = item.funcids.split("|");
          this.canChange = false;
        }
      }
    },
    activeType(newValue, oldValue) {
      //清理已选项
      this.form.startFuncid = "";
      this.form.functionName = "";
      this.form.endFuncid = "";
      this.form.funcids = [];
      this.form.desc = "";
      this.form.functionId = "";
      if (this.activeType == "functionQuery") {
        this.canChange = false;
      }
    }
  },
  computed: {
    activeType: function() {
      return this.$route.params.activeType
        ? this.$route.params.activeType
        : "functionQuery"; //操作标签类型
    },
    bizList: function() {
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
    moduleList: function() {
      for (var idx in this.productLevelModel) {
        var item = this.productLevelModel[idx];
        if (item.bizId == this.form.bizId) {
          return item.modules;
        }
      }
      return [];
    },
    functionList: function() {
      for (var idx in this.moduleList) {
        var item = this.moduleList[idx];
        if (item.moduleId == this.form.moduleId) {
          return item.functions;
        }
      }
      return [];
    }
  },
  mounted: function() {
    this.$nextTick(function() {
      var that = this;
      $.ajax({
        url: "queryProductLevel.do",
        success: function(data) {
          if (data.errCode == 200) {
            that.productLevelModel = data.data.bizs;
            var allCustomerGongNengList = [];
            for (var i in that.productLevelModel) {
              var bizObj = that.productLevelModel[i];
              var bizName = bizObj.bizName;
              var bizId = bizObj.bizId;
              for (var j in bizObj.modules) {
                var moduleObj = bizObj.modules[j];
                var moduleName = moduleObj.moduleName;
                var moduleId = moduleObj.moduleId;
                for (var k in moduleObj.functions) {
                  var funcObj = moduleObj.functions[k];
                  var funcName = funcObj.functionName;
                  var funcId = funcObj.functionId;
                  allCustomerGongNengList.push({
                    bizId: bizId,
                    bizName: bizName,
                    moduleId: moduleId,
                    moduleName: moduleName,
                    functionId: funcId,
                    functionName: funcName,
                    startFuncid: funcObj.startFuncid,
                    endFuncid: funcObj.endFuncid,
                    funcids: funcObj.funcids.split("|"),
                    desc: funcObj.desc
                  });
                }
              }
            }
            that.allCustomerGongNengList = allCustomerGongNengList;
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
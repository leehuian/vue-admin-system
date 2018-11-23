<template>
    <div id="quanlianlu" style="margin:0 75px">
        <el-form :inline="true" :model="form">
            <el-form-item label="查询表格">
                <el-input v-model="form.tableName" placeholder="hbase表名"></el-input>
            </el-form-item>
            <el-form-item label="startRow">
                <el-input v-model="form.startRow" placeholder="开始rowkey"></el-input>
            </el-form-item>
            <el-form-item label="endRow">
                <el-input v-model="form.endRow" placeholder="结束rowkey"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-input type="password" v-model="form.password" placeholder="查询密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" v-loading.fullscreen.lock="fullscreenLoading" @click="onSubmit">查询</el-button>
            </el-form-item>
        </el-form>
        <div>
            <el-table :data="resultData" border style="width: 100%;border:2px solid #fff">
                <el-table-column prop="rowKey" label="rowKey" width="200"></el-table-column>
                <el-table-column prop="column" sortable label="列族" width="150"></el-table-column>
                <el-table-column prop="value" sortable label="Value"></el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
var $ = require("jquery");

export default {
  data() {
    return {
      fullscreenLoading: false,
      form: {
        tableName: "mbankFinance:G_mbank_seesion_paths_relations",
        startRow: "",
        endRow: "",
        password: ""
      },
      resultData: [] //查询结果数据
    };
  },

  methods: {
    onSubmit() {
      if (
        this.form.startRow == "" ||
        this.form.endRow == "" ||
        this.form.tableName == "" ||
        this.form.password == ""
      ) {
        this.$message({
          type: "warning",
          message: "请输入全部参数"
        });
        return false;
      }

      this.fullscreenLoading = true;
      var that = this;
      this.submitDateFormat = this.form.startDate;
      $.ajax({
        url: "queryTableData.do",
        data: {
          tableName: that.form.tableName,
          startRow: that.form.startRow,
          endRow: that.form.endRow,
          password: that.form.password
        },
        success: function(data) {
          if (data.errCode == 200) {
            that.resultData = data.data;
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
    }
  }
};
</script>
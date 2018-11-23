<template>

    <el-container>
        <el-aside style="background-color:#545c64;width:210px;" v-bind:class="{hideAside:!showAside}">
            <el-menu default-active="2"
                    @select="gotoItem"
                    background-color="#545c64"
                    text-color="#fff"
                    active-text-color="#ffd04b">
                    <img class="img-logo" :src="logoImg" alt="" width="150px">
                <el-menu-item index="/">
                    <i class="el-icon-menu"></i>
                    <span slot="title">首页</span>
                </el-menu-item>
                <el-menu-item index="/home">
                    <i class="el-icon-search"></i>
                    <span slot="title">链路查询</span>
                </el-menu-item>
                <el-menu-item index="/quanlianlu">
                    <i class="el-icon-rank"></i>
                    <span slot="title">全路径分析</span>
                </el-menu-item>
                <el-menu-item index="/functionRelation">
                    <i class="el-icon-sort"></i>
                    <span slot="title">功能关联性分析</span>
                </el-menu-item>
                <el-menu-item index="/canReachNode">
                    <i class="el-icon-share"></i>
                    <span slot="title">可达节点分析</span>
                </el-menu-item>
                <el-submenu index="funcmanage">
                    <template slot="title">
                        <i class="el-icon-setting"></i>
                        <span>自定义功能管理</span>
                    </template>
                    <el-menu-item index="/funcmanage/functionQuery">自定义功能查询</el-menu-item>
                    <el-menu-item index="/funcmanage/functionAdd">新增自定义功能</el-menu-item>
                </el-submenu>
                <el-menu-item index="/queryTableData">
                    <i class="el-icon-search"></i>
                    <span slot="title">数据查询</span>
                </el-menu-item>
                <el-menu-item index="/">
                    <i class="el-icon-tickets"></i>
                    <span slot="title">使用说明</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-container>
            <el-header class="main-header">
                <i class="glyphicon" v-bind:class="{'glyphicon-indent-right':showAside,'glyphicon-indent-left':!showAside}" @click="showAside = !showAside"></i>
                <div>{{titleRemark}}</div>
            </el-header>
            <el-main class="main-container">
                <router-view></router-view>
            </el-main>
            <!-- 页面底部公共内容 -->
            <el-footer class="main-footer">
                <div>招银网络科技有限公司 </div>
            </el-footer>
            <!-- 返回顶部的TAG -->
            <el-button @click="goTop" type="success" class="goToTop" icon="el-icon-upload2" circle></el-button>
        </el-container>
    </el-container>
</template>
<style>
@import url("./assets/styles/customer.css");
html,
body {
  background: #f0f0f0;
}

footer.el-footer.main-footer {
  color: #565656;
  font-size: 14px;
  line-height: 50px;
  text-align: center;
}

header.el-header.main-header {
  font-style: inherit;
  line-height: 60px;
  color: #fff;
  display: inline-block;
  display: flex;
  background-color: #545c64;
}

.main-header i {
  line-height: 60px;
  font-size: 24px;
  cursor: pointer;
  margin-right: 10px;
}

.img-logo {
  width: 180px;
  margin: 10px 10px;
}

aside {
  transition: width 1s;
}

aside.hideAside {
  width: 50px !important;
  overflow: hidden;
}

ul.el-menu {
  border-right: none;
}

.goToTop {
  cursor: pointer;
  font-size: 24px;
  position: fixed;
  right: 30px;
  bottom: 50px;
  z-index: 9999;
}
</style>
<script>
var $ = require("jquery");
import router from "./routes.js";
export default {
  data: function() {
    return {
      titleRemark: "基于页面funcid的链路查询",
      logoImg: require("./assets/images/logo.png"),
      activeIndex: "",
      showAside: true
    };
  },
  methods: {
    goTop() {
      $("html, body").animate({ scrollTop: 0 }, 500);
    },
    gotoItem(path, pathIdx) {
      this.showAside = true;
      console.log(path);
      if (path.indexOf("home") != -1) {
        this.titleRemark = "链路查询";
      } else if (path.indexOf("quanlianlu") != -1) {
        this.titleRemark = "全链路分析";
      } else if (path.indexOf("functionRelation") != -1) {
        this.titleRemark = "功能关联性分析";
      } else if (path.indexOf("canReachNode") != -1) {
        this.titleRemark = "可达节点分析";
      } else if (path.indexOf("funcmanage") != -1) {
        this.titleRemark = "自定义功能管理";
      } else {
        this.titleRemark = "首页";
      }
      router.push(path);
    }
  },
  mounted: function() {
    var win = $(window);
    var elem = $(".goToTop");
    elem.fadeOut(0);
    win.scroll(function() {
      var scrolling = win.scrollTop();
      if (scrolling > 200) {
        elem.fadeIn(500);
      } else {
        elem.fadeOut(500);
      }
    });
  }
};
</script>
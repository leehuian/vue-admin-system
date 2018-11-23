import firstPage from './pages/firstPage.vue';
import moduleManage from './pages/manage/moduleView.vue';
import functionManage from './pages/manage/functionView.vue';
import addFunction from './pages/manage/addFunction.vue';
import canReachNode from './pages/newDir/canReachNode.vue';

import Home from './pages/Home.vue';
import quanlianlu from './pages/QuanLianLu.vue';
import funcManage from './pages/functionManage.vue';
import functionRelation from './pages/RelationFunction.vue';
// import canReachNode from './pages/canReachNode.vue';
import queryDataPage from './pages/queryDataPage.vue';
import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
export default new VueRouter({
    routes: [{
            path: "/manage/addFunction",
            component: addFunction,
            props: true
        }, {
            path: "/manage/functionManage",
            component: functionManage,
            props: true
        },
        {
            path: "/",
            component: firstPage,
            props: true
        },
        {
            path: "/home",
            component: Home,
            props: true
        },
        {
            path: "/quanlianlu",
            component: quanlianlu,
            props: true
        },
        {
            path: "/funcmanage/:activeType",
            component: funcManage,
            props: true
        },
        {
            path: "/canReachNode",
            component: canReachNode,
            props: true
        },
        {
            path: "/functionRelation",
            component: functionRelation,
            props: true
        },
        {
            path: "/queryTableData",
            component: queryDataPage,
            props: true
        },
        {
            path: "/manage/moduleManage",
            component: moduleManage,
            props: true
        }
    ]
})
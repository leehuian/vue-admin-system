//main.js这是项目的核心文件。全局的配置都在这个文件里面配置
import Vue from 'vue'
import App from './Main.vue'
import router from './routes.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

Vue.config.debug = true;//开启错误提示

new Vue({
        router,
        el: '#app',
        render: h => h(App)
})
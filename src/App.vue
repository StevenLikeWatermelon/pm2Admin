<template>
  <div id="app">
    <div class="title">
      <span>前端中台项目运维平台</span>
    </div>
    <div class="content-global">
      <el-button type="primary" :loading="loading" @click="viewLogs">查看运行日志</el-button>
      <el-button type="warning" :loading="loading" @click="flushLogs">清理日志</el-button>
    </div>
    <div class="pm2-table">
      <el-table stripe :data="tableData" border style="width: 100%">
        <el-table-column prop="pid" label="pid" width="180">
        </el-table-column>
        <el-table-column prop="name" label="进程名称" width="180">
        </el-table-column>
        <el-table-column prop="cpu" label="cpu"> </el-table-column>
        <el-table-column prop="memory" label="memory"> </el-table-column>
        <el-table-column prop="status" label="status">
          <template slot-scope="{row}">
            <span :class="getStatusColor(row.status)">{{row.status}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="restartTime" label="重启次数"> </el-table-column>
        <el-table-column prop="port" label="服务端口号"> </el-table-column>
        <el-table-column prop="watch" label="watch"> </el-table-column>
        <el-table-column label="操作" width="650">
          <template slot-scope="{row}">
            <el-button  @click="viewLogs(row.pm_out_log_path)" :loading="loading" type="success" round>查看日志</el-button>
            <el-button  @click="viewLogs(row.pm_err_log_path)" :loading="loading" type="success" round>查看错误日志</el-button>
            <el-button  @click="restartProcess(row.name)" :loading="loading" type="primary" round>重启服务</el-button>
            <el-button :disabled="row.disabled" @click="stopProcess(row.name)" :loading="loading" type="danger" round>停止服务</el-button>
            <el-button :disabled="row.disabled || row.status !== 'stopped'" @click="deleteProcess(row.name)" :loading="loading" type="danger" round>删除服务</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pre-code" v-if="!loading">
      <pre>
        <code>
          {{codeStr}}
        </code>
      </pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  const resData = response.data
  if (resData.success) {
    return Promise.resolve(resData)
  } else {
    window.app.$message(resData.message)
    return Promise.reject(resData)
  }
}, function (error) {
  console.log(error)
  return Promise.reject(error)
})
const qs = require('qs')
export default {
  name: 'App',
  data () {
    return {
      tableData: [],
      codeStr: '暂无日志',
      loading: false
    }
  },
  created () {
    this.getPm2List()
  },
  mounted () {
    setTimeout(() => {
      this.reDrawHighlight()
    }, 100)
  },
  methods: {
    getStatusColor (status) {
      let color = 'green'
      switch (status) {
        case 'online':
          color = 'green'
          break
        case 'stopped':
          color = 'red'
          break
        default:
          break
      }
      return color
    },
    getPm2List () {
      this.loading = true
      axios.get('/process-list').then(({ data }) => {
        this.tableData = (data || []).map(item => {
          return {
            pid: item.pid,
            name: item.name,
            status: item.pm2_env?.status,
            port: item.pm2_env?.args ? item.pm2_env.args[0] : '暂无端口',
            restartTime: item.pm2_env?.restart_time,
            pm_out_log_path: item.pm2_env?.pm_out_log_path,
            pm_err_log_path: item.pm2_env?.pm_err_log_path,
            watch: `${item.pm2_env?.watch}`,
            cpu: `${item.monit?.cpu}`,
            memory: `${+item.monit?.memory / 1024 / 1024}MB`,
            disabled: item.name === 'admin'
          }
        })
        this.loading = false
      })
    },
    restartProcess (name) {
      this.loading = true
      axios.post('/restart-process-name', qs.stringify({
        name
      })).then(res => {
        this.$message.success('重启成功')
        this.getPm2List()
      })
    },
    stopProcess (name) {
      this.loading = true
      axios.post('/stop-process-name', qs.stringify({
        name
      })).then(res => {
        this.$message.success('停止成功')
        this.getPm2List()
      })
    },
    deleteProcess (name) {
      this.loading = true
      axios.post('/delete-process-name', qs.stringify({
        name
      })).then(res => {
        this.$message.success('删除成功')
        this.getPm2List()
      })
    },
    flushLogs () {
      this.codeStr = '暂无日志'
      this.loading = true
      axios.post('/flush-logs').then(res => {
        this.$message.success('清理成功')
        this.loading = false
      })
    },
    viewLogs (path) {
      this.loading = true
      axios.post('/get-logs', qs.stringify({
        path
      })).then(res => {
        this.$message.success('获取成功')
        this.codeStr = res.data || '暂无日志'
        this.loading = false
        this.reDrawHighlight()
      })
    },
    reDrawHighlight () {
      this.$nextTick(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          window.hljs.highlightBlock(block)
        })
      })
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  text-align: center;
  margin-top: 60px;
  .title {
    font-size: 22px;
    margin-bottom: 20px;
    font-weight: 700;
  }
  .content-global {
    margin-bottom: 20px;
    text-align: left;
  }
  .pre-code {
    text-align: left;
  }
  .pm2-table {
    .green {
      color: #45af7a;
    }
    .red {
      color: #d02a4f;
    }
  }
}
</style>

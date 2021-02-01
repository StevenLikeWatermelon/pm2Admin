<template>
  <div id="app">
    <div class="title">
      <span>前端中台项目运维平台</span>
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
        <el-table-column label="操作" width="600">
          <template slot-scope="{row}">
            <el-button :disabled="row.disabled" @click="restartProcess(row.name)" :loading="loading" type="primary" round>重启服务</el-button>
            <el-button :disabled="row.disabled" @click="stopProcess(row.name)" :loading="loading" type="danger" round>停止服务</el-button>
            <el-button :disabled="row.disabled || row.status !== 'stopped'" @click="deleteProcess(row.name)" :loading="loading" type="danger" round>删除服务</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
const qs = require('qs')
export default {
  name: 'App',
  data () {
    return {
      tableData: [],
      loading: false
    }
  },
  created () {
    this.getPm2List()
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
      axios.get('/process-list').then(({ data: { data } }) => {
        this.tableData = (data || []).map(item => {
          return {
            pid: item.pid,
            name: item.name,
            status: item.pm2_env?.status,
            port: item.pm2_env?.args[0],
            restartTime: item.pm2_env?.restart_time,
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
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  .title {
    font-size: 22px;
    margin-bottom: 20px;
    font-weight: 700;
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

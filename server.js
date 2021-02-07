const express = require('express')
const pm2 = require('pm2')
const bodyParser = require('body-parser')// body-parser中间件来解析请求体
const os = require('os')
const shell = require('shelljs')
const homePath = os.homedir() // Maybe /Users/<name> on OSX, maybe /home/<name> on Linux and so on
const fs = require('fs')
const path = require('path')
const pm2LogPath = path.join(homePath, './.pm2/pm2.log')

const app = express()
app.use(express.static('dist'))

// 运用跨域的中间件
const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*') // 自定义中间件，设置跨域需要的响应头。
  next()
}
app.use(allowCrossDomain)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// 设置模板
app.set('views', 'dist')
app.set('view engine', 'html')
app.engine('html', require('ejs-mate'))

// 设置路由
app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
})

//
app.get('/process-list', function (req, res) {
  pm2.connect(function (err) {
    if (err) {
      res.send({
        message: err,
        data: [],
        success: 0
      })
      process.exit(2)
    }

    pm2.list((err, list) => {
      if (err) {
        res.send({
          message: err,
          data: [],
          success: 0
        })
      } else {
        res.send({
          message: 'success',
          data: list,
          success: 1
        })
        pm2.disconnect()
      }
    })
  })
})

app.post('/restart-process-name', function (req, res) {
  const name = req.body.name
  pm2.connect(function (err) {
    if (err) {
      res.send({
        message: err,
        data: null,
        success: 0
      })
      process.exit(2)
    }

    pm2.restart(name, (err, proc) => {
      if (err) {
        res.send({
          message: err,
          data: [],
          success: 0
        })
      } else {
        res.send({
          message: 'success',
          data: proc,
          success: 1
        })
        pm2.disconnect()
      }
    })
  })
})

app.post('/stop-process-name', function (req, res) {
  const name = req.body.name
  pm2.connect(function (err) {
    if (err) {
      res.send({
        message: err,
        data: null,
        success: 0
      })
      process.exit(2)
    }

    pm2.stop(name, (err, proc) => {
      if (err) {
        res.send({
          message: err,
          data: null,
          success: 0
        })
      } else {
        res.send({
          message: 'success',
          data: proc,
          success: 1
        })
        pm2.disconnect()
      }
    })
  })
})

app.post('/delete-process-name', function (req, res) {
  const name = req.body.name
  pm2.connect(function (err) {
    if (err) {
      res.send({
        message: err,
        data: null,
        success: 0
      })
      process.exit(2)
    }

    pm2.delete(name, (err, proc) => {
      if (err) {
        res.send({
          message: err,
          data: null,
          success: 0
        })
      } else {
        res.send({
          message: 'success',
          data: proc,
          success: 1
        })
        pm2.disconnect()
      }
    })
  })
})
app.post('/flush-logs', function (req, res) {
  shell.exec('pm2 flush', function (code, stdout, stderr) {
    res.send({
      message: 'success',
      code,
      data: stdout || stderr,
      success: 1
    })
  })
})

app.post('/get-logs', function (req, res) {
  const reqPath = req.body.path
  const logPath = reqPath || pm2LogPath
  fs.readFile(logPath, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      res.send({
        message: 'success',
        data: data,
        success: 1
      })
    } else {
      res.send({
        message: 'failed',
        data: err,
        success: 0
      })
    }
  })
})

const server = app.listen(3002, function () {
  const host = server.address().address
  const port = server.address().port
  console.log('Example app listening at ', host, port)
})

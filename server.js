const express = require('express')
const pm2 = require('pm2')
const bodyParser = require('body-parser')// body-parser中间件来解析请求体

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

const server = app.listen(3002, function () {
  const host = server.address().address
  const port = server.address().port
  console.log('Example app listening at ', host, port)
})

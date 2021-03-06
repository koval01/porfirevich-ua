const translate = require('@vitalets/google-translate-api')
const request = require('request')

const compression = require('compression')
const express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.json())
app.use(compression())

app.get('/', function(request, response) {
  response.send({"body": "Application is running!"})
})

var getJSON = function(user_text, need_len, callback) {
  const url = "https://pelevin.gpt.dobro.ai/generate/"
  request({
    'method': 'POST',
    'uri': url,
    'multipart': [
      {
        'content-type': 'application/json',
        'body': JSON.stringify({'prompt': user_text, 'length': need_len})
      },
    ],
  }, function (error, response, body) {
    callback(body)
  })
}

app.post('/generate', function(request, response) {
  try {
    if ((request.body.prompt).length < 1024 && request.body.length <= 60) {
      translate(request.body.prompt, {to: "ru"}).then(resp => {
        getJSON(resp.text, 60, function(data) {
          const replies_getted = data.replies
          response.send({
//             "success": replies_getted.length > 0, 
            "replies": replies_getted,
          })
          console.log(`data: ${data}`)
          console.log(`text original: ${request.body.prompt}`)
          console.log(`text sended to dobro.ai: ${resp.text}`)
        })
      }).catch(error => {
        response.send({"success": false, "message": "Input function error", "exception": error})
      })
    } else {
      response.send({"success": false, "error_body": {
        "message": "Error! Text length is more than 1024 characters. And max value parameter length is 60"
      }})
    }
  } catch (error) {
    response.send({"success": false, "error_body": {
      "message": "Global function error", "exception": error
    }})
  }
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

# ☕ tuna by @lxe

# mongoose
mongoose = require 'mongoose'
mongoose.connect 'mongodb://localhost/tuna'

# express
express  = require 'express'
app      = express()
app.port = process.env.PORT or 3000
app.set 'view engine', 'jade'

# middleware
stylus    = require 'stylus'
assets    = require 'connect-assets'
bootstrap = require 'bootstrap-stylus'

app.use express.static  "#{__dirname}/public"
app.use express.favicon "#{__dirname}/public/img/favicon.ico"

app.use express.bodyParser()
app.use assets()
app.use stylus.middleware(
  src     : "#{__dirname}/public", 
  compile : (str, path) -> stylus(str)
    .set('filename', path)
    .use(bootstrap())
  )

# routes
routes = require './routes'
routes(app)

# environmments
app.configure 'development', ->
  app.use express.errorHandler(
    dumpExceptions : true
    showStack      : true
  )

app.configure "production", ->
  app.use express.errorHandler()

# go go go!
app.listen(app.port)
console.log "✔ Running tuna on :#{app.port} 
  in #{app.settings.env} mode"

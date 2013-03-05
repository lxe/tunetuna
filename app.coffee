# ☕ tuna by @lxe

# express
express  = require 'express'
app      = express()
app.port = process.env.PORT or 3000
app.set 'view engine', 'jade'

# mongo 
mongo = require 'connect-mongo'
MongoStore = mongo express

mongoose = require 'mongoose'
mongoose.connect 'mongodb://localhost/tuna'

# middleware
stylus    = require 'stylus'
assets    = require 'connect-assets'
bootstrap = require 'bootstrap-stylus'

app.use express.static  "#{__dirname}/public"
app.use express.favicon "#{__dirname}/public/img/favicon.ico"

app.use express.cookieParser('myspoonistoobig')
app.use express.session(
  secret : 'tunaisdelicious'
  maxAge : new Date Date.now() + 3600000
  store  : new MongoStore(url: 'mongodb://localhost/tuna')
)

app.use express.bodyParser()
app.use assets()
app.use stylus.middleware(
  src     : "#{__dirname}/public", 
  compile : (str, path) -> stylus(str)
    .set('filename', path)
    .use(bootstrap())
)

app.use (req, res, next) ->
  req.flash = { } if not req.flash
  res.locals.flash = req.flash
  req.flash = { }
  next()

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

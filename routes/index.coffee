Session = require '../models/session'

module.exports = (app) ->
  app.get ['/:name?', '/:name/player'], 
  	Session.join, (req, res, next) -> res.render('index')
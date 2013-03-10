Party = require '../models/party'

module.exports = (app) ->
  app.get ['/'], (req, res, next) -> res.render 'index'

  app.get ['/:name?', '/:name/player'], 
    Party.join, (req, res, next) -> res.render 'party'
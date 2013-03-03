# Tuna session

_ = require 'lodash'

Player  = require '../models/player'
User    = require '../models/user'

sessions = []

class Session
  constructor : (name) ->
    @name = name or @createName()
    console.log "created session #{@name}"

  createName : ->
    chars  = 'abcdefghijklmnpqrstuvwxyz23456789'
    length = 4

    name = while length -= 1 
      chars[_.random chars.length - 1]
    name.join ''

Session.join = (req, res, next) ->
  player  = /\/player$/.test req.path
  name    = req.params[if player then 0 else 'name'] # bug?
  session = sessions[name]

  # start new party
  if not session
    session = new Session(name)
    sessions[session.name] = session
    res.redirect "/#{session.name}/player"

  # attempting to start an existing party
  # join instread
  else if player and session.player
    console.log "#{name} already has a player"
    res.redirect "/#{name}"

  # join or start a party
  else
    console.log "joining #{name}"
    session.player = new Player() if player
    req.tuna = session
    next()

module.exports = Session

# Tuna party

_        = require 'lodash'
async    = require 'async'
mongoose = require 'mongoose'
io       = require 'socket.io'
User     = require './user'

SERVER_ERR = 'server misfired :( please try again'

PartySchema = new mongoose.Schema(
  name :
    # bug -- if creating a new Party({name : undefined}),
    # the required parameter causes a validation error
    required : true 
    type     : String

    # generate random party name
    default  : ->
      chars  = 'abcdefghjkmnprstuvwxyz23456789'
      length = 4
      name   = while length -= 1 
        chars[_.random chars.length - 1]
      name.join ''

  songs  : [ ]
  player : Boolean,
  users  : [
    type : mongoose.Schema.Types.ObjectId
    ref : 'User'
  ]
)

moveSong = 

socketify = (party, io) ->
  io.on 'connection', (s) ->
    # send songs to client
    s.emit 'songs', party.songs

    # add a song
    s.on 'add', (song) ->
      if _.find party.songs, { id: song.id }
        return s.emit 'error', 'this song is already in the queue'

      party.songs.push song
      party.save (err, party) ->
        if err 
          return s.emit 'error', SERVER_ERR
        e.emit 'added', true

    # upvote a song
    s.on 'up', (id) ->
      console.log 'TODO'


PartySchema.statics.findByName = (name, next) ->
  @findOne name: name, next

PartySchema.statics.join = (req, res, next) ->
  player = /\/player$/.test req.path
  name = req.params[if player then 0 else 'name'] # bug?

  startParty = (name) ->
    party = new Party ({ name : name } if name)
    party.save (err, party) ->
      return res.send 500, err if err
      socketify results.party, req.io.of party.name
      res.redirect "/#{party.name}/player"

  # don't search for empty party name
  # just start a new one instead
  if not name then return startParty()

  Party.findByName name, (err, party) ->
    # start an new party
    if not party then startParty()

    # attempting to start an existing party
    else if player and party.player
      return res.redirect "/#{name}"

    # join an existing party
    sid = req.cookies['connect.sid']
    User.findBySid sid, (err, user) ->
      return res.send 500, err if err

      user = new User sid: sid if not user
      party.users.addToSet user

      async.parallel {
        party : party.save.bind party
        user  : user.save.bind  user 
      }, (err, results) ->
        return res.send 500, err if err
        res.locals.party = results.party
        next()

module.exports = Party = mongoose.model 'Party', PartySchema

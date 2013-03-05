# Tuna party

_        = require 'lodash'
async    = require 'async'
mongoose = require 'mongoose'

User     = require './user'

PartySchema = new mongoose.Schema(
  name : 
    required : true
    type     : String

    # generate random party name
    default  : ->
      chars  = 'abcdefghijklmnpqrstuvwxyz23456789'
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

PartySchema.statics.findByName = (name, next) ->
  @findOne name: name, next

PartySchema.statics.join = (req, res, next) ->
  player = /\/player$/.test req.path
  name = req.params[if player then 0 else 'name'] # bug?

  Party.findByName name, (err, party) ->
    if not party
      # start new party
      party = new Party name: name
      party.save (err, party) ->
        return res.send 500, err if err
        res.redirect "/#{party.name}/player"

    else if player and party.player
      # attempting to start an existing party
      res.redirect "/#{name}"
    
    else 
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

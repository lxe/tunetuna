# Tuna user
# 
mongoose = require 'mongoose'

UserSchema = new mongoose.Schema(
  sid : String
  joined : 
    type : Date
    default : Date.now
  votes : { }
)

UserSchema.statics.findBySid = (sid, next) ->
  @findOne sid: sid, next

module.exports = User = mongoose.model 'User',  UserSchema

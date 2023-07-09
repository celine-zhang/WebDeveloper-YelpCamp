const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

const UserSchema = new Schema({
  //enter other attributes except from the username and pw
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

//use this to add the username and pw also other functions
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);

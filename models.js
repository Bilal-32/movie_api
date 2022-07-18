const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Define Movies Schema
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  ReleaseYear: String,
  RunTime: String,
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
    Birth: String,
    Death: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});
//Define UserSchema
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthdate: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});
//Function to hash password
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};
//Function to validate password
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;

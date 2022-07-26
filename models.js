const mongoose = require('mongoose'),
      bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema ({
    Name : { type :String, required : true},
    Description : {type : String , required : true},
    Genre: {
        Name : String,
        Definition : String 
    },
    Director : {
        Name : String,
        Bio : String ,
        Birth_year : Number 
    },
    ImagePath : String,
    Featured : Boolean
});

let userSchema = mongoose.Schema({
    Username : {type : String, required : true},
    Email : {type : String, required: true},
    Password : {type : String, require : true},
    Birthday : Date,
    FavoriteMovies: [{type : mongoose.Schema.Types.ObjectId, ref : 'Movies'}]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
  
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
  };

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;

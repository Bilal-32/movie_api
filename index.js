/* Integrating Mongoose to perform CRUD operations on MongoDB data.
-----------------------------------------------------------------------------------*/
const mongoose = require('mongoose');
const Models = require('./model.js');

const Movies = Models.Movie; // Refers to the model names created in "model.js"
const Users = Models.User;


mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }); // Now, your connection URI will never be exposed in your “index.js” file. This is much more secure!
/*---------------------------------------------------------------------------------*/

const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'), // import built in node modules fs and path
    path = require('path'),
    uuid = require('uuid');

const bodyParser = require('body-parser'),
    methodOverride = require('method-override');
const { send, title } = require('process');

const cors = require('cors');

const { check, validationResult } = require('express-validator');

const app = express();

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })

app.use(morgan('combined')); // setup the logger, Mildware function to the terminal

app.use(express.static('public')); // Automatically routes all requests for static files to their corresponding files within a certain folder on the server.

app.use(bodyParser.json()); // support parsing of application/json type post data
app.use(bodyParser.urlencoded({ extended: true })); //support parsing of application/x-www-form-urlencoded post data

app.use(cors());

let auth = require('./auth')(app); // note the app argument you're passing here. This ensures that Express is available in your “auth.js” file as well.

const passport = require('passport');
require('./passport');

app.use(methodOverride());


let usersMovies = [
    {
        userMovieId: '',
        userId: '',
        movieId: '',
    },
];

app.get('/', (req, res) => {
    res.send('Welcome to my movie API!');
});

app.get('/documentation', (req, res) => {
    
    res.sendFile('public/documentation.html', { root: __dirname });
});

// CREATE
// Now using Mongoose
app.post('/users', [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
    check('birthday', 'Birthday does not appear to be valid').isDate()
], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + 'already exists');
            } else {
                Users
                    .create({
                        username: req.body.username,
                        password: hashedPassword,
                        email: req.body.email,
                        birthday: req.body.birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// CREATE. Add a movie to users list of favorite, using Mongoose
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, {
        $push: { favoriteMovies: req.params.movieId }
    },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

// READ get all movies using Mongoose
app.get('/movies', function (req, res) { //passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then(function (movies) {
        //.then((movies) => {
            res.status(201).json(movies);
        })
        .catch(function(error) {
        //.catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ

// READ Getting movie by title using Mongoose
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ title: req.params.title })
        .then((movie) => {
            res.json(movie)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// READ Getting movie by genre in Mongoose
app.get('/movies/genre/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'genre.name': req.params.name })
        .then((movie) => {
            res.json(movie.genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
})


// READ Getting Director in Mongoose
app.get('/movies/director/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'director.name': req.params.name })
        .then((movie) => {
            res.json(movie.director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
})

// READ in Mongoose
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// READ getting a user by name in Mongoose
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ username: req.params.username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// UPDATE a user's info, by username in Mongoose
app.put('/users/:username', [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
    check('birthday', 'Birthday does not appear to be valid').isDate()
], passport.authenticate('jwt', { session: false }), (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate({ username: req.params.username }, {
        $set:
        {
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday
        }
    },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


// DELETE favorite movie in user's list by movieId
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, {
        $pull: { favoriteMovies: req.params.movieId }
    },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


// DELETE in Mongoose
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.username + ' was not found');
            } else {
                res.status(200).send(req.params.username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('*', (req, res) => {
    res.send(`I don't know that path!`)
})


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke! Sorry...')
})

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});

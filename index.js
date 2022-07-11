const express = require('express');
morgan = require('morgan');
const app = express();

let topMovies = [
  {
    title: 'Conjuring'

  },
  {
    title: 'Annabelle Creation'

  },
  {
    title: 'The theory of everything'

  },
  {
    title: 'Half Girlfriend'

  },
  {
    title: 'Untraceable'

  },
  {
    title: 'In the shadow of the moon',

  },
  {
    title: 'Zohan'

  },
  {
    title: 'Get hard'

  },
  {
    title: 'Insidious'

  },
  {
    title: 'Creed'

  }
];

app.use(express.static('public'));

app.use(morgan('common'));

app.get('/', (req, res) => {
  res.send('This is my top 10 movies list');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// error handling code
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(8080, () => {
  console.log('This app is running on port 8080');
});

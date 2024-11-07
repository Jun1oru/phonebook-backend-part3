const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const app = express();

const Person = require('./models/person');
let persons = [];

morgan.token('content', function (req, res) {
  return JSON.stringify(req.body);
});
const morganLogger =
  ':method :url :status :res[content-length] - :response-time ms :content';

app.use(express.static('dist'));
app.use(cors());
app.use(express.json());
app.use(morgan(morganLogger));

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const page = `<p>Phonebook has info for ${
        persons.length
      } people</p><p>${new Date()}</p>`;
      response.send(page);
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  try {
    Person.findByIdAndDelete(request.params.id)
      .then((result) => {
        console.log(result);
        Person.find({}).then((persons) => {
          response.json(persons);
        });
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
});

app.post('/api/persons', async (request, response, next) => {
  const body = request.body;

  const personExist = await Person.exists({ name: body.name });
  if (personExist)
    return response.status(400).json({
      error: 'name must be unique',
    });

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

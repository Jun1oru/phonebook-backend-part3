const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name: 'Mary Poppendieck',
  number: '39-23-6423122',
});

person.save().then((result) => {
  console.log(
    `added ${result.name} number ${result.number} to phonebook`
  );
  mongoose.connection.close();
});

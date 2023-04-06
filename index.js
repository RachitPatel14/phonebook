require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./modules/mongo')
const requestLogger = (req, res, next) => {
  console.log('Method', req.method);
  console.log('Path', req.path);
  console.log('Body', req.body);
  console.log('---');
  next()
}
const app = express()
app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static('build'))
const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({error: 'malformatted id'})
  }
  else if(error.name === 'ValidationError'){
    return res.status(400).json({error: error.message})
  }

  next(error)
}
let data = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
morgan.token('body', (req,res) => {return JSON.stringify({name: req.body.name, number: req.body.number})})
app.use(morgan('tiny'))
app.get('/', (req,res) => {
  res.send('Welcome to my page')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(person => {
    res.json(person)
  })
})

app.post('/api/persons', morgan(`:method :url :status :res[content-length] - :response-time ms :body`), (req, res, next) => {
  const body = req.body
  console.log(body)
  if(body.name === undefined) res.status(400).json({ error: 'content missing'})
  if(data.filter(d => d.name.match(body.name)).length === 1) res.status(400).json({error: 'name must be unique'})
  else{
    const person = new Person({
      name: body.name,
      number: body.number,
    })
    console.log(person)
    person.save().then(savedPerson => {
      console.log("person saved to mongodb");
      res.json(savedPerson)
    }).catch(error => next(error))
  }
})

app.get('/api/info', (request, response) => {
  console.log(Person);
  const date = new Date();
  Person.find({}).then(result => {
    response.send(`<p>Phonebook has info for ${result.length} people</p>
    <p>${date}</p>`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    console.log(person)
    if(person) {
      res.json(person)
    }
    else{
      res.status(404).end()
    }
  }).catch((err) => next(err))
}) 

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
  .then(res => {
    res.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const {name, number} = req.body
  Person.findByIdAndUpdate(
    req.params.id, 
    {name, number}, 
    {new: true, runValidators: true, context: 'query'})
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})
app.use(errorHandler)
const PORT =  process.env.PORT
app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})
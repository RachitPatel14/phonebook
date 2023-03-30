const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
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
    res.json(data)
})
const generateId = () => {
  const maxId = data.length > 0
  ? Math.max(...data.map(d => d.id))
  : 0
 return maxId + 1
}
app.post('/api/persons', morgan(`:method :url :status :res[content-length] - :response-time ms :body`), (req, res) => {
  const body = req.body
  if(!body.name) res.status(400).json({ error: 'content missing'})
  if(data.filter(d => d.name.match(body.name)).length === 1) res.status(400).json({error: 'name must be unique'})
  else{
    const person = {
      id: generateId(),
      name: body.name,
      number: body.number
    }
    console.log(person)
    data = data.concat(person)
    res.json(person)
  }
})

app.get('/api/info', (request, response) => {
  const date = new Date();
  response.send(`<p>Phonebook has info for ${data.length} people</p>
  <p>${date}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = data.find(d => d.id === id)
  if(person) res.json(person)
  else res.status(404).end()
}) 

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  data = data.filter(d => d.id !== id)

  res.status(204).end()
})

const PORT =  process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
})
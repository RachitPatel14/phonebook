const mongoose = require('mongoose')

if(process.argv.length<3) {
    console.log("must pass your password as an argument")
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://rlpatel1411:${password}@cluster0.aon6u2g.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', phoneSchema)

if(process.argv.length>3){
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    person.save().then(res => {
        console.log('person saved');
        mongoose.connection.close()
    })
}
else{
    Person.find({}).then(res => {
        console.log("phonebook:")
        res.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}
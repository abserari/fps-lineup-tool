require('dotenv').config();

const fs = require('fs')
const join = require('path').join
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const config = require('./config');
const models = join(__dirname, 'models');
const bodyParser = require('body-parser');

fs.readdirSync(models)
    .filter(file => ~file.search(/^[^.].*\.js$/))
    .forEach(file => require(join(models, file)))


const app = express();


const hero = require('./controllers/hero');
const lineup = require('./controllers/lineup');
const map = require('./controllers/map');

const upload = multer({storage: multer.memoryStorage()})

app.use(bodyParser.json());
app.use('/home', express.static('./static/home'))
app.use('/manage', express.static('./static/manage'))

app.get('/heros', hero.index)
app.post('/heros', hero.create)
app.post('/hero-skills', hero.addSkill)
app.get('/maps', map.list)
app.post('/maps', upload.single('image'), map.create)
app.get('/lineups',lineup.list)
app.post('/lineups', upload.array('images'), lineup.create)
app.delete('/lineups/:id', lineup.delete)
app.get('/lineups/:id', lineup.get)


app.use((req, res) => {
    res.status(404).send('404 Not Found');
})

const PORT=config.port;
console.log(config.db)

// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}/`)
// })

function listen(){ 
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`)
    })
}

function connect() {
    mongoose.connection
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen)
    return mongoose.connect(config.db)
}

connect()

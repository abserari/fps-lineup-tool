require('dotenv').config();

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const config = require('./config');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

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
app.get('/lineups', lineup.list)
app.post('/lineups', upload.array('images'), lineup.create)
app.delete('/lineups/:id', lineup.delete)
app.get('/lineups/:id', lineup.get)

app.use((req, res) => {
    res.status(404).send('404 Not Found');
})

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`)
});
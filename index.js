const express = require('express');
const connectToMongo = require('./db');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
var cors = require('cors');

connectToMongo();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json())


app.use(express.json())

//avaible routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);


app.listen(port, () => {
  console.log(`inotes backend listening on port http://localhost/${port}`);
});
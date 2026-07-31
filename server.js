const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

app.use(express.json());   // <-- this line, before routes

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const visitRoutes = require('./routes/visits');
app.use('/api/visits', visitRoutes);

app.listen(3000, () => console.log('Server running'));
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

const locationRoutes = require('./routes/locations');
app.use('/locations', locationRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes (adjust options for production)
app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => res.send('Hello from backend'));

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

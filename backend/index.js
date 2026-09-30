const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

app.listen(5000, () => {
    console.log("Listening on port 5000....");
});

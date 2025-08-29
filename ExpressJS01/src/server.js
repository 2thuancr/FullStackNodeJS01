require('dotenv').config({ path: './config.env' });

const express = require('express');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const { connection } = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();

const port = process.env.PORT || 8888;

app.use(cors()); //config cors
app.use(express.json()) // //config req.body cho json
app.use(express.urlencoded({ extended: true })) // for form data
configViewEngine(app); //config template engine

// Web routes
const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use('/', webAPI);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API routes
app.use('/v1/api/', apiRoutes);

// Start server
(async () => {
    try {
        await connection(); //kết nối database using mongoose
        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`)
        })
    } catch (error) {
        console.error('Database connection failed:', error);
    }
})();

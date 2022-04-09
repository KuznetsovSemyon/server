require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/router.js')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const errorMiddleware = require('./middlewares/error-middleware')

const PORT = process.env.PORT || 5000;

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'REST API for Module 2.1',
          version: '1.0.0',
          description: 'REST API for Module 2.1',
        },
          servers: [
              {
                url: 'http://localhost:5000'
              },
        ],
    },
    apis:["./router/*.js"]
}
const swDocument = swaggerJsDoc(swaggerOptions)

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(router)
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swDocument))
app.use(errorMiddleware)

async function startApp() {
    try {
        await mongoose.connect(process.env.DB_URL, {useUnifiedTopology: true, useNewUrlParser: true})
        app.listen(PORT, () => console.log('SERVER START = ' + PORT))
    } catch (e) {
        console.log(e)
    }
}

startApp()
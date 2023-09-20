import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express()


// App Configuration
const corsOptions = {
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174',
    ],
    credentials: true
}

app.use(cors(corsOptions))
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
// app.use(express.static('public'))




// List
app.get('/api/toy', (req, res) => {
    let { searchKey, sortBy, toyLabel, inStock } = req.query
    const filterBy = { searchKey, sortBy, toyLabel, inStock }
    toyService.query(filterBy)
        .then(toys => {
            res.send(toys)
        })
        .catch(err => {
            loggerService.error('Cannot load toys', err)
            res.status(400).send('Cannot load toys')
        })
})

// Add
app.post('/api/toy', (req, res) => {
    const { name, price } = req.body
    let toy = toyService.getEmptyToy()
    toy = { ...toy, name, price }
    toyService.save(toy)
        .then(savedToy => {
            res.send(savedToy)
        })
        .catch(err => {
            loggerService.error('Cannot add toy', err)
            res.status(400).send('Cannot add toy')
        })
})

// Edit
app.put('/api/toy', (req, res) => {

    const { name, labels, price, _id, createdAt, inStock } = req.body
    const toy = {
        _id,
        name,
        price,
        labels,
        createdAt,
        inStock,
    }
    toyService.save(toy)
        .then((savedToy) => {
            res.send(savedToy)
        })
        .catch(err => {
            loggerService.error('Cannot update toy', err)
            res.status(400).send('Cannot update toy')
        })

})

// Read - getById
app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.get(toyId)
        .then(toy => {
            toy.msgs =['This is a funny msg']
            res.send(toy)
        })
        .catch(err => {
            loggerService.error('Cannot get toy', err)
            res.status(400).send(err)
        })
})

// Remove
app.delete('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.remove(toyId)
        .then(() => {
            res.send({toyId})
        })
        .catch(err => {
            loggerService.error('Cannot delete toy', err)
            res.status(400).send('Cannot delete toy, ' + err)
        })
})

app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})



// Listen will always be the last line in our server!
const port = 3030
app.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})
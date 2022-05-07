const express = require('express');
const app = express()
const cors = require('cors');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dreamelectronics.eefg6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const inventoryCollection = client.db('inventoryItems').collection('items')
        const addedCollection = client.db('inventoryItems').collection('addedItems')
        console.log("db connected");

        // Inventory Get API
        app.get('/inventories', async(req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // Added Items Post API
        app.post('/addedItems', async (req, res) => {
            const addedItem = req.body
            const result = await addedCollection.insertOne(addedItem)
            res.send(result)
        })
    }
    finally {
        // client.close()
    }
}

run().catch(console.dir)




app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, () => {
    console.log('Dream Electronics Server Is Runnig At:', port);
})
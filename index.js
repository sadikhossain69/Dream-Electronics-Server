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


const uri = "mongodb+srv://New_User:le5LLbTAvmW5cvNe@dreamelectronics.eefg6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const inventoryCollection = client.db('inventoryItems').collection('items')
        console.log("db connected"); 

        // Inventory API
        app.get('/inventories', async(req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query)
            const result = await cursor.toArray()
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
const express = require('express');
const app = express()
const cors = require('cors');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
// const { decode } = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ massage: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ massage: 'forbidded access' })
        }
        // console.log('decoded', decoded);
        req.decoded = decoded
        next()
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dreamelectronics.eefg6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const inventoryCollection = client.db('inventoryItems').collection('items')
        const addedCollection = client.db('inventoryItems').collection('addedItems')
        console.log("db connected");

        // Inventory Get API
        app.get('/inventories', async (req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // Inventory Single Item Get API
        app.get('/inventories/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.findOne(query)
            res.send(result)
        })

        // Inventory Single Item Delete API
        app.delete('/inventories/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        })

        // Inventory Single Item Quantity Minus by 1
        app.put('/inventories/:id', async (req, res) => {
            const id = req.params.id
            const updateItem = req.body
            const filter = { _id: ObjectId(id) }
            const options = {upsert: true}
            const updateDoc = {
                $set: {
                    quantity: updateItem.newQuantity
                }
            }
            const result = await inventoryCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        // app.put('/inventories/:id', async(req, res) =>{
        //     const newQuantity = req.body;
        //     console.log(newQuantity);
        //     const id = req.params.id; 
        //     console.log(id);
        //     const filter = {_id: ObjectId(id)};
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: newQuantity,
        //       };
        //     const result = await inventoryCollection.updateOne(filter, updateDoc, options);
        //     res.send(result)
        // })

        // Added Items Post API
        app.post('/addedItems', async (req, res) => {
            const addedItem = req.body
            const result = await addedCollection.insertOne(addedItem)
            res.send(result)
        })

        // Added Items Get API
        app.get('/addedItems', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded?.email
            const email = req.query?.email
            console.log(email);
            if (email === decodedEmail) {
                const query = { email: email }
                console.log(query);
                const cursor = addedCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }
            else {
                res.status(403).send({ massage: 'forbidder access' })
            }
        })

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })

        // Added Item Delete API
        app.delete('/addedItems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await addedCollection.deleteOne(query);
            res.send(result);
        });
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
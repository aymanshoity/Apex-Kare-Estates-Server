const dotenv = require('dotenv');
dotenv.config()
const express = require('express');
const cors = require('cors');
const  jwt = require('jsonwebtoken');
const app=express()
const port=process.env.port || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je93mhd.mongodb.net/?retryWrites=true&w=majority`;
// middleware
app.use(express.json())
app.use(cors())





// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const apartmentCollection = client.db("Apex-Kare-Estate").collection("apartments");
    const accountHolderCollection = client.db("Apex-Kare-Estate").collection("accountHolders");

    app.get('/apartments' ,async(req,res)=>{
        const cursor=await apartmentCollection.find().toArray()
        res.send(cursor)
    })

    app.post('/accountHolders', async(req,res)=>{
        const accountHolder=req.body;
        const  result=await accountHolderCollection.insertOne(accountHolder)
        res.send(result)
    })


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Apex-Kare-Estate is opening for all')
})

app.listen(port,()=>{
    console.log(`Apex-Kare-Estate is running on port ${port}`)
})
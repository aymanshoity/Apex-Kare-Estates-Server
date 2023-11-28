
const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.PORT || 5000





app.use(
  cors({
      origin: ['http://localhost:5173', 'https://enmmedia.web.app'],
      credentials: true,
  }),
)
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.je93mhd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
})

const dbConnect = async () => {
    try {
        client.connect()
        console.log('DB Connected Successfully✅')
    } catch (error) {
        console.log(error.name, error.message)
    }
}
dbConnect()


// all database collection
    const apartmentCollection = client.db("Apex-Kare-Estate").collection("apartments");
    const accountHolderCollection = client.db("Apex-Kare-Estate").collection("accountHolders");
    const agreementRequestsCollection = client.db("Apex-Kare-Estate").collection("agreementRequests");



// default route
app.get('/', (req, res) => {
  res.send('Apex-Kare-Estate is opening for all')
})


// others routes
/* Brands Route */
   
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.TOKEN, { expiresIn: "1h" })
      res.send({ token })
    })

    app.get('/apartments', async (req, res) => {
      const cursor = await apartmentCollection.find().toArray()
      res.send(cursor)
    })

    app.post('/accountHolders', async (req, res) => {
      const accountHolder = req.body;
      const query = { email: accountHolder.email }
      const existingUser = await accountHolderCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'User already exist', insertedId: null })
      }
      const result = await accountHolderCollection.insertOne(accountHolder)
      res.send(result)
    })
    app.get('/accountHolders', async (req, res) => {
      const cursor = await accountHolderCollection.find().toArray()
      res.send(cursor)
    })

    app.post('/agreementRequests', async (req, res) => {
      const agreementRequest = req.body;
      const result = await agreementRequestsCollection.insertOne(agreementRequest)
      res.send(result)
    })
    app.get('/agreementRequests', async (req, res) => {
      const cursor = await agreementRequestsCollection.find().toArray()
      res.send(cursor)
    })

    app.patch('/accountHolders/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const existingRole=req.body
      const updatedDoc = {
        $set: {
          role: existingRole.role
        }
      }
      const result = await accountHolderCollection.updateOne(query, updatedDoc)
      res.send(result)

    })

app.listen(port, () => {
  console.log(`Apex-Kare-Estate is running on port ${port}`)
})
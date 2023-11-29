
const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.PORT || 5000





app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://enmmedia.web.app'],
    credentials: true,
  }),
)
app.use(express.json())


const verifyToken = (req, res, next) => {
  console.log('inside verified token', req.headers.authorization)
  if (!req.headers.authorization) {
    res.status(401).send({ message: 'Unauthorized' })
  }
  const token = req.headers.authorization.split(' ')[1]
  jwt.verify(token, process.env.TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized' })
    }
    req.decoded = decoded;
    next()
  })
}

const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email }
  const accHolder = await accountHolderCollection.findOne(query)

  const isAdmin = accHolder?.role === "admin"
  if (!isAdmin) {
    return res.status(403).send({ message: 'Forbidden Access' })
  }
  next()

}


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
const announcementsCollection = client.db("Apex-Kare-Estate").collection("announcements");
const couponsCollection = client.db("Apex-Kare-Estate").collection("coupons");



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
app.get('/accountHolders', verifyToken, verifyAdmin, async (req, res) => {
  const cursor = await accountHolderCollection.find().toArray()
  res.send(cursor)
})

app.post('/agreementRequests', verifyToken, async (req, res) => {
  const agreementRequest = req.body;
  const result = await agreementRequestsCollection.insertOne(agreementRequest)
  res.send(result)
})
app.get('/agreementRequests', verifyToken, async (req, res) => {
  const cursor = await agreementRequestsCollection.find().toArray()
  res.send(cursor)
})
app.patch('/agreementRequests/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const existingRole = req.body
  const updatedDoc = {
    $set: {
      role: existingRole.role,
      status: existingRole.status
    }
  }
  const result = await agreementRequestsCollection.updateOne(query, updatedDoc)
  res.send(result)

})
app.get('/agreementRequests', verifyToken, async(req, res) => {
  const email = req.query.email;
  console.log('user in the valid token', req.user.email)

  if (email !== req.user.email) {
    return res.status(403).send({ message: 'Forbidden Access' })
  }
  let query = {}

  if (req.query?.email) {
    query.email = email
  }
  if (req.query?.role) {
    query.role = req.query.role
  }
  const result = await agreementRequestsCollection.findOne(query)
  res.send(result)
})

app.patch('/accountHolders/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) }
  const existingRole = req.body
  const updatedDoc = {
    $set: {
      role: existingRole.role
    }
  }
  const result = await accountHolderCollection.updateOne(query, updatedDoc)
  res.send(result)

})
app.get('/accountHolders/admin/:email', verifyToken, async (req, res) => {
  const email = req.params.email;
  if (email !== req.decoded.email) {
    return res.status(403).send({ message: 'Forbidden Access' })
  }
  const query = { email: email }
  const accHolder = await accountHolderCollection.findOne(query)
  let admin = false;
  if (accHolder) {
    admin = accHolder?.role === "admin"
  }
  res.send({ admin })
})

app.get('/announcements', verifyToken, async (req, res) => {
  const cursor = await announcementsCollection.find().toArray()
  res.send(cursor)
})

app.get('/coupons', async (req, res) => {
  const cursor = await couponsCollection.find().toArray()
  res.send(cursor)
})
app.listen(port, () => {
  console.log(`Apex-Kare-Estate is running on port ${port}`)
})
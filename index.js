const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pavt7kq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(error, decoded){
        if(error){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded= decoded;
        next();
    })
}

async function run() {
    try {
        const categoriesCollection = client.db('mobileGadget').collection('categories');
        const allCategoryCollection = client.db('mobileGadget').collection('allCategory');
        const bookingsCollection = client.db('mobileGadget').collection('bookings');
        const usersCollection = client.db('mobileGadget').collection('users');
        const productsCollection = client.db('mobileGadget').collection('products');


        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories);
        })

        app.get('/category-mobile/:id', async (req, res) => {
            const id = req.params.id;
            const query = {};
            const allCategory = await allCategoryCollection.find(query).toArray();
            const category_mobile = allCategory.filter(mobile => mobile.category_id === id)
            res.send(category_mobile);
        })

        app.get('/bookings', verifyJWT, async(req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'})
            }
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query)
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'});
                return res.send({accessToken: token});
            }
            res.status(403).send({accessToken: ''})
          });

          app.post('/add-product', async(req, res) => {
            const productInfo = req.body;
            const result = await productsCollection.insertOne(productInfo);
            res.send(result);
        })

        // app.get('/bookings', verifyJWT, async(req, res) => {
        //     const email = req.query.email;
        //     const decodedEmail = req.decoded.email;
        //     if(email !== decodedEmail){
        //         return res.status(403).send({message: 'forbidden access'})
        //     }
        //     const query = {email: email};
        //     const bookings = await bookingsCollection.find(query).toArray();
        //     res.send(bookings);
        // })

        app.get('/my-product', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })


          app.get('/users', async(req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            const seller= users.filter(seller => seller.accountType === "seller")
            res.send(seller);
          }) 

          app.get('/users/admin/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
          })

        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
          });

          
          app.put('/users/admin/:id', verifyJWT,  async(req, res) => {
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query)

            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'})
            }
            
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const options = {upsert: true};
            const updatedDoc = {
                $set: {
                    role: 'admin'
                 }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
          })

    }
    finally {

    }
}
run().catch(console.log)



app.get('/', async (req, res) => {
    res.send('Mobile gadget server is running');
})

app.listen(port, () => {
    console.log(`Mobile gadget running on ${port}`);
})
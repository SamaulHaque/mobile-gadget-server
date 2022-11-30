const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pavt7kq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('mobileGadget').collection('categories');
        const allCategoryCollection = client.db('mobileGadget').collection('allCategory');
        const bookingsCollection = client.db('mobileGadget').collection('bookings');
        const usersCollection = client.db('mobileGadget').collection('users')


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

        app.get('/bookings', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
          });

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
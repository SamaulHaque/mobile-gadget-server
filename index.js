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

async function run(){
    try{
        const categoriesCollection = client.db('mobileGadget').collection('categories')

        app.get('/categories', async(req, res)=> {
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories);
        })
    }
    finally{

    }
}
run().catch(console.log)


// const categories = require('./data/categories.json')
// const allCategory = require('./data/allCategory.json');
// const { query } = require('express');

// app.get('/categories', (req, res) => {
//     res.send(categories)
// })

app.get('/category-mobile/:id', (req, res) => {
    const id = req.params.id;
    const category_mobile = allCategory.filter(mobile => mobile.category_id === id)
    res.send(category_mobile);
})

app.get('/', async(req, res) => {
    res.send('Mobile gadget server is running');
})

app.listen(port, () => {
    console.log(`Mobile gadget running on ${port}`);
})
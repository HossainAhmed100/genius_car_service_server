const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nxph8s3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.get('/', (req, res) => {
    res.send('Genisur Car Service = Sarver is Running...')
});


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'Unauthorize Access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).send({message: 'Forbidden Access'});
        }
        
        req.decoded = decoded;
    })
    // console.log('inside verifyJWT', authHeader);
    next()
}


async function geniusCar(){
    await client.connect();

    const serviceCollection = client.db('geniusCar').collection('service');
    const orderCollection = client.db('geniusCar').collection('order');


    //AUTH
    app.post('/login', async (req, res) => {
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        res.send(accessToken);
    })
    







    app.get('/services', async (req, res) => {
        const query = {};
        const serviceItem = serviceCollection.find(query);
        const result = await serviceItem.toArray();
        res.send(result);
    })

  

    app.get('/services/:id', async (req, res) => {
        const item = req.params.id;
        const query = {_id: ObjectId(item)};
        const result = await serviceCollection.findOne(query);
        res.send(result);
    })

    app.post('/services', async (req, res) => {
        const item = req.body;
        const result = await serviceCollection.insertOne(item);
        res.send(result);
    })

    app.post('/order', async (req, res) => {
        const query = req.body;
        const result = await orderCollection.insertOne(query);
        res.send(result);
    })
    app.get('/order', verifyJWT, async(req, res) =>{
        const decodedEmail = req.decoded.userEmail;
        const useremail = req.query.email;
        if(useremail === decodedEmail){
            const query = {email: useremail};
            const result = orderCollection.find(query);
            const order = await result.toArray();
            res.send(order);
        }else{
            res.status(403).send({message: 'Forbidden Access'});
        }
    })

    app.delete('n/services/:id', async (req, res) => {
        const item = req.params.id;
        const query = {_id: ObjectId(item)};
        const result = await serviceCollection.deleteOne(query);
        res.send(result);
    })

    app.put('   ', async (req, res) => {
        const itemid = req.body.serviceid;
        const item = req.body.item;
        const filter = {_id: ObjectId(itemid)};
        const option = {upsert: true};
        const updateDoc = {
            $set: {
                name: item.name,
                price: item.price,
                description: item.description,
                img: item.img,
            }
        }
        const result = await serviceCollection.updateOne(filter, updateDoc, option);
        res.send(result);
    })


}

geniusCar().catch(console.dir);
app.listen(port, () => {
    console.log("Listen Port", port)
})
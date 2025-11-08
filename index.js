const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var cors = require("cors");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://Car-Rental-Platform:zjGpeabtx0NGGJwq@cluster0.9a0hyyx.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    //    data base create
    const carsDB = client.db("cars-rental-platform");
    const carsCollection = carsDB.collection("car");

    // post apiii

    app.post("/cars", async (req, res) => {
      const newCar = req.body;
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });

    //  Get api
    app.get("/cars", async (req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //  Get id Api Data
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    //  Update Api
    app.patch("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const updatedFields = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updatedFields,
      };
      const result = await carsCollection.updateOne(query, update);

      res.send(result);
    });

    //  Delete Api
    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Worldsss!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

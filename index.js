const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9a0hyyx.mongodb.net/?appName=Cluster0`;

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
    const db = client.db("cars-rental-platform");

    const carsCollection = db.collection("car");
    const bookingsCollection = db.collection("bookings");

    app.post("/cars", async (req, res) => {
      const newCar = req.body;
      const result = await carsCollection.insertOne({
        ...newCar,
        status: "Available",
        createdAt: new Date(),
      });
      res.send(result);
    });

    app.get("/cars-all", async (req, res) => {
      const cars = await carsCollection.find().toArray();
      res.send(cars);
    });

    app.get("/cars", async (req, res) => {
      const cars = await carsCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(cars);
    });

    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const car = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.send(car);
    });

    app.patch("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await carsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;

      const existingBooking = await bookingsCollection.findOne({
        userEmail: booking.userEmail,
        carId: booking.carId,
      });

      if (existingBooking) {
        return res
          .status(400)
          .send({ message: "You already booked this car!" });
      }

      const car = await carsCollection.findOne({
        _id: new ObjectId(booking.carId),
      });

      if (!car) {
        return res.status(404).send({ message: "Car not found!" });
      }

      const result = await bookingsCollection.insertOne({
        ...booking,
        carImage: car.imageUrl,
        rentPrice: car.rentPrice,
        location: car.location,
        bookedAt: new Date(),
        status: "Booked",
      });

      if (result.insertedId && booking.carId) {
        await carsCollection.updateOne(
          { _id: new ObjectId(booking.carId) },
          { $set: { status: "Booked" } }
        );
      }

      res.send(result);
    });

    app.get("/bookings/:userEmail", async (req, res) => {
      const userEmail = req.params.userEmail;

      const bookings = await bookingsCollection
        .find({ userEmail })
        .sort({ bookedAt: -1 })
        .toArray();

      res.send(bookings);
    });
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookingsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.post("/partner", async (req, res) => {
      const partner = req.body;
      const result = await partnerCollection.insertOne(partner);
      res.send(result);
    });

    console.log("MongoDB connected successfully!");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Car Rental API!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

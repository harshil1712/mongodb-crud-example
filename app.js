const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

const uri = process.env.MONGODB_URI;
const port = process.env.PORT;

const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

let collection = null;

// starting the server
(async function () {
  try {
    // await connect(uri);
    await client.connect();
    app.listen(port, () => {
      console.log(`Server running on PORT ${port}`);
    });
    collection = client.db("learning-journal").collection("journals");
  } catch (e) {
    console.error(e);
  }
})();

// fetch all data

app.get("/", async (req, res) => {
  const result = await collection.find({}).toArray();
  res.send(result);
});

// fetch data only for certain tag

app.get("/search/:tag", async (req, res) => {
  const result = await collection.find({ tags: req.params.tag }).toArray();
  res.send(result);
});

// add data
app.post("/create", async (req, res) => {
  const data = {
    content: req.body.content,
    tags: req.body.tags,
    author: "harshil1712",
  };
  try {
    await collection.insertOne(data);
    res.send(req.body);
  } catch (err) {
    console.error(err);
  }
});

// update data

app.put("/:id", async (req, res) => {
  await collection
    .update(
      { _id: req.params.id },
      { $set: { content: req.body.content, tags: req.body.tags } },
      { upsert: true }
    )
    .then((result) => {res.send(result)})
    .catch((err) => console.error(err));
});

// delete data

app.delete("/:id", async (req, res)=> {
  await collection.deleteOne({_id: req.params.id})
  .then(result=>res.send(result))
  .catch(err=> console.error(err))
})
//jshint esversion:6
 
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();

 
app.set("view engine", "ejs");
 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
 
// Start DataBase
 
main().catch((err) => console.log(err));
 
async function main() {
  await mongoose.connect("mongodb+srv://anujkurkute:Anuj2002@anuj.dlfcjyx.mongodb.net/todolistDB");
}


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://admin-anujkurkute:A@nuj2002@anuj.dlfcjyx.mongodb.net/todolistDB";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  const itemsSchema = new mongoose.Schema({
    name: String,
  });
 
  const Item = mongoose.model("Item", itemsSchema);
 
  const item1 = new Item({ name: "Welcome to your todolist" });
  const item2 = new Item({
    name: "Hit the + button to add a new item",
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item.>",
  });
 
  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema]
  };

  const List = mongoose.model("List", listSchema);
 
    app.get("/", function (req, res) {
 
      Item.find({})
        .then(foundItem => {
          if (foundItem.length === 0) {
            return Item.insertMany(defaultItems);
          } else {
            return foundItem;
          }
        })
        .then(savedItem => {
          res.render("list", {
            listTitle: "Today",
            newListItems: savedItem
          });
        })
        .catch(err => console.log(err));
    });

 
// End DataBase
 
 
 //Post route for adding item to list
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const item= new Item({

    name: itemName
  
  });
  
  if (listName ==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName})
    .then(function (foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName); 
  List.findOne({ name: customListName })
  .then(function (foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  })
  .catch(function (err) {});
});

//Post route for deleting item from list
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() =>{
      console.log("item is successfully Deleted!");
      res.redirect("/");
    })
    .catch(err=> console.log(err));
  } else{
    let doc =  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, {
      new: true
    }).then(function (foundList)
    {
      res.redirect("/" + listName);
    }).catch( err => console.log(err));
  }
});
 
app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});
 
app.get("/about", function (req, res) {
  res.render("about");
});
 
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
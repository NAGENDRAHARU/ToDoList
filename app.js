//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");
const date = require(__dirname + '/date.js');
console.log(date);
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// mongoose.connect("mongodb://localhost:27017/todolistDB", {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.connect("mongodb+srv://superuser:superuser@todolist.zwzdd.mongodb.net/todolistDB?retryWrites=true&w=majority", {useUnifiedTopology: true, useNewUrlParser: true});
const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema);
// app.get("/", function(req, res) {
//   let day = date.getDate();
//   res.render("list", {
//     listTitle: day,
//     newListItem: items
//   });
// });
app.get("/", function(req, res) {
  Item.find(function(err, items){
    if(items.length === 0)
    {
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully added the records.");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {
        listTitle: "Today",
        newListItem: items
      });
      items.forEach(function(item){
        console.log(item);
      });
    }
  });
});
app.post("/", function(req, res) {
  const newItem = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: newItem
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  console.log(req.body);
});
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        console.log("Doesn't exist!");
          const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        console.log("Exists!");
        res.render("list", {listTitle: foundList.name, newListItem: foundList.items})
      }
    }
  });
});
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.deleteOne({_id: checkedItemId}, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully deleted one row.");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});
app.listen(3000, function() {
  console.log("Server has started running on port:3000..!!");
});

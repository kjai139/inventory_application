#! /usr/bin/env node

console.log(
    'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  //to name the database it's mongodb.net/<database>?
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Item = require('./models/item')
  const Category = require('./models/category')
  
  const items = [];
  const categories = [];
  
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false); // this isn't needed it's on false for default
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createItems()
    
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function itemCreate(name, description, price, number_in_stock, category) {
    const item = new Item({ name: name, description: description, price: price, number_in_stock: number_in_stock, category: category });
    await item.save();
    items.push(item);
    console.log(`Added item: ${name}, price: ${price}, number in stock: ${number_in_stock}`);
  }
  
  async function categoryCreate(name, description) {
    
    const category = new Category({
      name:name,
      description: description
    });
  
    await category.save();
    categories.push(category);
    console.log(`Added category: ${name}}, description: ${description}`);
  }

  
  async function createCategories() {
    console.log("Adding Categories");
    await Promise.all([
      categoryCreate("Books", 'Literature in many forms'),
      categoryCreate('Video Games', 'Video games in physical copy'),
      categoryCreate('Clothes', 'Most outdated fashion')
    ]);
  }
  
  async function createItems() {
    console.log('Adding Items')
    await Promise.all([
      itemCreate('Unearthing Joy', 'Some random book from amazon', 50.99, 12, categories[0]),
      itemCreate('Black T-Shirt', 'simple black t-shirt', 10.99, 200, categories[2]),
      itemCreate('Diablo 4', 'Diablo 4', 130, 0, categories[1])
    ])
  }
  
  
 
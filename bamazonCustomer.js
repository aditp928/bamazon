var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");//Changes the color of the text so that it can be easily read in the console
require('console.table');///Displays database in a clean manner on the console


//Connects to the database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function(err){
  if (err) throw err;

  listAllProducts();
});

function endConnection(){
  connection.end();
}

//Lists all the products in the products table.
function listAllProducts(){
  var query = connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    console.table(res);
    displayOptions();
  });
}

function displayOptions(){

  inquirer.prompt([
  {
    name: "id",
    message: "Item ID to purchase?",
    validate: function(value) {
      
      var idNumber = new RegExp("^[0-9]+$");

     if(idNumber.test(value)){
        return true;
      }
      return false;
    }
  },
  {
    name: "purchaseQuantity",
    message: "How many? [Quit with Q]",
    validate: function(value) {
      
      var idNumber = new RegExp("^[0-9]+$");

       if(idNumber.test(value)){
        return true;
      }
      return false;
    }
  }
  ]).then(function(input){
    purchaseProduct(input.id, input.purchaseQuantity);
  });
}

function purchaseProduct(id, quantity){
  var query = connection.query("SELECT * from products WHERE ?", {item_id: id}, 
    function(err, res) {
      if (err) throw err;

      if(res.length === 0){
        console.log(colors.red.bold("\nThere is no item with id", id, "exists in bamazon!\n"));
        return listAllProducts();
      }
      
      var stockQuantity = parseInt(res[0].stock_quantity);
      var productName = res[0].product_name;
      var unitPrice = parseFloat(res[0].price);
      var productSales = parseInt(res[0].product_sales);

      var purchaseQuantity = parseInt(quantity);

      if(stockQuantity < purchaseQuantity){
        console.log(colors.red.bold("\nInsufficient Quantity!\n"));
        return listAllProducts();
      } 

      query = connection.query("UPDATE products SET ? WHERE ?", 
        [
        {
          stock_quantity: stockQuantity - purchaseQuantity,
          product_sales: productSales + purchaseQuantity
        }, 
        {
          item_id: id
        }
        ], 
        function(err, res){
          if (err) throw err;

          console.log(colors.green.bold("\nYou have purchased", purchaseQuantity, productName + "'s.", 
            "Total cost:$", unitPrice * purchaseQuantity, "\n"));
          listAllProducts();
        });
    });
}
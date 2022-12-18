const mongoose=require("mongoose");

mongoose.connect("mongodb://localhost:27017/ToDoDataBase").then(()=>console.log("Database connection success")).catch((error)=>console.log(error));


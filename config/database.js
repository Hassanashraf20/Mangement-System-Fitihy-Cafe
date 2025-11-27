const mongoose = require("mongoose")

//conn of Database

const dbconnection = () =>{
    mongoose.connect(process.env.DB_URL).then((conn) => {
        console.log("Datebase is connected ")
        })//.catch((err)=>{
           // console.log("Datebase is faild ")
           // process.exit(1)
        //})
     
}
module.exports = dbconnection

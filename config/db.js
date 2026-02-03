const mongoose=require("mongoose");
const connectionString =process.env.DBConnection;


mongoose.connect(connectionString).then((res)=> {
    console.log("Connected to the database successfully");
}).catch((err) => {
    console.log("Database connection failed");
    console.log(err);
});
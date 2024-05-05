
const Mongoose= require("mongoose");
const localDB=`mongodb://127.0.0.1:27017/users_db`

const connectDB= async ()=>{
    Mongoose.connect(localDB)
    console.log("user db connected")
}
module.exports = connectDB;


// const localDB2 = 'mongodb://127.0.0.1:27017/blogDB';

// const connect_blog_DB = async () => {
//         Mongoose.createConnection(localDB2,{
//             bufferCommands: false,
//             serverSelectionTimeoutMS: 30000 // Disable command buffering
//         });
//         console.log("blog db connected");
// };
// module.exports = {connectDB,connect_blog_DB};


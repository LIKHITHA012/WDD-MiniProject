const express = require("express")
const bodyParser = require("body-parser");
const path = require("path"); 
const http = require("http");
//const { Server } = require("socket.io");
const WebSocket = require("ws");
const ejs = require("ejs");
const _ = require('lodash');
const retry = require('async-retry');


const app = express()
const PORT = 5000
const server = http.createServer(app);
 server.listen(PORT, () =>
  console.log(`Server Connected to port ${PORT}`)
)
//for chat room definig a server and linking it to express server
const wss = new WebSocket.Server({ server})

// Handling Error
process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
})


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//public static

app.use('/public', express.static(__dirname + '/public'));

//webpage routes

app.get('/', (req, res) =>{
    res.sendFile(__dirname + "/index.html");

});
app.get('/contact.html', (req, res) =>{
    res.sendFile(__dirname + "/contact.html");

});
app.get('/about.html', (req, res) =>{
    res.sendFile(__dirname + "/about.html");

});
app.get('/profile.html', (req, res) =>{
  res.sendFile(__dirname + "/profile.html");

});
app.get('/chat.html', (req, res) =>{
  res.sendFile(__dirname + "/chat.html");

});
app.get('/quiz.html', (req, res) =>{
  res.sendFile(__dirname + "/quiz.html");

});




//db connection for user login and registration and for blog post


const connectDB = require("./db");
connectDB();

// const connect_blog_DB = require("./blogdb");
// connect_blog_DB();


//user registration----> 

const User = require('./model/user');
// const Post = require('./model/Post'); 

// Register a new user
app.post('/register', async (req, res) => {
 try {
 const { email, password } = req.body;

 
 // Check if the email is already registered
 const existingUser = await User.findOne({ email });
 if (existingUser) {
 return res.status(400).json({ error: 'Email already registered' });
 }
 
 // Create a new user
 const newUser = new User({ email, password });
 await newUser.save();
 

 res.redirect("/profile.html");

 } catch (error) {
 console.error('Error registering user:', error);
 res.status(500).json({ error: 'An error occurred while registering the user' });
 }
});


//login----->
app.post("/login", async (req,res) => {


  const { email, password } = req.body;
  console.log("Email:", email);
  console.log("Password:", password);



  try {
    const user = await User.findOne({ email });
    console.log("User:", user);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (user.password!== password) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    
    res.redirect("/profile.html");
  } catch (error) {
    console.error('Error logging user:', error);
    res.status(500).json({ error: 'An error occurred while login the user' });
  }

});

//logput function


app.post("/logout", async (req,res) => {
  res.redirect("/");

});


//chat application code

// wss.on("connection", function connection(ws){
//   ws.on("message", function incoming(data){
//     try {
//       const { message } = JSON.parse(data); // Parse the received data as JSON
//       wss.clients.forEach(function each(client){
//         if(client != ws && client.readyState == WebSocket.OPEN){
//           client.send(message); // Send the extracted message
//         }
//       });
//     } catch (error) {
//       console.error('Error parsing message:', error);
//     }
//   });
// });






let hostConnection = null; // Store the main host connection

wss.on("connection", function connection(ws){
  if (!hostConnection) {
    hostConnection = ws; // Assign the first connected client as the main host
    console.log("Main host connected!");
  } else {
    ws.on("message", function incoming(data){
      try {
        const { message } = JSON.parse(data); // Parse the received data as JSON
        hostConnection.send(message); // Send the message to the main host
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }
});














//blog website configuration
const homeStartingContent = "Welcome to The Youth Mindset, a platform dedicated to promoting mental health awareness and well-being among young individuals. In today's fast-paced world, navigating the complexities of adolescence and young adulthood can be challenging. This blog provides a safe and anonymous space for youth to express themselves, share their experiences, and seek support without fear of judgment or stigma. Whether youre facing personal struggles, seeking advice, or simply want to connect with others, The Youth Mindset is here to empower and uplift you on your journey to mental wellness.";
app.set('view engine', 'ejs');
var posts = [];
app.get("/blogHome.html", function(req,res){
  res.render("blogHome",
  {
    homeStartingContent:homeStartingContent,
    posts:posts
  
  });

});
// app.get("/blogHome.html", async function(req, res){
//   try {
//       // Fetch all posts from the database
//       const posts = await Post.find({});
      
//       // Render the blog home page with the fetched posts
//       res.render("blogHome", {
//           homeStartingContent: homeStartingContent,
//           posts: posts
//       });
//   } catch (error) {
//       console.error("Error fetching posts:", error.message);
//       // Handle error appropriately, such as rendering an error page
//       res.status(500).send("Error fetching posts");
//   }
// });



app.get("/blogCompose.html", function(req,res){
  res.render("blogCompose");
});

app.post("/blogCompose",function(req,res){
  const post = ({
   title: req.body.posttitle,
   content: req.body.postbody
  });
posts.push(post);

res.redirect("/blogHome.html");
});




// app.post("/blogCompose", async function(req, res){
//   try {
//       // Create a new post instance with data from the request body
//       const post = new Post({
//           title: req.body.posttitle,
//           content: req.body.postbody
//       });
      
//       // Save the post to the database
//       await post.save();

//       // Redirect the user to the blog home page
//       res.redirect("/blogHome.html");
//   } catch (error) {
//       console.error("Error saving post:", error.message);
//       // Handle error appropriately, such as rendering an error page or redirecting back to the compose page with an error message
//       res.status(500).send("Error saving post: " + error.message);
//   }
// });






// app.post("/blogCompose", async function(req, res){
//     try {
//         // Define the operation to save the post to the database
//         const savePostOperation = async () => {
//             // Create a new post instance with data from the request body
//             const post = new Post({
//                 title: req.body.posttitle,
//                 content: req.body.postbody
//             });
            
//             // Save the post to the database
//             await post.save();
//         };

//         // Retry the operation with exponential backoff
//         await retry(async bail => {
//             try {
//                 // Attempt to save the post
//                 await savePostOperation();
//             } catch (error) {
//                 // If an error occurs, log it and retry
//                 console.error('Error saving post:', error.message);
//                 bail(error); // Bail out of retry loop if an unrecoverable error occurs
//             }
//         }, {
//             retries: 3, // Number of retry attempts
//             minTimeout: 1000, // Minimum delay between retries (in milliseconds)
//             maxTimeout: 3000, // Maximum delay between retries (in milliseconds)
//             onRetry: err => {
//                 console.warn(`Retrying save operation: ${err.message}`);
//             }
//         });

//         // Redirect the user to the blog home page after successful save
//         res.redirect("/blogHome.html");
//     } catch (error) {
//         console.error('Error saving post after retries:', error);
//         res.status(500).send("Error saving post: " + error.message);
//     }
// });



app.get("/posts/:postname", function(req,res){
  const requestedtitle = _.lowerCase(req.params.postname);

  posts.forEach(function(post){
    const storedtitle = _.lowerCase(post.title);

    if(storedtitle === requestedtitle){
      res.render("blogPost",
      {
        title:post.title,
        content : post.content
      
      });

    }
  });

});


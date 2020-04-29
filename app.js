require('dotenv').config()

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
	flash		= require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds")
    
//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true,
  useCreateIndex: true
 }).then(()=> {
   console.log('Connected to DB!');
 }).catch(err => {
   console.log('ERROR: ', err.message);
 });
    
// mongoose.connect("mongodb://localhost:27017/AggieCamp", {useNewUrlParser: true,
//  useCreateIndex: true
// }).then(()=> {
//  console.log('Connected to DB!');
// }).catch(err => {
//  console.log('ERROR: ', err.message);
// });

const conn = mongoose.connection;


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Soma loves coding!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.get("/campgroundtable", function(req, res){

  conn.collection('campgrounds').find().toArray(function(err, results){
    console.log(results);
    res.render("campgroundtable",{results:results}); 
  });
});

app.get("/commenttable", function(req, res){

  conn.collection('comments').find().toArray(function(err, results){
    console.log(results);
    res.render("commenttable",{results:results}); 
  });
});

app.get("/usertable", function(req, res){

  conn.collection('users').find().toArray(function(err, results){
    console.log(results);
    res.render("usertable",{results:results}); 
  });
});

// about us route
app.get("/aboutus", function(req, res){
    res.render("aboutus");
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.get('*', function(req, res){
  res.render("404");
});

app.listen(process.env.PORT || 3000, function(){
   console.log("The YelpCamp Server Has Started!");
});


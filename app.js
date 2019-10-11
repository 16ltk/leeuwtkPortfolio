require('dotenv').config();

var express = require("express"), //reuire to use "express"
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Project = require("./models/devprojects"), // "./" look up file in current directory
    Comment = require("./models/comment"), //require to use the Comments Model
    User = require("./models/user"), //root to user model

//requiring routes        
    projectRoutes = require("./routes/devprojects"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index");

//mongoose.connect("mongodb://localhost/brill_iant"); //Local DB //connect to DB for testing
mongoose.connect('mongodb://leeuwtk:leeuwtk123@ds135421.mlab.com:35421/brilliant', { useNewUrlParser: true })//Heroku (Production)

//old dbs /deprecated
//mongoose.connect("mongodb://localhost/service_desk"); //Local DB //connect to DB "service_desk"
//mongoose.connect("mongodb://leeuwtk:leeuwtk123@ds261078.mlab.com:61078/servicedesk"); //Heroku (Production)

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); //enable JS to find ".ejs" files
app.use(express.static(__dirname + "/public" + "/views" + "/vendor" + "/js")); //current directory which the script is running/executing
app.use(methodOverride("_method")); //enable overriding of methods
app.use(flash());
app.locals.moment = require('moment'); //require to use Moment JS


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Tyson is the best developer!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware (Displaying: Login/Sign Up/Logout)
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(projectRoutes);
app.use(commentRoutes);
app.use(indexRoutes);


//testing/devlopment
// app.listen(3123, function () {
// console.log("App listening on port 3000!");
// });

//production
app.listen(process.env.PORT, process.env.IP, function()
{
    console.log("The Developers Hub server has started...");
});
// ====================================================================================================
// PACKAGES SETUP
// ====================================================================================================
const express       = require("express");
const app           = express();
const bodyParser    = require("body-parser");
const mongoose      = require("mongoose");
const passport      = require("passport");
const LocalStrategy = require("passport-local");
const flash         = require("connect-flash");
const User          = require("./models/user");
const session       = require("express-session");
const methodOverride = require("method-override");
const async = require('async');
const nodemailer = require('nodemailer');
require('dotenv').config();
    
const cookieParser = require("cookie-parser");
//requiring routes
const indexRoutes = require("./routes/index");
const dashboardRoutes = require("./routes/dashboards");
const MongoDBStore = require('connect-mongo')(session);
// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;
const dbUrl = process.env.DB_URL; //|| //"mongodb://localhost:27017/db_trade-app"//;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then(() => console.log("Connected to DB!"))
.catch(error => console.log(error.message));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
const store = new MongoDBStore({
    url: dbUrl,
    secret: 'this trade platform is really great!',
    touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});
const sessionConfig = {
    store,
    name: 'session',
    secret: 'this trade platform is really great!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(async function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use("/", indexRoutes);
app.use("/dashboard", dashboardRoutes);
// ====================================================================================================
// SERVER STARTUP
// ====================================================================================================

app.listen(process.env.PORT || 3000, process.env.IP, function(){
    console.log("Server Startup!!");
});

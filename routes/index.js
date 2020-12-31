const express  = require("express");
const router   = express.Router();
const passport = require("passport");
const User     = require("../models/user");
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { text } = require("body-parser");

// ====================================================================================================
// ROOT ROUTES
// ====================================================================================================

//Landing Page
router.get("/", function(req, res){
    res.render("index");
});
router.get("/about", function(req, res){
  res.render("about");
});
router.get("/contact", function(req, res){
  res.render("contact");
});
router.get("/policy", function(req, res){
  res.render("policy");
});
// ====================================================================================================
// AUTH ROUTES
// ====================================================================================================

// show register form
router.get("/register", function(req, res){
    res.render("register", {page: "register"});
});
// handles sign up logic
router.post("/register", function(req, res){
  var newUser = new User({
    fullName: req.body.fullName,
    username: req.body.username,
    country: req.body.country,
    email: req.body.email
  });
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.render("register", {error: err.message});
    }
    passport.authenticate("local")(req, res, function(){
      req.flash("success", "Successfully Signed You Up! Nice to meet you");
      res.redirect("/dashboard");
    });
  });
});
// show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});
// handles login logic
router.post("/login", passport.authenticate("local", 
    {
      successRedirect: "/dashboard",
      failureRedirect: "/login",
      failureFlash: true,
      successFlash: "Welcome to Fox Trade"
    }), function(req, res){
});
// logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully logged you out!");
    res.redirect("/");
});

router.get("/forgot", function(req, res){
  res.render("forgot");
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address.');
          return res.redirect('/forgot');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 360000;

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'nwankwodika@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'nwankwodika@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are recieving this because your account.\n\n' +
          'click process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'if no b u.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'Email sent to ' + user.email);
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'invalid token or expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'invalid token or expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
          req.flash('error', 'Passwords do not match.');
          return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'nwankwodika@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'nwankwodika@gmail.com',
        subject: 'Password successfully changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/dasboard')
  });
});

module.exports = router;

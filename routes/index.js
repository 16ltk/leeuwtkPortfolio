var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Project = require("../models/devprojects");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

router.get("/", function(req, res)
{
    res.render("../views/home/home"); //render content of "home.ejs"
});

//Contact Me
router.get("/contact", function(req, res) 
{
    res.render("../views/home/contactMe");
});

//Contact Me
router.post("/contact", function(req, res)
{
  
    req.flash("success", "Thank You. Please note that our website is still under construction.\n\n" +
    "Kindly contact our Project Manager (Admin-LeeuwTK: (+27) 81 755 6381) to make sure that your message has been delivered.");
    res.redirect("/contact");
        
});

router.get("/about", function(req, res) 
{
    res.render("../views/home/aboutMe");
});


//================
//AUTH ROUTES
//================

//show ADMIN regsiter form
router.get("/admin", function(req, res) 
{
    res.render("../views/account/adminSignUp", {page: 'adminSignUp'});
});

//handle ADMIN sign up logic
router.post("/admin", function(req, res) 
{
    //Admin login Authorization
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            profilepic: req.body.profilepic
        });
    if(req.body.adminCode === 'tk16$GM19')
    {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user)
    {
        if(err)
       {
            console.log(err);
            return res.render("../views/account/adminSignUp", {error: err.message});
        }
        passport.authenticate("local")(req, res, function()
        {
            req.flash("success", "Welcome to The Developers Hub " + user.username);
            res.redirect("/devprojects");
        });
    });
});

//show regsiter form
router.get("/signup", function(req, res) 
{
    res.render("../views/account/signup", {page: 'signup'});
});

//handle sign up logic
router.post("/signup", function(req, res) 
{
    //login Authorization
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            profilepic: req.body.profilepic
            
        });
    User.register(newUser, req.body.password, function(err, user)
    {
        if(err)
       {
            console.log(err);
            return res.render("../views/account/signup", {error: err.message});
        }
        passport.authenticate("local")(req, res, function()
        {
            req.flash("success", "Welcome to The Developers Hub " + user.username);
            res.redirect("/devprojects");
        });
    });
});

//show login form
router.get("/login", function(req, res) 
{
    res.render("../views/account/login", {page: 'login'});
});

//login logic using Middleware
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/devprojects", 
        failureRedirect: "/login"
    }), function(req, res) {
        
});

//logout
router.get("/logout", function(req, res) 
{
    req.logout();
    req.flash("success", "Successfully Logged Out!");
    res.redirect("/devprojects");
});

//USER Profile - Default
router.get("/developers", function(req, res) 
{
    User.findById(req.params.id, function(err, foundUser)
    {
       if(err)
       {
           req.flash("error", "Something went wrong.");
           res.redirect("/");
       }
       res.render("../views/developers/show", {user: foundUser});
    });
});

//USER Profile via Submitted Pic
router.get("/developers/:id", function(req, res)
{
    User.findById(req.params.id, function(err, foundUser)
    {
       if(err)
       {
           req.flash("error", "Something went wrong.");
           res.redirect("/");
       }
       res.render("../views/developers/show", {user: foundUser});
    });
});

//View Developer Profiles
router.get("/devprofiles", function(req, res) 
{
    res.render("../views/services/listed");
});

//=====================================================================================
//FORGOT Password
//=====================================================================================
router.get("/forgot", function(req, res) {
  res.render("../views/account/forgotpassword");
});

router.post("/forgot", function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with this email address exists. Please verify your email and try again.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    //Sending the EMAIL to the user using Nodemailer
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'tk16leeuw@gmail.com',
          pass: 'tk16$GM19' //hide my gmail password and export it with command: export GMAILPW=passowrdhere
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'tk16leeuw@gmail.com',
        subject: 'The Developers Hub - Password Reset',
        text: 'You are receiving this because you or someone else has requested the reset of the password for your account.\n\n' +
          'Please click on the following link to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please report incident to: Mr Admin-LeeuwTK on (+27)81 755 6381 for further assistance\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + '. Please follow instructions on email to reset your password.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get("/reset/:token", function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('../views/account/reset', {token: req.params.token});
  });
});

router.post("/reset/:token", function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
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
          });
        } else {
            req.flash("error", "Passwords do not match. Please re-enter new password");
            return res.redirect('back');
        }
      });
    },
    //Send back Password Reset Success Confirmation
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'tk16leeuw@gmail.com',
          pass: 'tk16$GM19'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'tk16leeuw@gmail.com',
        subject: 'Your password has been successfully changed',
        text: 'Good day,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has been successfully changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/devprojects');
  });
});


module.exports = router;



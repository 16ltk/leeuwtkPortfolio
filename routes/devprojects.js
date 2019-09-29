var express = require("express");
var router = express.Router();
var Project = require("../models/devprojects");
var middleware = require("../middleware/index.js");


//INDEX ROUTE - Show all projects
router.get("/devprojects", function(req, res)
{
    Project.find({}, function(err, allProjects)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("devprojects/index", {projects: allProjects, page: 'allProjects'}); //render content to "index.ejs"
        }
    });
    //
});

//CREATE ROUTE - Add new project to DB
router.post("/devprojects", middleware.isLoggedIn, function(req, res)
{
  // get data from form and add to projects array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = 
    {
      id: req.user._id,
      username: req.user.username
    };
    
    var newProject = {name: name, image: image, description: desc, author:author};
  // Create a new project and save to DB
    Project.create(newProject, function(err, newlyCreated){
        if(err){
            console.log(err);
        } 
        else 
        {
            //redirect back to devprojects page
            console.log(newlyCreated);
            res.redirect("/devprojects");
        }
    });
});

//NEW ROUTE - Show form to create a new project
router.get("/devprojects/new", middleware.isLoggedIn, function(req, res) 
{
    res.render("devprojects/new");
});

//SHOW - Shows more info about one project
router.get("/devprojects/:id", function(req, res) {
    //find the project with provided ID //then populate comments on project and execute the query
    Project.findById(req.params.id).populate("comments").exec(function(err, foundProject)
    {
        if(err || !foundProject)
        {
            req.flash("error", "Project not found");
            res.redirect("back");
        }
        else
        {
            //render display template
            res.render("devprojects/show", {project: foundProject});
        }
    });
});

//EDIT ROUTE
router.get("/devprojects/:id/edit", middleware.checkProjectOwnership ,function(req, res)
{
    Project.findById(req.params.id, function(err, foundProject)
    {
        res.render("devprojects/edit", {project: foundProject});
    });
});

//UPDATE ROUTE
router.put("/devprojects/:id", middleware.checkProjectOwnership, function(req, res)
{
    Project.findByIdAndUpdate(req.params.id, req.body.project, function(err, project)
    {
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/devprojects/" + project._id);
        }
    });
});

//DETELE ROUTE
router.delete("/devprojects/:id", middleware.checkProjectOwnership, function (req, res) 
{
    Project.findByIdAndRemove(req.params.id, function(err, updatedProject)
    {
        if(err)
        {
            res.redirect("/devprojects");
        }
        else
        {
            res.redirect("/devprojects");
        }
    });
});

module.exports = router;
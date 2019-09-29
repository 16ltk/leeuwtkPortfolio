var express = require("express");
var router = express.Router();
var Project = require("../models/devprojects");
var Comment = require("../models/comment");
var middleware = require("../middleware/index.js");

//==========================================
// COMMENTS ROUTES
//==========================================

router.get("/devprojects/:id/comments/new", middleware.isLoggedIn, function(req, res) 
{
    //find project by id
    Project.findById(req.params.id, function(err, project)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("comments/new", {project: project});
        }
    });
});

//Comments Create
router.post("/devprojects/:id/comments", middleware.isLoggedIn, function(req, res)
{
    //lookup project using ID
    Project.findById(req.params.id, function(err, project)
    {
        if(err)
        {
            console.log(err);
            res.redirect("/devprojects");
        }
        else
        {
            Comment.create(req.body.comment, function(err, comment)
            {
                if(err)
                {
                    req.flash("error", "Something went wrong. Please try agin later");
                    console.log(err);
                }
                else
                {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    
                    //save comment
                    comment.save();
                    project.comments.push(comment);
                    project.save();
                    
                    req.flash("success", "Successfully added comment");
                    res.redirect('/devprojects/' + project._id);
                }
            });
        }
    });
});

// Comments Edit Route
router.get("/devprojects/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res)
{
    Project.findById(req.params.id, function(err, foundProject) 
    {
        if(err || !foundProject)
        {
            req.flasj("error", "No project found");
            return res.redirect("back");
        }
        
        Comment.findById(req.params.comment_id, function(err, foundComment) 
        {
            if(err)
            {
                res.redirect("back");
            }
            else
            {
                res.render("comments/edit", {project_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//Comments Update
router.put("/devprojects/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res)
{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment)
    {
        if(err)
        {
            res.redirect("back");
        }
        else
        {
            res.redirect("/devprojects/" + req.params.id);
        }
    });
});

//Comments Delete Route
router.delete("/devprojects/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res)
{
    Comment.findByIdAndRemove(req.params.comment_id, function(err)
    {
        if(err)
        {
            res.redirect("back");
        }
        else
        {
            req.flash("success", "Comment deleted");
            res.redirect("/devprojects/" + req.params.id);
        }
    });
});


module.exports = router;
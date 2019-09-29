var Project = require("../models/devprojects");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkProjectOwnership = function (req, res, next) {

    //is user logged in?
    if (req.isAuthenticated()) {
        Project.findById(req.params.id, function (err, foundProject) {
            if (err || !foundProject) {
                req.flash("error", "Project not found");
                res.redirect("back"); //redirect to previous page
            }
            else {
                //does user own the project?
                if (foundProject.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "You don't have permission buddy");
                    res.redirect("back");
                }

            }
        });
    }
    else {
        req.flash("You need to be logged in buddy");
        res.redirect("back"); //redirect to previous page
    }

}

middlewareObj.checkCommentOwnership = function (req, res, next) {
    //is user logged in?
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back"); //redirect to previous page
            }
            else {
                //does user own the comment?
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "Permission denied");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in buddy");
        res.redirect("back"); //redirect to previous page
    }
}

middlewareObj.isLoggedIn = function (req, res, next) {
    //Authentication
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

module.exports = middlewareObj;

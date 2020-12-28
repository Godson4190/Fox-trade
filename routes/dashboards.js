const express = require("express");
const router = express.Router();
router.get('/', isLoggedIn, function(req, res) {
    res.render('dashboard/index');
});

router.get('/investment', isLoggedIn, function(req, res) {
    res.render('dashboard/investment');
});
router.get('/withdrawal', isLoggedIn, function(req, res) {
    res.render('dashboard/withdrawal');
});
router.get('/silver', isLoggedIn, function(req, res) {
    res.render('dashboard/silver');
});
router.get('/gold', isLoggedIn, function(req, res) {
    res.render('dashboard/gold');
});
router.get('/diamond',isLoggedIn, function(req, res) {
    res.render('dashboard/diamond');
});
function isLoggedIn (req, res, next){
    if(req.isAuthenticated()){
    return next();
}
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};
module.exports = router;
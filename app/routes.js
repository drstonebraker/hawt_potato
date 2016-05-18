var Potato      = require('./models/potato');
var User        = require('./models/user');
var Review      = require('./models/review');
var passport    = require('passport');
var potatoRoutes= require("./routes/potatoRoutes");
//var reviewRoutes= require("./routes/reviewRoutes");
var middleware  = require("./middleware/middleware");

module.exports = function(app) {

// Potato API Routes
app.use("/api/potatoes", potatoRoutes);
    
// Review API Routes

        // Create Review route
        app.post('/api/reviews', middleware.isLoggedIn, function(req, res){
            Potato.findById(req.body.potato.id).populate("reviews").exec(function(err, potato){
               if(err){
                   console.log(err);
               } else {
                    Review.create(req.body, function(err, newReview){
                        if(err){
                            console.log(err);
                        } else {
                            newReview.author.id = req.user._id;
                            newReview.author.username = req.user.username;
                            newReview.save();
                            potato.reviews.push(newReview);
                            var average_rating = 0;
                            console.log(average_rating);
                            potato.reviews.forEach(function(review){
                                console.log(review.rating);
                                average_rating += review.rating;
                            });
                            potato.average_rating = average_rating/potato.reviews.length;
                            potato.num_of_reviews = potato.reviews.length;
                            potato.save();
                            res.json(newReview);
                        }
                    });
                }
            });
        });
        
        // Show Route
        app.get('/api/reviews/:id', function(req, res){
            Review.findById(req.params.id, function(err, review){
                if(err) {
                    console.log(err);
                } else {
                    res.json(review);
                }// return preview in JSON format
            });
        });
        
        // Update route
        app.put('/api/reviews/:id', middleware.checkReviewOwnership, function(req, res){
           Review.findByIdAndUpdate(req.params.id, req.body, function(err, newReview){
                if (err) {
                    console.log(err);
                } else {
                    res.json(newReview);
                }
            });
        });
        
        // Delete Route
        app.delete('/api/reviews/:id', middleware.checkReviewOwnership, function(req, res){
            Review.findByIdAndRemove(req.params.id, function(err){
                if(err){
                    console.log(err);
                }
            });
        });
    
    //User API Routes ==========================================================
        
        
        // Get Current User
        app.get("/api/users/current", function(req, res){
            console.log("current user request running");
            res.send(req.user);
        });
        
        // Index route
        app.get('/api/users', function(req, res) {
            // use mongoose to get all users in the database
            User.find(function(err, users) {
                // Handle errors
                if (err)
                    res.send(err);
                    
                res.json(users); // return all users in JSON format
            });
        });

        // Create route
        app.post('/api/users', function(req, res){
            User.create(req.body, function(err, newUser){
                // Handle errors
                if (err)
                    res.send(err);
                    
                res.json(newUser); // return new user in JSON format
            });
        });
        
        // Show Route
        app.get('/api/users/:id', function(req, res){
            Users.findById(req.params.id, function(err, user){
                if(err)
                    res.send(err);
                    
                res.json(user); // return user in JSON format
            });
        });
        
        // Update route
        app.put('/api/users/:id', function(req, res){
           User.findByIdAndUpdate(req.params.id, req.body, function(err, updatedUser){
                if (err)
                    res.send(err);
                    
                    res.json(updatedUser); // return updated user in JSON format
            });
        });
        
        // Delete Route
        app.delete('/api/users/:id', function(req, res){
            Potato.findByIdAndRemove(req.params.id, function(err){
                if(err){
                    res.send(err);
                }
            });
        });
        
        // User Auth Routes =======================================================
        
        // Create User
        app.post("/register", function(req, res){
            console.log(req.body);
            var newUser = new User({username: req.body.username});
            User.register(newUser, req.body.password, function(err, user){
                if(err){
                    res.send(err);
                }
                passport.authenticate("local")(req, res, function(){
                   //req.flash("success", "Welcome to YelpCamp " + user.username);
                   res.json(user); 
                });
            }); 
        });
        
        // Login
        app.post('/login', passport.authenticate('local'),
            function(req, res) {
                res.send(req.user); 
            }
        );
        
        // Logout
        app.get("/logout", function(req, res){
            req.logout();
            res.redirect("/potatoes");
        });

        // frontend routes =========================================================
        // route to handle all angular 'get' requests not caught by any get methods above 
        app.get('*', function(req, res) {
            res.sendfile('./public/views/index.html'); // load our public/index.html file
        });

    };

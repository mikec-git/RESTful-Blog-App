// Dependencies
var expressSanitizer    = require("express-sanitizer"),
    methodOverride      = require("method-override"),
    bodyParser          = require("body-parser"),
    mongoose    = require("mongoose"),
    express     = require("express"),
    app         = express();
    
// Middleware config
mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // make sure it goes after body-parser
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Mongoose/model config
var blogSchema = new mongoose.Schema({
    title:  String,
    image:  String,
    body:   String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


//TEST CREATE
// Blog.create({
//     title: "Test blog",
//     image: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
//     body: "This is a test blog demo"
// });

//RESTful routes
// Root index
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

// INDEX route
app.get("/blogs", function(req, res){
    Blog.find({},function(err, blogs){
        if(err){
            console.log(err);
        } else{
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW route
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

// CREATE route
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else{
            res.redirect("/blogs");
        }
    });
});

// SHOW route
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE route
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE route
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs");
        }
    })
});

// Server connection
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Blog app server has started...");
})
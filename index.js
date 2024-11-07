const express = require("express");
const path = require("path")
const userRoute = require("./routes/user.route")
const blogRoute = require("./routes/blog.route")
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser');
const Blog = require("./models/blog.model");
const cors = require("cors")
const dotenv = require('dotenv');
dotenv.config();


( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/MEGABLOG-APP`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(2000, () => {
            console.log(`App is listening on port 2000`);
        })

    } catch (err) {
        console.error("ERROR: ", err)
        throw err
    }
})()

const app = express();
app.use(cors());

app.use(express.urlencoded({extended: true}));
app.use(express.json());
// app.set('view engine', "ejs");
// app.set("views", path.resolve("./views"));

app.use(cookieParser());
app.use(express.static(path.resolve('./public')));
app.get('/', async(req, res)=>{
    const allblog = await Blog.find({}).populate("createdby");
    res.json(allblog);

})
app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(process.env.PORT, ()=> console.log(`app listen at port ${process.env.PORT}`));
const { Router } = require("express");
const router = Router();
const Blog = require("../models/blog.model");
const Comment = require("../models/comment.model");
const multer = require('multer')
const path = require("path");
const { v2: cloudinary } = require("cloudinary")
const fs = require("fs")
const Like = require("../models/like.model")
const View = require("../models/view.model")
const mongoose = require("mongoose")

cloudinary.config({
  cloud_name: 'dtt43q75r',
  api_key: '577993142125354',
  api_secret: '5AfELV98BV31vdwxcM6aZuEv4T0'
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`))
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
})

const upload = multer({ storage: storage });

router.post('/addblog', upload.single("file"), async (req, res) => {
  const { title, body, id } = req.body;
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads', // Optional folder in your Cloudinary storage
      public_id: `${Date.now()}_${req.file.originalname}` // Optional public ID
    });
    // console.log(req.user);
    await Blog.create({
      title,
      body,
      createdby: id,
      coverimage: result.url,
    })
    fs.unlinkSync(req.file.path);
    return res.redirect('/')
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading image'
    });

  }
})

router.get('/view/:id', async (req, res) => {
  try {
      const blogId = req.params.id;
      const blog = await Blog.findById(blogId).populate('createdby');

      if (!blog) {
          return res.status(404).json({ error: 'Blog not found' });
      }

      const comments = await Comment.find({ blogid: blogId }).populate('createdby');

      res.json({ blog, comments });
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/updateblog/:id', upload.single("file"), async (req, res) => {
  const { title, body } = req.body;
  const id = req.params.id; 
  try {
    let updateFields = {
      title,
      body,
    };

    // Check if there's a new file uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'uploads', // Optional folder in your Cloudinary storage
        public_id: `${Date.now()}_${req.file.originalname}` // Optional public ID
      });
      updateFields.coverimage = result.url;
      fs.unlinkSync(req.file.path);
    }

    // Find the blog post by ID and update it
    const updatedBlog = await Blog.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    return res.json({msg: "succuss"}); 
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating blog post'
    });
  }
});


router.post('/comment/:blogid',(req, res) => {
  const comment = req.body.formData;
const id = req.body.additionalData;

try {
  const comments = new Comment({
    comment: comment,
    blogid: req.params.blogid,
    createdby: id,
  });

  comments.save();
  
  res.json({ msg: "success" });
} catch (err) {
  res.status(500).json({ msg: "Failed to save comment" });
}

})

router.post('/count/:id',(req, res)=>{
  const postid = req.params.id;

  try {
    if (!mongoose.isValidObjectId(postid)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    const view = new View({
      blogid: postid,
    });
  
    view.save();
    
    res.json({ msg: 'success' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to save view' });
  }
  
})

router.get('/count/:id', async(req, res)=>{
  const postid = req.params.id;
  try {
    
    const viewCount = await View.countDocuments({ blogid: postid })
    
    res.json({ count: viewCount }); // Send the likes data as JSON response
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
})

router.post('/like/:id', async(req, res)=>{
  const postid = req.params.id;
const { userid } = req.body;

try {
  if (!mongoose.isValidObjectId(postid)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  const existingLike = await Like.findOne({ blogid: postid, userid: userid });

  if (!existingLike) {
    const like = new Like({
      blogid: postid,
      userid: userid,
    });

    await like.save();
    res.json({ msg: 'success' });
  } else {
    await Like.deleteOne({ blogid: postid, userid: userid });
    res.json({ msg: 'success' });
  }
} catch (err) {
  res.status(500).json({ msg: 'Failed to process like/unlike' });
}

})

router.get('/like/:id', async(req, res)=>{
  const postid = req.params.id;
  try {
    const likeCount = await Like.countDocuments({ blogid: postid })
    res.json({ count: likeCount }); 
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
})

router.get('/allblog/:id', async(req, res)=>{
  try {
    const id = req.params.id;
    const allBlogs = await Blog.find({ createdby: id }).populate('createdby');
    res.send(allBlogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
  
})

router.delete('/deleteblog/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting blog post'
    });
  }
});

module.exports = router;
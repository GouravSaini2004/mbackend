const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const History = require("../models/history.model")
const checklogin = require("../middleware/authlogin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBNJTIaY7uIf3QIt3YZvYVTAWIPCUBIT8M");

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchpassword(email , password);
        const user = checklogin(token);
        if (user) {
            res.status(200).json({ user , value: true,})
        }else {
            // If user is not found or login fails
            res.status(400).json({
            message: "Invalid credentials",
            value: false,
         });
        }
    } catch (error) {
        // console.error('Error in login:', error);
        res.status(500).json({ message: "Server error" , value: false});
    }

})

router.post('/signup', (req, res) => {
    const { fullname, email, password } = req.body;
    // console.log(req.body);
    const user = new User({
        fullname,
        email: email.toLowerCase(),
        password,
    });
    user.save().then(() => {
        res.status(200).json({ msg: "success:" })
    }).catch((err) => {
        res.status(500)
    })
});

// router.patch('/updateuser/:id', async (req, res) => {
//     const { fullname, email, password } = req.body;
//     const id = req.params.id; // Extracting the ID from the request parameters
//     try {
//       let updateFields = {
//         fullname,
//         email,
//         password, // Note: You should handle password hashing securely before updating
//       };

//       // Find the user by ID and update it
//       const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });

//       if (!updatedUser) {
//         return res.status(404).json({
//           success: false,
//           message: 'User not found'
//         });
//       }

//     //   const token = await User.matchpassword(email, password);
//     //   checklogin(token);
//       return res.json({ msg: "success" }); // Redirect to the appropriate response
//     } catch (error) {
//       console.error('Error updating user:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Error updating user'
//       });
//     }
//   });


router.post('/history/:id', (req, res) => {
    const id = req.params.id;
    const { additionalVariable } = req.body;
    
    try {
        const history = new History({
            userId: additionalVariable,
            blogId: id,
        });
    
        history.save();
    
        res.json({ msg: "success" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to save history" });
    }
    

})

router.get('/history/:id', async (req, res) => {
    const blogId = req.params.id; // Assuming this is how you get blogId from params
    try {

        const history = await History.find({ userId: blogId }).populate("blogId");

        if (history.length === 0) {
            return res.status(404).json({ msg: "No history found for the provided user ID" });
        }

        res.send(history);
    } catch (err) {
        res.status(500).json({ msg: "Server error" }); // Adjust error handling as per your application's needs
    }

})

router.post('/ai', async(req, res)=>{
    const data = req.body.data;
    // console.log(data);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = data;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Send the generated text wrapped in <p> tags as HTML response
        res.json({text: text});
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).send('Error generating content');
    }
})
module.exports = router;
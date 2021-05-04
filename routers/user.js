const express = require("express");
const router = express.Router();
const User = require("../model/user");
const auth = require('../middleware/auth');

var maxSize = 1 * 1000 * 1000;

const multer = require("multer");
const upload = multer({
        limits: { fileSize: maxSize },
        fileFilter (req, file, cb) {
            if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)){
                cb(new Error('Kindly upload file with valid extension!'))
            }
            cb(null, true);
        }
    });

router.post('/user' , async (req , res) => {
    const user = new User(req.body);
    
    try{
        await user.save();
        
        const token = await user.generateAuthToken();
        
        res.status(201).send({user , token});
    } catch(e) {
        res.status(400).send(e);
    }
    // user.save().then((result) => {
    //     res.status(200).send(result);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // })
});

router.post('/user/login' , async (req , res) => {
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password);
        const token = await user.generateAuthToken();
        if(user){
            res.status(200).send({ user , token});
        }

    }catch(e) {
        res.status(400).send("unable to login");
    }
});

router.post('/user/logout' , auth , async (req , res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.status(200).send("Logout Success!");
    }catch(e){
        res.status(500).send(e);
    }
})

router.post('/user/logoutall' , auth , async (req , res) => {
    try{
        req.user.tokens = [];

        await req.user.save();

        res.status(200).send("Logout Success!");
    }catch(e){
        res.status(500).send(e);
    }
})

router.get('/user/me' , auth , async (req , res) => {
    res.send(req.user);
    // try{
    //     const user = await User.find({});
    //     if(!user){
    //         return res.status(200).send("no user found!");
    //     }

    //     res.status(200).send(user);
    // } catch (e) {
    //     res.status(500).send(e)
    // }
    // User.find({}).then((data) => {
    //     res.status(200).send(data);
    // }).catch((e) => {
    //     res.status(500).send(e);
    // })
});


router.patch('/user/me' , auth , async(req , res) => {
    const updates = Object.keys(req.body);
    const allowupdates = ['name','email','age','password'];

    const isvalidate = updates.every((update) => {
        return allowupdates.includes(update); 
    });
    
    if(!isvalidate){
        res.status(400).send({"error" : "invalid keys to update."});
    }
    try{
        const user = await User.findById(req.user._id);

        updates.forEach((update) => {
            user[update] = req.body[update];
        })
        
        await user.save();
        //const user = await User.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true});
    
        if(!user){
            res.status(400).send();
        }

        res.status(200).send(user);
    }catch (e) {
        res.status(400).send(e);
        
    }
});

router.delete('/user/me' , auth ,async (req , res) => {
    try{
        console.log(req.user);
        await req.user.remove(); 
        res.status(200).send(req.user);
    }catch(e){
        res.status(404).send(e);
    }   
});

router.delete('/user/me/avatar' , auth , async (req , res) => {
    try{
        req.user.avatar = undefined;
        await req.user.save();

        res.status(200).send();
    }catch(e){
        res.status(400).send(e);
    }
});

router.post('/user/me/avatar' , auth , upload.single('avatar') , async (req , res) => {
    req.user.avatar = req.file.buffer;

    await req.user.save();
    res.send();
}, (error , req , res , next) => {
    res.status(400).send({error : error.message});
});

module.exports = router;
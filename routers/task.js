const express = require("express");
const router = new express.Router();
const Task = require("../model/task");
const auth = require("../middleware/auth");

//ObjectId("607a36e3ccea233b18cf4584")
router.get('/tasks' , auth ,async (req , res) => {
    
    let completed = false;
    let limit = 2;
    let page = (req.query.page - 1) * limit;

    if(req.query.completed === 'true'){
        completed = true;
    }
    
    try{
        const task = await Task.find({completed}).limit(limit).skip(page);

        if(!task){
            return res.status(400).send(task);
        }
        res.status(200).send(task);
    }catch(e){
        res.status(500).send(e);
    }
    // Task.find({}).then((task_data) => {
    //     res.status(200).send(task_data);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // });
})

router.get('/tasks/:id' , auth ,async (req , res) => {
    const _id = req.params.id;
    
    try {
        //const task = await Task.findById(_id);
        const task = await Task.findOne({_id , owner : req.user._id});
        if(!task){
            return res.status(400).send(task);
        }
        res.status(200).send(task);
    }catch(e){
        res.status(500).send(e);
    }
    // Task.findById(_id).then((task) => {
    //     if(!task){
    //         return res.status(200).send();
    //     }

    //     res.status(200).send(task);
    // }).catch((e) => {
    //     res.status(500).send(e);
    // })
});
router.post('/task' , auth , async (req , res) => {
    //const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        "owner" : req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e){
        res.status(500).send(e);
    }
    // task.save().then((result) => {
    //     res.status(200).send(result);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // })
})

router.patch('/task/:id' , auth ,async(req , res) => {
    const updates = Object.keys(req.body);
    const allowupdates = ['description','completed'];
    
    const isvalidate = updates.every((update) => {
        return allowupdates.includes(update); 
    });
        if(!isvalidate){
            res.status(400).send({"error" : "invalid keys to update."});
        }
    
        try{
            //const task = await Task.findById(req.params.id);
            const task = await Task.findOne({ "_id" : req.params.id , "owner" : req.user._id})

            if(!task){
                return res.status(404).send("no task found!");
            }

            updates.forEach((update) => task[update] = req.body[update]);

            await task.save();
        //const task = await Task.findByIdAndUpdate(req.params.id , req.body , {new:true , runValidators:true});
        
            if(!task){
                res.status(400).send();
            }
    
            res.status(200).send(task);
        }catch (e) {
            res.status(400).send(e);
            
        }
});

router.delete('/task/:id' , auth ,async(req , res) => {
    try{
        const task = await Task.findOneAndDelete({"_id" : req.params.id , "owner" : req.user.id});
         

        if(!task){
            res.status(400).send("No Task Found");
        }

        res.status(200).send("Task Deleted");
    }catch(e){
        res.status(500).send(e);
    }
})
module.exports = router;
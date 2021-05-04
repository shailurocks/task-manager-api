const mongoose = require("mongoose");

mongoose.connect(process.env.MONGOOSE_DB_URL , {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

// const me = new User({
//     name : " Shailesh ",
//     email : " Shailesh@dex.com    ",
//     password : "pa@1234  "
// });

// me.save().then(() => {
//     console.log(me);
// }).catch((error)=>{
//     console.log("error" , error);
// })

// const Task = mongoose.model('tasks' , {
//     description : {
//         type : String,
//         required : true,
//         trim : true,
//     },
//     completed : {
//         type : Boolean,
//         default : false
//     }
// });

// const new_task = new Task ({
//     description : ' Delete A User   ',
//     completed : true
// })

// new_task.save().then(() => {
//     console.log(new_task);
// }).catch((error) => {
//     console.log("error" , error);
// })
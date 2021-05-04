const mongoose = require("mongoose");
const validator = require("validator");
const encrypt = require("../middleware/encrypt");
const jwt = require('jsonwebtoken');
const Task = require("../model/task");


const userSchema = new mongoose.Schema({    
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
       required : true,
       unique: true,
       trim : true,
       lowercase : true,
       validate(value){
           if(!validator.isEmail(value)){
                throw new Error("Email id is invalid");
           }
       } 
    },  
    age : {
        type : Number,
        default : 0,
        validate(value){
            if(value < 0){
                throw new Error("Ager should be greater than 0.");
            }
        }           
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minLength : 7,
        validate(value){
            if(value.includes("password")){
                throw new Error("Password is wrong.");
            }
        }
    },
    avatar : {
        type : Buffer
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }]
},{
    timestamps : true
})

userSchema.virtual('tasks' , {
    ref : "task",
    localField : '_id',
    foreignField : 'owner'
});

userSchema.methods.toJSON = function (){
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const secrete_key = process.env.JWT_SECRETE_KEY;;

    const jwt_token = jwt.sign({"_id" : user._id.toString()} , secrete_key);
    
    user.tokens = user.tokens.concat({"token":jwt_token});
    await user.save();

    return jwt_token;
};

userSchema.statics.findByCredentials = async (email , password) => {
    const user = await User.findOne({email});

    if(!user){
        throw new Error("unable to login");
    }

    const pass_match = await encrypt.compare_password(password , user.password);
    if(!pass_match){
        throw new Error("unable to login");
    }

    return user;
}

//Hash the user password
userSchema.pre('save' ,  async function(next) {
    const user = this;
    //console.log(user);
    if(!user.isModified("password")) {
       return next();
    }
    user.password = await encrypt.encrypt_pass(user.password, 8);
    
    next();
});

userSchema.pre('remove' , async function(next) {

    const user = this;
    await Task.deleteMany({owner : user._id});
    next();
});

const User = mongoose.model('user' , userSchema);

module.exports = User;
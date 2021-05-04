const jwt = require('jsonwebtoken');
const usermodel = require("../model/user");
const secrete_key = process.env.JWT_SECRETE_KEY;

const auth = async (req , res , next) => {
    try{
        const token = req.header('authtoken');
        const decoded = jwt.verify(token , secrete_key);
        const user = await usermodel.findOne({"_id" : decoded._id , "tokens.token" : token});

        if(!user){
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    }catch(e){
        res.status(401).send("Not authenticate user!");
    }
};

module.exports = auth;
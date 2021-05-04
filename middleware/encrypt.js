const bcrypt = require("bcrypt");

const encrypt_pass = async (password , saltRound) => {
    if(password == '' || saltRound == ''){
        return next();
    }

    const encrypt_password = await bcrypt.hash(password , saltRound);

    return encrypt_password;
}

const compare_password = async (password , user_password) => {
    const match = await bcrypt.compare(password , user_password);
    return match;
}

module.exports = {encrypt_pass , compare_password}
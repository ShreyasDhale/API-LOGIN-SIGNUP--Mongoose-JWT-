const jwt = require('jsonwebtoken');
const getUser = require('../utils/db');

const auth = async (req, res, next) => {
    try {
        const User = await getUser();
        const token = req.header('Authorization').replace('Bearer ', '');
        console.log(token);
        const decode = jwt.verify(token, 'thisismyprivatekey');
        const user = await User.findOne({ _id: decode._id });
        if (!user) throw new Error("No user found");
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: "Error in Authentication" });
        console.log(e);
    }
};

module.exports = auth;

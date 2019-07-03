const jwt = require('jsonwebtoken');
const _response = require('../helpers/response')

module.exports = (req,res,next)  =>{
    let token
    if(req.body.token){
     token = req.body.token
    }else if(req.param.token){
        token = res.param.token
    }else if(req.headers.authorization){
        token = req.headers.authorization.split(" ")[1];
    }
    //check if an authtorization headeer exixsts
try{
    const decoded = jwt.verify(token,'p2456653RDFBNYH2R31324354YT43');

    req.usertoken = jwt.decode(token)
    req.decoded = decoded
    }catch(err){
    return res.status(401).json(_response.error("Token Authentication Failed"))
}

next();

}
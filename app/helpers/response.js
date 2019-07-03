  const success = (data) => {
    return {
        "status":"success",
        "data":data
    }
}


 const error = (msg) =>{
    return {
        "status":"erorr",
        "error":msg
    }
}

module.exports = {
    error,
    success
}
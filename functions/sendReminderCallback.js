const functions = require('firebase-functions');

exports.handler = async function(req, res, firestoreDb, admin) {
    console.log(req.body)
    console.log(req.body.data)
    res.sendStatus(200)    
}

const functions = require('firebase-functions');

exports.handler = async function(req, res, firestoreDb, admin) {
    //console.log(req.body)

    switch (req.body.type) {
        case 'reminder.30min':
            console.log('reminder.30min')
            console.log(req.body.data)
            break;
        case 'reminder.24hour':
            console.log('reminder.24hour')
            console.log(req.body.data)
            break;
        default:
            // Unexpected type
            return res.status(400).end();
    }

    return res.sendStatus(200)    
}

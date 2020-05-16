const functions = require('firebase-functions');

exports.handler = async function(req, res, firestoreDb, admin) {
    //console.log(req.body)

    switch (req.body.type) {
        case 'reminder.meeting.30min':
            console.log('reminder.meeting.30min')
            console.log(req.body.data)
            break;
        case 'reminder.meeting.24hour':
            console.log('reminder.meeting.24hour')
            console.log(req.body.data)
            break;
        case 'reminder.auth.6day':
            console.log('reminder.auth.6day')
            console.log(req.body.data)
            break;
        case 'reminder.auth.4day':
            console.log('reminder.auth.4day')
            console.log(req.body.data)
            break;
        case 'reminder.auth.2day':
            console.log('reminder.auth.2day')
            console.log(req.body.data)
            break;
        default:
            // Unexpected type
            return res.status(400).end();
    }

    return res.sendStatus(200)    
}

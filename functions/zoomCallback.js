const functions = require('firebase-functions');
const zoomVerificationToken = 'ZLXFn9VjQS2cHoG_y0_GUg';


exports.handler = async function(req, res, firestoreDb) {
    //console.log(`${req.headers}: ${JSON.stringify(req.headers)}`);
    if (req.headers.authorization !== zoomVerificationToken) {
        return res.status(400).end();
    }

    switch (req.body.event) {
        case 'meeting.started':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
            }
            break;
        case 'meeting.ended':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
            }
            break;
        case 'meeting.participant_joined':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
            }
            break;
        case 'meeting.participant_left':
            {
                console.log(`${req.body.event}: ${JSON.stringify(req.body.payload)}`);
            }
            break;
        default:
            // Unexpected event type
            return res.status(400).end();
    }

    // Return a response to acknowledge receipt of the event
    return res.json({received: true});
    
}


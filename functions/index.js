const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);
const database = admin.database();
var firestoreDb = admin.firestore();


if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'newUserSignup') {
    const newUserSignup = require('./newUserSignup');
    exports.newUserSignup = functions.auth.user().onCreate((event) => {
        return newUserSignup.handler(event, database, firestoreDb, admin);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'connectStripe') {
    const connectStripe = require('./connectStripe');
    exports.connectStripe = functions.https.onCall((data, context) => {
        return connectStripe.handler(data, context, firestoreDb);
    });
}
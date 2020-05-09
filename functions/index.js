const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);
const database = admin.database();
const emailHandler = require('./email');
var firestoreDb = admin.firestore();


if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'newUserSignup') {
    const newUserSignup = require('./newUserSignup');
    exports.newUserSignup = functions.auth.user().onCreate((event) => {
        return newUserSignup.handler(event, database, firestoreDb, admin);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'isRegistered') {
    const isRegistered = require('./isRegistered');
    exports.isRegistered = functions.https.onCall((data, context) => {
        return isRegistered.handler(data, context, firestoreDb);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'sendMail') {
    const sendMail = require('./sendMail');
    exports.sendMail = functions.https.onCall((data, context) => {
        return sendMail.handler(data, context, firestoreDb, emailHandler);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'connectStripe') {
    const connectStripe = require('./connectStripe');
    exports.connectStripe = functions.https.onCall((data, context) => {
        return connectStripe.handler(data, context, firestoreDb);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'addJob') {
    const addJob = require('./addJob');
    exports.addJob = functions.https.onCall((data, context) => {
        return addJob.handler(data, context, firestoreDb, admin, emailHandler);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'removeJob') {
    const removeJob = require('./removeJob');
    exports.removeJob = functions.https.onCall((data, context) => {
        return removeJob.handler(data, context, firestoreDb, admin, emailHandler);
    });
}

if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === 'updateJob') {
    const updateJob = require('./updateJob');
    exports.updateJob = functions.https.onCall((data, context) => {
        return updateJob.handler(data, context, firestoreDb, admin, emailHandler);
    });
}
const functions = require('firebase-functions');
const moment = require('moment');
var stripe = require('stripe')('sk_test_K0y591XvPNiX9UJaxdaZcSK6');


exports.handler = async function(data, context, firestoreDb, admin) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;

    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }


    try {
        const stripeDoc = await firestoreDb.collection('/stripe').doc(uid).get()
        if (!stripeDoc.exists) {
            console.log('No stripe account for this user');
            throw new functions.https.HttpsError('failed-precondition', 'Unable to verify state.');
        }

        const balance = await stripe.balance.retrieve({
            stripeAccount: stripeDoc.data().stripe_user_id
        });
        //console.log('Account balance object: ', JSON.stringify(balance));
        const available = balance.available.find(obj => obj.currency === 'usd');
        const pending = balance.pending.find(obj => obj.currency === 'usd');
            
        const payouts = await stripe.payouts.list(
            {
                created: {
                    gt: moment().subtract(7, 'days').unix(),
                }
            },
            {stripeAccount: stripeDoc.data().stripe_user_id}
        );        
        //console.log('Payouts: ', JSON.stringify(payouts));
        var payoutTotal = 0;
        for (index = 0; index < payouts.data.length; index++) { 
            payoutTotal = payoutTotal + payouts.data[index].amount
        }

        return {
            balance: available.amount + pending.amount,
            payouts: payoutTotal,
        };
    
    } catch (error) {
        console.error("Error: ", error);
        throw new functions.https.HttpsError('failed-precondition', error.message);
    } 

}
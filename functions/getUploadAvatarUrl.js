const functions = require('firebase-functions');
const AWS = require("aws-sdk");
AWS.config.update({
    accessKeyId: functions.config().aws.accesskeyid,
    secretAccessKey: functions.config().aws.secretaccesskey,
    region: functions.config().aws.region,
});
const S3_BUCKET =  'ayuda-avatars-prod'

exports.handler = async function(data, context, firestoreDb) {
    //console.log(JSON.stringify(context.rawRequest.headers, null, 2));

    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
 
    // Checking that the user is authenticated.
    if (!context.auth) {    
        // Throwing an HttpsError so that the client gets the error details.      
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +                                           
        'while authenticated.');      
    }

    const fileName = `avatars/${uid}/avatar.png`;

    const s3 = new AWS.S3();
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 500,
        ContentType: 'image/png',
        ACL: 'public-read',
    };
    
    try {
        const signedRequest  = await new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', s3Params, (err, url) => {
              if (err) reject(err)
              else resolve(url)
            })
        })
        return {
            signedRequest: signedRequest,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
        }        
    } catch (error) {
        console.error(error);
        throw new functions.https.HttpsError('internal', error.message);
    }

}
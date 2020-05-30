const functions = require('firebase-functions');
const axios = require('axios');
const createAuthRefreshInterceptor = require('axios-auth-refresh');
 

const refreshAuthLogic = failedRequest => axios.post('https://www.example.com/auth/token/refresh')
    .then(tokenRefreshResponse => {
        localStorage.setItem('token', tokenRefreshResponse.data.token);
        failedRequest.response.config.headers['Authorization'] = 'Bearer ' + tokenRefreshResponse.data.token;
        return Promise.resolve();
});
 

// Instantiate the interceptor (you can chain it as it returns the axios instance)
const getAxiosWithInterceptor = () => {
    return createAuthRefreshInterceptor(axios, refreshAuthLogic);
}


const getJwtToken = () => {
    return functions.config().zoom.jwttoken;
}


const dataFromZoomMap = async (host_id, meeting_id, firestoreDb) => {
    
    try {

        const [
            userSnap,
            jobSnap,
        ] = await Promise.all([
            firestoreDb.collection('/zoom_map')
                .doc(host_id)
                .get(),
            firestoreDb.collection('/zoom_map')
                .doc(host_id)
                .collection('meetings')
                .doc(meeting_id)
                .get(),
        ])

        // check for empty documents
        if (!userSnap.exists) {
            throw new Error(`No such user: ${host_id}`)
        }
        if (!jobSnap.exists) {
            throw new Error(`No such job: ${meeting_id}`)
        }
        return {
            userMap: userSnap.data(),
            jobMap: jobSnap.data(),
        }

    } catch (error) {
        throw error
    }

}


const removeZoomMap = async (zoomUserId, jobDoc, firestoreDb) => {
    try {
        await firestoreDb.collection('/zoom_map')
        .doc(zoomUserId)
        .collection('meetings')
        .doc(jobDoc.id)
        .delete();

        return true
        
    } catch (error) {
        throw error
    }
}


module.exports = {
    dataFromZoomMap,
    removeZoomMap,
    getAxiosWithInterceptor,
    getJwtToken,
}
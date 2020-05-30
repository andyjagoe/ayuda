const functions = require('firebase-functions');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const authRefresh = require('axios-auth-refresh');



const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      }
});

axiosInstance.interceptors.request.use(request => {
    request.headers['Authorization'] = `Bearer ${getJwtToken()}`;
    return request;
});

var jwtToken = ''

const refreshAuthLogic = (failedRequest) => {
    return new Promise((resolve, reject) => {
        const payload = {
            iss: functions.config().zoom.apikey,
            exp: ((new Date()).getTime() + 5000)
        };
        const token = jwt.sign(payload, functions.config().zoom.refreshtoken);
        resolve(token);
    })
    .then(tokenRefreshResponse =>  {
        //console.log("tokenRefreshResponse: " , tokenRefreshResponse)
        jwtToken = tokenRefreshResponse
        failedRequest.response.config.headers['Authorization'] = 'Bearer ' + tokenRefreshResponse;
        return Promise.resolve();
    })
}

authRefresh.default(axiosInstance, refreshAuthLogic);


const getAxiosWithInterceptor = () => {
    return axiosInstance;
}


const getJwtToken = () => {
    //return functions.config().zoom.jwttoken;
    return jwtToken;
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
    refreshAuthLogic,
}
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDRSI8T66SXMenjL9u0BJgHbKcfVUqjhzE",
    authDomain: "ayuda.live",
    databaseURL: "https://ayuda-9ea45.firebaseio.com",
    projectId: "ayuda-9ea45",
    storageBucket: "ayuda-9ea45.appspot.com",
    messagingSenderId: "197813704421",
    appId: "1:197813704421:web:bed6a8a8234079307da60c",
    measurementId: "G-BL2E385K85"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore(); 
export const provider = firebase.auth.GoogleAuthProvider.PROVIDER_ID;

export const signOut = () => {
    auth.signOut();
    //window.location.replace('/'); 
};

// Google OAuth Client ID, needed to support One-tap sign-up.
// Set to null if One-tap sign-up is not supported.
export const CLIENT_ID = '197813704421-a00f9qlrtc3q48amcebaod8h2ece4p6n.apps.googleusercontent.com';

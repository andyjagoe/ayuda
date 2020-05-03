import React from "react";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {auth} from '../firebase';
import {provider} from '../firebase';
import {CLIENT_ID} from '../firebase';

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'redirect',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: '/register',
    // We will display Google as auth providers.
    signInOptions: [
        {
            provider: provider,
            authMethod: 'https://accounts.google.com',
            // Required to enable ID token credentials for this provider.
            clientId: CLIENT_ID
        }
    ],
    // Terms of service url.
    'tosUrl': 'https://www.google.com',
    // Privacy policy url.
    'privacyPolicyUrl': 'https://www.google.com'
};


const SignIn = () => {
//const [error, setError] = useState(null);

  return (
    <React.Fragment>
       <StyledFirebaseAuth uiCallback={ui => ui.disableAutoSignIn()} uiConfig={uiConfig} firebaseAuth={auth}/>
    </React.Fragment>
  );
};
export default SignIn;
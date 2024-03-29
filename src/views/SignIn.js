import React   from "react";
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { navigate } from "@reach/router"; 
import { makeStyles } from '@material-ui/core/styles';
import PublicAppBar from 'components/PublicAppBar';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {auth} from '../firebase';
import {provider} from '../firebase';
import {CLIENT_ID} from '../firebase';
var firebaseui = require('firebaseui');


const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random?family)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  title: {
    margin: theme.spacing(0, 0, 5),
  },
  appBar: {
    //borderBottom: `1px solid ${theme.palette.divider}`,
    background: '#ffffff80',
    boxShadow: 'none'
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
      flexGrow: 1,
  },
  link: {
      margin: theme.spacing(1, 1.5),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


// Configure FirebaseUI.
const uiConfig = {
    callbacks: {
      //signInSuccessWithAuthResult: () => false      
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        navigate('/home');
        return false;
      }
    },
    // Popup signin flow rather than redirect flow.
    signInFlow: 'redirect',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    //signInSuccessUrl: '/home',
    // We will display Google as auth providers.
    signInOptions: [
        {
            provider: provider,
            authMethod: 'https://accounts.google.com',
            // Required to enable ID token credentials for this provider.
            clientId: CLIENT_ID,
            customParameters: {
              prompt: 'select_account'
            }
        }
    ],
    //credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
    credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
    // Terms of service url.
    'tosUrl': `${window.location.origin}/tos`,
    // Privacy policy url.
    'privacyPolicyUrl': `${window.location.origin}/privacy`
};


const SignIn = () => {
  const classes = useStyles();
  //const [error, setError] = useState(null);

  return (
    <React.Fragment>
        <PublicAppBar />
        <Grid container component="main" className={classes.root}>
        <CssBaseline />        
        <Grid item xs={false} sm={4} md={7} className={classes.image} />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>          

          <div className={classes.paper}>          
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" className={classes.title}>
              Sign In
            </Typography>
            {/*
            <Typography component="h1" variant="h5">
              Ayuda Live
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </form>
            */}
            <StyledFirebaseAuth uiCallback={ui => ui.disableAutoSignIn()} uiConfig={uiConfig} firebaseAuth={auth}/>
          </div>
        </Grid>
      </Grid>       
    </React.Fragment>
  );
};
export default SignIn;
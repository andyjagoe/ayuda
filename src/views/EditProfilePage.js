import React, { useEffect, useState, useRef, useContext } from "react";
import MenuAppBar from 'components/MenuAppBar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { navigate } from "@reach/router"
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import PersonIcon from '@material-ui/icons/Person';
import InputAdornment from '@material-ui/core/InputAdornment';
import clsx from 'clsx';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import { firestore } from "../firebase"


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  breadcrumb: {
    marginTop: theme.spacing(4),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    width: theme.spacing(15),
    height: theme.spacing(15),
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(3, 0, 2),
    position: 'relative',
    width: '100%',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  spacingFooter: {
    marginTop: theme.spacing(50),
  },
}));


const HEADLINE_CHAR_LIMIT = 60;
const HEADLINE_HELPER_TEXT = 'Your professional headline, like "English Teacher", "Music Instructor" or "Service Technician".'
const BIO_CHAR_LIMIT = 2048;
const BIO_HELPER_TEXT = 'Your biography should emphasize your experience and expertise.'


const EditProfilePage = () => {
  const classes = useStyles();
  const firstRender = useRef(true)

  const user = useContext(UserContext);
  const {uid, displayName} = user;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [headline, setHeadline] = useState("");
  const [headlineCounter, setHeadlineCounter] = useState(0);
  const [bio, setBio] = useState("");
  const [bioCounter, setBioCounter] = useState(0);
  const [shortId, setShortId] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  const [disable, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });


  // Formatting for user name
  const formatUserName = () => {
    if  (firstName !== '' && lastName !== '') {
      return `${firstName} ${lastName}`
    }
    return displayName
  }

  // Handle copying and snackbar messages
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(false);
  const [snackbarKey, setSnackbarKey] = useState(false);
  const handleSnackbarClick = (message, key) => {
    setSnackbarMessage(message);
    setSnackbarKey(key);
    setOpenSnackbar(true);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await firestore
        .collection("/users")
        .doc(uid)
        .get()

        if (!result.exists) {
          return
        }

        setFirstName(result.data().firstName || '')
        setLastName(result.data().lastName || '')
        setHeadline(result.data().headline || '')
        setHeadlineCounter(result.data().headline.length)
        setBio(result.data().bio || '')
        setBioCounter(result.data().bio.length)
        setShortId(result.data().shortId || '')
        setPhotoURL(result.data().photoURL || '')
      } catch (error) {
          console.error(error);
      }
    };

    if (firstRender.current) {
      firstRender.current = false
      fetchData();
      return
    }
    setDisabled(formValidation())
    
  }, [firstName, lastName, headline, bio])


const formValidation = () => {
  if (firstName === "" 
      || lastName === ""
      || headline === ""
      || bio === "") {
    return true
  }    
  return false
}


async function handleSubmit(event) {
  event.preventDefault();
  
  setDisabled(true)

  if (!loading) {
    setSuccess(false);
    setLoading(true);
  }

  try {
    await firestore.collection('/users').doc(uid).set({
      firstName: firstName,
      lastName: lastName,    
      headline: headline,
      bio: bio,
    }, { merge: true });
    setSuccess(true);  
    setLoading(false);
    handleSnackbarClick('Profile Saved','profile_saved');
    navigate(`/p/${shortId}`);
  } catch (error) {
    console.log(error.message);
    setSuccess(false);  
    setLoading(false);
  }

  setDisabled(false)
}

  return (
    <React.Fragment>
      <MenuAppBar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumb} >
          <Link color="inherit" onClick={() => { navigate('/home'); }}>
            Home
          </Link>
          <Link color="inherit" onClick={() => { navigate(`/p/${shortId}`); }}>
            {formatUserName()}
          </Link>          
          <Typography color="textPrimary">Edit Profile</Typography>
        </Breadcrumbs>

        <div className={classes.paper}>
            <Avatar className={classes.avatar} src={photoURL} />
            <Typography component="h1" variant="h5">
              Edit Profile
            </Typography>
            <form 
              className={classes.form} 
              noValidate
              onSubmit={handleSubmit}
              >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                    autoFocus
                    autoComplete="fname"
                    name="firstName"
                    variant="outlined"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="lname"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                />
                </Grid>
                <Grid item xs={12}>
                  <TextField                      
                      autoComplete="headline"
                      name="headline"
                      variant="outlined"
                      required
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                            ({headlineCounter}/{HEADLINE_CHAR_LIMIT})
                          </InputAdornment>
                      }}
                      inputProps={{
                        maxLength: HEADLINE_CHAR_LIMIT
                      }}                           
                        id="headline"
                      label="Headline"
                      value={headline}
                      helperText={HEADLINE_HELPER_TEXT}
                      onChange={e => {
                        setHeadline(e.target.value);
                        setHeadlineCounter(e.target.value.length)
                      }}
                  />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    autoComplete="bio"
                    name="bio"
                    variant="outlined"
                    required
                    fullWidth
                    multiline
                    InputProps={{
                      endAdornment: <InputAdornment position="end">
                          ({bioCounter}/{BIO_CHAR_LIMIT})
                        </InputAdornment>
                    }}
                  inputProps={{
                      maxLength: BIO_CHAR_LIMIT
                    }}                           
                    id="bio"
                    label="Biography"
                    value={bio}
                    helperText={BIO_HELPER_TEXT}
                    onChange={e => {
                      setBio(e.target.value);
                      setBioCounter(e.target.value.length);
                    }}
                />
                </Grid>
              </Grid>

              <div className={classes.root}>
                <div className={classes.wrapper}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    className={buttonClassname}
                    disabled={disable}
                  >
                    Save Profile
                  </Button>
                  {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </div>
              </div>

              </form>

            <Snackbar
              anchorOrigin= {{ vertical: 'top', horizontal: 'center' }}
              key={snackbarKey}
              autoHideDuration={6000}
              open={openSnackbar}
              onClose={handleSnackbarClose}
              message={snackbarMessage}
            />

          </div>
          <div className={classes.spacingFooter} />

      </Container>  
    </React.Fragment>
  ) 
};
export default EditProfilePage;
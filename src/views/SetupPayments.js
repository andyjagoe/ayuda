import React, { useContext, useState, useEffect, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import MenuAppBar from 'components/MenuAppBar';
import { navigate } from "@reach/router"
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import { ProfileContext } from "../providers/ProfileProvider";
import { firestore } from "../firebase"
const queryString = require('query-string');
var uuid4 = require('uuid4');


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
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    spacingFooter: {
      marginTop: theme.spacing(50),
    },  
  }));

 
export default function SetupPayments(props) {
  const classes = useStyles();
  const parsed = queryString.parse(props.location.search);

  const user = useContext(UserContext);
  const {email, uid} = user;
  const profile = useContext(ProfileContext);

  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState(null)
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState(null)
  const [service, setService] = React.useState("");
  const [serviceNameError, setServiceNameError] = useState(null)
  const [shortId, setShortId] = useState("");
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false)

  const firstRender = useRef(true)
  const [disable, setDisabled] = useState(true)
    
  useEffect(() => {
    if (profile != null && !hasLoadedProfile) {
      setFirstName(profile.firstName || '')
      setLastName(profile.lastName || '')
      setShortId(profile.shortId || '')
      setHasLoadedProfile(true)      
    }

    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setDisabled(formValidation())
    
  }, [firstName, lastName, service, profile])


  const handleSelectChange = (event) => {
    setService(event.target.value);
  };

  // here we run any validation, returning true/false
  const formValidation = () => {
    if (firstName === "") {
      setFirstNameError('First name is required')
    } else {
      setFirstNameError (null)
    }
    if (lastName === "") {
      setLastNameError('First name is required')
    } else {
      setLastNameError (null)
    }
    if (service === "") {
      setServiceNameError('Service name is required')
    } else {
      setServiceNameError (null)
    }

    if (firstName === "" 
        || lastName === "" 
        || service === "") {
      return true
    } else {
      return false
    }

  }


  const getStripeConnectUrl = () => {
    const stripeConnectUrl = new URL("https://connect.stripe.com/express/oauth/authorize");
    stripeConnectUrl.searchParams.set("client_id", "ca_H6rAXET2pmOzBHnNrhEnwYPfPLEiZohY");
    stripeConnectUrl.searchParams.set("stripe_user[email]", email);
    stripeConnectUrl.searchParams.set("stripe_user[url]", `${props.location.origin}/p/${shortId}`);
    stripeConnectUrl.searchParams.set("stripe_user[business_type]", "individual");
    stripeConnectUrl.searchParams.set("stripe_user[country]", "US");

    if (!parsed.r) {
      stripeConnectUrl.searchParams.set("redirect_uri", `${props.location.origin}/connect-stripe`);
      return stripeConnectUrl
    }

    try  {
      const referer = parsed.r
      if (referer === 'getstarted') {
        stripeConnectUrl.searchParams.set("redirect_uri", `${props.location.origin}/connect-stripe?r=getstarted`);
      } else {
        stripeConnectUrl.searchParams.set("redirect_uri", `${props.location.origin}/connect-stripe`);
      }
    } catch (error) {
      console.log("Error setting referer");
    }

    return stripeConnectUrl
  }

  
  async function handleSubmit(event) {
    event.preventDefault();

    const state = uuid4();

    try {
      await firestore.collection('/users').doc(uid).set({
        firstName: firstName,
        lastName: lastName,    
        service: service,
        state: state,
    }, { merge: true });
    } catch (error) {
      console.log(error.message);
    }
    const stripeConnectUrl = getStripeConnectUrl()
    stripeConnectUrl.searchParams.set("stripe_user[first_name]", firstName);
    stripeConnectUrl.searchParams.set("stripe_user[last_name]", lastName);
    stripeConnectUrl.searchParams.set("state", state);
    //console.log(stripeConnectUrl.href);
    navigate(stripeConnectUrl.href);
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
          <Typography color="textPrimary">Setup Payments</Typography>
        </Breadcrumbs>
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Enable Payments
            </Typography>
            <form 
              className={classes.form} 
              noValidate
              onSubmit={handleSubmit}
              >
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                <TextField
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
                  <FormControl 
                    variant="outlined" 
                    required
                    fullWidth
                    className={classes.formControl}
                    >
                    <InputLabel htmlFor="service">What service do you want to offer?</InputLabel>
                      <Select
                        native
                        id="service"
                        value={service}
                        onChange={handleSelectChange}
                        label="What service do you plan to offer?"
                        >
                        <option aria-label="None" value="" />
                        <option value={'coaching'}>Online Coaching</option>
                        <option value={'lessons'}>Online Lessons</option>
                        <option value={'tutoring'}>Online Tutoring</option>
                        <option value={'babysitting'}>Online Babysitting</option>
                        <option value={'service'}>Online Service Call</option>
                        <option value={'other'}>Other</option>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      We use Stripe to make sure you get paid on time and to keep your personal bank and details secure. Click Save and continue to set up your payments on Stripe.
                    </Typography>
                  </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={disable}
                className={classes.submit}
            >
                Save and Continue
            </Button>
            </form>
        </div>
        <div className={classes.spacingFooter} />
        </Container>
    </React.Fragment>

  );
}

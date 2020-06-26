import React, { useContext, useEffect, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles';
import MenuAppBar from 'components/MenuAppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { navigate } from "@reach/router";
import { UserContext } from "../providers/UserProvider";
import { ProfileContext } from "../providers/ProfileProvider";
import Jobs from 'components/Jobs';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import firebase from 'firebase/app';
import 'firebase/functions';



const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(6),
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  balances: {
    width: '100%',
    padding: theme.spacing(2),
  },
  welcome: {
    marginTop: theme.spacing(8),
  },
  jobs: {
    marginTop: theme.spacing(6),
  },
  jobheader: {
    padding: theme.spacing(1),
  },
  spacingFooter: {
    marginTop: theme.spacing(50),
  },
}));



const SignedInHomePage = () => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const {displayName} = user;
  const profile = useContext(ProfileContext);

  const [totalBalance, setTotalBalance] = React.useState('');
  const [totalPayouts, setPayouts] = React.useState('');
  const firstRender = useRef(true)


  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      getAccountBalance()
    }
  }, [])

  const getAccountBalance = async () => {
    var accountBalance = firebase.functions().httpsCallable('accountBalance');
    try {
      const balance = await accountBalance();
      setTotalBalance((balance.data.balance/100).toFixed(2))
      setPayouts((balance.data.payouts/100).toFixed(2))
    } catch (error) {
      console.log(error.message);
      setTotalBalance('0.00')
      setPayouts('0.00')
    }
  };

  const goToAccount = async () => {
    var stripeLoginLink = firebase.functions().httpsCallable('stripeLoginLink');
    await stripeLoginLink()
    .then(function(result) {
        window.open(result.data.url, '_blank');
      })
    .catch(function(error) {
        console.log(error);
        navigate('/setup-payments');
    });
  };

  const formatUserName = () => {
    if (profile != null) {
      if  (profile.hasOwnProperty('firstName')) {
        return `, ${profile.firstName}`
      }
      return `, ${displayName}`     
    }

    return '';
  }

  const hasPayments = () => {
    if (profile != null) {
      if  (profile.hasOwnProperty('paymentsEnabled') && profile.paymentsEnabled === true) {
        return true
      }
      return false
    }

    return false;
  }

  const getstartedNavigation = () => {
    if(hasPayments()) {
      navigate('/getstarted?step=3')
      return
    }
    if(profile != null
      && profile.hasOwnProperty('firstName') && profile.firstName !== ''
      && profile.hasOwnProperty('lastName') && profile.lastName !== ''
      && profile.hasOwnProperty('headline') && profile.headilne !== ''
      && profile.hasOwnProperty('bio') && profile.bio !== ''
      ) {
        navigate('/getstarted?step=2')
        return
    }
    navigate('/getstarted')
  }

 
  return (
    <React.Fragment>
    <MenuAppBar />
    <Container component="main" maxWidth="xs">      
      <div className={classes.paper}>
      <Paper className={classes.balances}  variant='elevation' elevation={1}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2">
              Your Balance
            </Typography>              
            <Typography component="h1" variant="h3">
              ${totalBalance} 
            </Typography>
            <Link variant="body2" onClick={() => { goToAccount(); }}>
              Recent payouts: ${totalPayouts} 
            </Link>
          </Grid>
        </Grid>
      </Paper>

        <Typography component="h1" variant="h4" className={classes.welcome}>
          Welcome{formatUserName()}!
        </Typography>
        
        <Typography variant="subtitle1">
        { hasPayments() ? 
          'Add jobs to your schedule to get started.'
          :
          ''
        }
        </Typography>

        <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => { hasPayments() ? 
                    navigate('/getjob') : getstartedNavigation() }}
                className={classes.submit}
              >
                {hasPayments()? 'Get Jobs' : 'Get Started Now'}
              </Button>
            </Grid>
        </Grid>

        <Grid container direction="row" className={classes.jobs}>
          <Grid item xs={6}>
            <Grid container justify = "flex-start">
              <Typography variant="h6">
                Your Schedule
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container justify = "flex-end">
              <Button
                onClick={() => { navigate('/addjob'); }}
                ><AddIcon />      
              </Button>   
            </Grid>
          </Grid>
        </Grid>
        
        <Grid container spacing={0} direction="column">          
          <Grid item xs={12}>
            <Jobs />
          </Grid>
        </Grid>

      </div>
      <div className={classes.spacingFooter} />
    </Container>
    </React.Fragment>    
  ) 
};
export default SignedInHomePage;
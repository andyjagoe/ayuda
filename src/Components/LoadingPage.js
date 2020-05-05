import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import { navigate } from "@reach/router";
import { makeStyles } from '@material-ui/core/styles';
import firebase from 'firebase/app';
import 'firebase/functions';
 

const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(8),
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
  }));


function checkRegistration() {
    var isRegistered = firebase.functions().httpsCallable('isRegistered');
    return isRegistered()
    .then(function(result) {
      if (result.data) {
        navigate('/');
        return false;
      } else {
        navigate('/register');
        return false;
      }         
    })
    .catch(function(error) {
        console.log(error.message);
        return true;
    });
}

export default function LoadingPage() {
  const classes = useStyles();

  useEffect(() => { 
    checkRegistration()
  });

  
  return (
    <React.Fragment>
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <CircularProgress />
            <CircularProgress color="secondary" />
        </div>
        </Container>
    </React.Fragment>
  );
}

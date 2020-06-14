import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import OnboardingAppBar from 'components/OnboardingAppBar';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
const queryString = require('query-string');
 

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


export default function Error(props) {
    const classes = useStyles();
    const parsed = queryString.parse(props.location.search);
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => { 
        loadErrorMessage(props.location.state.error)
    }, []);

    function loadErrorMessage(err) {
        if (!err) {   
            console.log('No error message available') 
            return
        }
        setErrorMessage(err.message)
        console.log(err)
    }
  
  return (
    <React.Fragment>
        <OnboardingAppBar />      
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
                <PriorityHighIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                An error occurred
            </Typography>
            <Typography variant="subtitle1">
                {errorMessage}
            </Typography>
            <Grid container spacing={2} style={{ padding: 40}}>
                <Grid item xs={12}>
                </Grid>
            </Grid>            
        </div>
        </Container>
    </React.Fragment>
  );
}

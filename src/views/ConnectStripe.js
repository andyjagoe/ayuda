import React, { useContext, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import MenuAppBar from 'components/MenuAppBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import { navigate } from "@reach/router";
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import firebase from 'firebase/app';
import 'firebase/functions';
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


export default function ConnectStripe(props) {
    const classes = useStyles();
    const user = useContext(UserContext);

    const [isLoading, setIsLoading] = React.useState(true);
    const [didTryrequest, setDidTryrequest] = React.useState(false);
    const [resultMessage, setResultMessage] = React.useState('Verifying Stripe account');
    const [resultSeverity, setResultSeverity] = React.useState('info');

    const parsed = queryString.parse(props.location.search);

    async function handleSubmit() {
        if (!didTryrequest) {
            setDidTryrequest(true)
            var connectStripe = firebase.functions().httpsCallable('connectStripe');
            await connectStripe({code: parsed.code, state: parsed.state}).then(function(result) {
                console.log(result.data);
                setResultMessage('Stripe connected successfully')
                setResultSeverity('success')
                setIsLoading(false)
                navigate('/home');
            }).catch(function(error) {
                console.log(error.message);
                setResultMessage(error.message)
                setResultSeverity('error')
                setIsLoading(false)
                //TODO: Handle user navigation for error state
            });
        }            
    }

    useEffect(() => { 
        if ('code' in parsed && 'state' in parsed) {
            handleSubmit()
        }  else {
            setResultMessage('Invalid request')
            setResultSeverity('error')
        }    
    }, [parsed]);
    
  
  return (
    <React.Fragment>
        <MenuAppBar />      
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            {isLoading ?
                <React.Fragment>
                    <CircularProgress />
                    <CircularProgress color="secondary" />
                </React.Fragment>
            :
                <React.Fragment>
                    <CircularProgress variant="determinate" value={100} />
                    <CircularProgress variant="determinate" value={100} color="secondary" />
                </React.Fragment>                            
            }
            <Grid container spacing={2} style={{ padding: 40}}>
                <Grid item xs={12}>
                    <Alert severity={resultSeverity}>
                        {resultMessage}
                    </Alert>  
                </Grid>
            </Grid>            
        </div>
        </Container>
    </React.Fragment>
  );
}

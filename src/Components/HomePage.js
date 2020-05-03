import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import MenuAppBar from './MenuAppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { navigate } from "@reach/router";
import { UserContext } from "../providers/UserProvider";
import Jobs from './Jobs';


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
  account: {
    marginBottom: theme.spacing(6),
  },
  jobs: {
    marginTop: theme.spacing(6),
  },
  jobheader: {
    padding: theme.spacing(1),
  },
}));


const HomePage = () => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const {displayName, isRegistered} = user;

  if (!isRegistered) {
    //redirect user to registration if not yet registered
    navigate('/register')
  }
  
  return (
    <React.Fragment>
    <MenuAppBar />
    <Container component="main" maxWidth="xs">      
      <div className={classes.paper}>
        <Grid container spacing={2} className={classes.account}>
          <Grid item xs={12}>
            <Typography variant="body2">
              Your Balance
            </Typography>              
            <Typography component="h1" variant="h3">
              $0.00
            </Typography>
          </Grid>
        </Grid>

        <Typography component="h1" variant="h4">
          Welcome, {displayName}!
        </Typography>
        
        <Typography variant="subtitle1">
          Add jobs to your schedule to get started.
        </Typography>

        <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => { navigate('/getjob'); }}
                className={classes.submit}
              >
                Get Jobs
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
    </Container>
    </React.Fragment>    
  ) 
};
export default HomePage;
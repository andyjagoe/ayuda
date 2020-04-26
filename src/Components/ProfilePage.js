import React, { useContext } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { UserContext } from "../providers/UserProvider";
import {signOut} from '../firebase';


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
  }
}));


const ProfilePage = () => {
  const classes = useStyles();
  const user = useContext(UserContext);
  const {photoURL, displayName, email} = user;
  
  return (
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
                onClick = {() => {signOut()}}
                className={classes.submit}
              >
                Get Jobs
              </Button>
            </Grid>
        </Grid>

        <Grid container direction="row" className={classes.jobs}>
          <Grid item xs={6} fullwidth>
            <Grid container justify = "flex-start">
              <Typography variant="h6">
                Upcoming Jobs
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={6} fullwidth>
            <Grid container justify = "flex-end">
              <Button
                ><AddIcon />      
              </Button>   
            </Grid>
          </Grid>
        </Grid>
        
        <Grid container spacing={0} direction="column">          
          <Grid item xs={12} fullwidth>
            <Card variant="outlined">
              <CardHeader
                className={classes.jobheader}
                avatar={
                  <Avatar className={classes.avatar} src={photoURL || 'https://res.cloudinary.com/dqcsk8rsc/image/upload/v1577268053/avatar-1-bitmoji_upgwhc.png'}/>
                }
                title="John Smith"
                subheader="May 14, 2:00PM"
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
              >
              </CardHeader>
            </Card>
            <Card>
              <CardHeader
                className={classes.jobheader}
                avatar={
                  <Avatar className={classes.avatar} src={photoURL || 'https://res.cloudinary.com/dqcsk8rsc/image/upload/v1577268053/avatar-1-bitmoji_upgwhc.png'}/>
                }
                title="John Smith"
                subheader="May 15, 11:00AM"
                action={
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                }
              >
              </CardHeader>
            </Card>
          </Grid>
        </Grid>

      </div>
    </Container>    
  ) 
};
export default ProfilePage;
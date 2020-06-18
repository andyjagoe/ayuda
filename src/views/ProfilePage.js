import React, { useEffect, useState, useRef, useContext } from "react";
import PublicAppBar from 'components/PublicAppBar';
import MenuAppBar from 'components/MenuAppBar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { navigate } from "@reach/router"
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import firebase from 'firebase/app';
import 'firebase/functions';


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
  spacingFooter: {
    marginTop: theme.spacing(50),
  },
}));


const ProfilePage = (props) => {
  const classes = useStyles();
  const firstRender = useRef(true)
  const user = useContext(UserContext);

  const emptyRecord = {
    firstName: '',
    lastName: '',
    headline: '',
    bio: '',
    photoURL: '',
  }
  const [userRecord, setUserRecord] = useState(emptyRecord)

  useEffect(() => {
        const fetchData = async () => {
            try {
                var publicProfile = firebase.functions().httpsCallable('publicProfile');
                const result = await publicProfile({shortId: props.shortId})
                const profile = {
                    firstName: result.data.firstName || '',
                    lastName: result.data.lastName || '',
                    headline: result.data.headline || '',
                    bio: result.data.bio || '',
                    photoURL: result.data.photoURL || '',
                }
                setUserRecord(profile);
            } catch (error) {
                console.error(error);
            }
        };


        if (firstRender.current) {
            firstRender.current = false
            fetchData(); 
            return
          }
      
    }, [])

  return (
    <React.Fragment>
      {user ? <MenuAppBar /> : <PublicAppBar />}      
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumb} >
          <Link color="inherit" onClick={() => { user? navigate('/home') : navigate('/') }}>
            Home
          </Link>
          <Typography color="textPrimary">
            {userRecord.firstName} {userRecord.lastName}
          </Typography>
        </Breadcrumbs>

        <div className={classes.paper}> 
          <Avatar className={classes.avatar} src={userRecord.photoURL} />          
          <Typography component="h1" variant="h4">
            {userRecord.firstName} {userRecord.lastName} 
          </Typography>
          <Typography variant="subtitle1">
            {userRecord.headline}  
          </Typography>
          <Typography variant="body2" color="textSecondary">
            0 completed jobs | 0 reviews | joined March 2020
          </Typography>
          <Button
              fullWidth
              variant="outlined"
              color="primary"
              className={classes.submit}
          >
              Share
          </Button>
          {user ?
            <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={() => { navigate('/profile') }}
            >
                Edit Profile
            </Button>
            :
            <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
            >
                Ask me a question
            </Button>
          }
          <Typography variant="body1">
            {userRecord.bio}  
          </Typography>
        </div>


        <div className={classes.spacingFooter} />
      </Container>  
    </React.Fragment>
  ) 
};
export default ProfilePage;
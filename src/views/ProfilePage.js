import React, { useEffect, useState, useRef } from "react";
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
import clsx from 'clsx';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';


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


const ProfilePage = () => {
  const classes = useStyles();
  const firstRender = useRef(true)

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  const [disable, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });


  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
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

  setTimeout(() => {
    setSuccess(true);  
    setLoading(false);
  }, 3000);

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
          <Typography color="textPrimary">Profile</Typography>
        </Breadcrumbs>

        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
            <PersonIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Profile
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
                  <TextField
                      autoFocus
                      autoComplete="headline"
                      name="headline"
                      variant="outlined"
                      required
                      fullWidth
                      id="headline"
                      label="Headline"
                      value={headline}
                      helperText='Your professional headline, like "English Teacher", "Music Instructor" or "Service Technician".'
                      onChange={e => setHeadline(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    autoComplete="bio"
                    name="bio"
                    variant="outlined"
                    fullWidth
                    multiline
                    inputProps={{
                      maxLength: 2048
                    }}                           
                    id="bio"
                    label="Biography"
                    value={bio}
                    helperText='Your biography should emphasize your experience and expertise.'
                    onChange={e => setBio(e.target.value)}
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
          </div>
          <div className={classes.spacingFooter} />

      </Container>  
    </React.Fragment>
  ) 
};
export default ProfilePage;
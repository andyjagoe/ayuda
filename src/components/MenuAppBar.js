import React, { useContext, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Snackbar from '@material-ui/core/Snackbar';
import { ProfileContext } from "../providers/ProfileProvider";
import { navigate } from "@reach/router";
import {signOut} from '../firebase';
import firebase from 'firebase/app';
import 'firebase/functions';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function MenuAppBar() {
  const classes = useStyles();
  const profile = useContext(ProfileContext);

  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);


  const handleChange = (event) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const goToAccount = async () => {
    handleClose();
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


  const goToProfile  = async () => {
    handleClose();
    profile ? 
    navigate(`/p/${profile.shortId}`,{ state: { shortId: profile.shortId} }) 
    : 
    handleSnackbarClick('Profile loading, please try again','profile_unavailable');
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
  

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {/*
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          */}
            <Typography 
              variant="h6" 
              className={classes.title}
              onClick={() => {
                navigate('/home')
              }}
            >
              Ayuda
            </Typography>
          {auth && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem 
                  onClick={() => { handleClose();navigate('/home'); }}
                >Home</MenuItem>
                <MenuItem 
                  onClick={() => { goToProfile(); }}
                >Profile</MenuItem>
                <MenuItem 
                  onClick={() => { goToAccount(); }}
                >Account</MenuItem>
                <MenuItem onClick={() => { signOut(); }}>Sign out</MenuItem>                
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>

      <Snackbar
        anchorOrigin= {{ vertical: 'top', horizontal: 'center' }}
        key={snackbarKey}
        autoHideDuration={6000}
        open={openSnackbar}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

    </div>
  );
}

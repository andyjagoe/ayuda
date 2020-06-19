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
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import { SvgIcon } from '@material-ui/core';
import copy from 'copy-to-clipboard';
import Snackbar from '@material-ui/core/Snackbar';
import { navigate } from "@reach/router"
import { makeStyles } from '@material-ui/core/styles';
import { UserContext } from "../providers/UserProvider";
import { ProfileContext } from "../providers/ProfileProvider";
import {isMobile} from 'react-device-detect';
import firebase from 'firebase/app';
import 'firebase/functions';
import {
  EmailShareButton,
  FacebookShareButton,
  FacebookMessengerShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  EmailIcon,
  FacebookIcon,
  FacebookMessengerIcon,
  LinkedinIcon,
  TwitterIcon,
} from "react-share";


function CopyIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </SvgIcon>
  );
}


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
  primarybutton: {
    margin: theme.spacing(2, 0, 0),
  },
  secondarybutton: {
    margin: theme.spacing(3, 0, 0),
  },
  bio: {
    margin: theme.spacing(3, 0, 3),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    width: theme.spacing(15),
    height: theme.spacing(15),
  },
  shareavatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  sharedialogtext: {
    margin: theme.spacing(0, 0, 1),
  },
  copydialogtext: {
    margin: theme.spacing(1, 0, 0),
  },
  spacingFooter: {
    marginTop: theme.spacing(50),
  },
}));


const ProfilePage = (props) => {
  const classes = useStyles();
  const firstRender = useRef(true)
  const user = useContext(UserContext);
  const profile = useContext(ProfileContext);

  const emptyRecord = {
    displayName: '',
    firstName: '',
    lastName: '',
    headline: '',
    bio: '',
    photoURL: '',
    memberSince: '',
  }
  const [profileRecord, setProfileRecord] = useState(emptyRecord)
  const [profileShortId, setProfileShortId] = useState('')
  const [userShortId, setUserShortId] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [email, setEmail] = useState('')

  
  useEffect(() => {
    let isCancelled = false
    const fetchData = async () => {
        try {
            var publicProfile = firebase.functions().httpsCallable('publicProfile');
            const result = await publicProfile({shortId: props.shortId})
            const profile = {
                displayName: result.data.displayName || '',
                firstName: result.data.firstName || '',
                lastName: result.data.lastName || '',
                headline: result.data.headline || '',
                bio: result.data.bio || '',
                photoURL: result.data.photoURL || '',
            }
            if (isCancelled === false) {
              setProfileRecord(profile);
              setProfileShortId(props.shortId)
              setMemberSince(`joined ${result.data.memberSince}` || '')
            }
        } catch (error) {
            console.error(error);
        }
    };


    if (firstRender.current) {
        firstRender.current = false
        fetchData(); 
    }
    if (props.shortId !== profileShortId && isCancelled === false) {
      fetchData();
    }
    if (user !=  null) {
      setEmail(user.email)
    }
    if (profile != null && isCancelled === false) {
      setUserShortId(profile.shortId)
    }
      
    return () => {
      isCancelled = true;
    };

  }, [profile, props.shortId])

    
  const isUsersProfile = () => {
    if (props.shortId === userShortId) {
      return true;      
    }
    return false;
  }

  // Formatting for user name
  const formatUserName = () => {
    if (profileRecord != null) {
      if  (profileRecord.firstName !== '' && profileRecord.lastName !== '') {
        return `${profileRecord.firstName} ${profileRecord.lastName}`
      } else {
        return profileRecord.displayName
      }        
    }
    
    return '';
  }

  // Handle sharing
  const share = () => {

    if (navigator.share && isMobile) {
      navigator.share({
        title: shareTitle(),
        text: shareText(),
        url: shareUrl(),
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      handleOpenDialog();
    }
  }

  const shareUrl = () => {
    let url = document.location.href;
    const canonicalElement = document.querySelector('link[rel=canonical]');
    if (canonicalElement !== null) {
        url = canonicalElement.href;
    }
    return url
  }

  const shareTitle = () =>  {
    return `${formatUserName()} - ${profileRecord.headline}`
  }
  
  const shareText = () =>  {
    return `${formatUserName()}: ${profileRecord.headline}\n\n${profileRecord.bio}`
  }


  // Handle Dialog
  const [openDialog, toggleOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    toggleOpenDialog(true);
  };
  const handleCloseDialog = () => {
    toggleOpenDialog(false);
  };


    // Handle copying and snackbar messages
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState(false);
    const [snackbarKey, setSnackbarKey] = useState(false);
    const handleSnackbarClick = (text, message, key) => {
      copy(text);
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
    <React.Fragment>
      {user ? <MenuAppBar /> : <PublicAppBar />}      
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumb} >
          <Link color="inherit" onClick={() => { user? navigate('/home') : navigate('/') }}>
            Home
          </Link>
          <Typography color="textPrimary">
            {formatUserName()}{isUsersProfile() ? ` (${email})` : ''}
          </Typography>
        </Breadcrumbs>

        <div className={classes.paper}> 
          <Avatar className={classes.avatar} src={profileRecord.photoURL} />
          <Typography component="h1" variant="h4">
            {profileRecord.firstName} {profileRecord.lastName}
          </Typography>
          <Typography variant="subtitle1">
            {profileRecord.headline}  
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {/* 0 completed jobs | 0 reviews | */}{memberSince}
          </Typography>
          <Button
              fullWidth
              variant="outlined"
              color="primary"
              className={classes.secondarybutton}
              onClick={() => { share() }}
          >
              Share
          </Button>
          {isUsersProfile() ?
            <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.primarybutton}
                onClick={() => { navigate('/profile') }}
            >
                Edit Profile
            </Button>
            :
            <div />
          }
          <Typography variant="body1" className={classes.bio}>
            {profileRecord.bio}  
          </Typography>
        </div>

        <Dialog open={openDialog} 
            onClose={handleCloseDialog} 
            aria-labelledby="form-dialog"
            maxWidth="sm"
          >
            <DialogTitle 
              id="form-dialog" 
              onClose={handleCloseDialog}
            >              
              Profile for {formatUserName()}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" className={classes.sharedialogtext}>                  
                  Share with one of these options
                </Typography>            
                <EmailShareButton url={shareUrl()} subject={shareTitle()} body={shareText()}>
                  <EmailIcon size={64} round />
                </EmailShareButton>
                <FacebookShareButton url={shareUrl()} quote={shareTitle()}>
                  <FacebookIcon size={64} round />
                </FacebookShareButton>
                <FacebookMessengerShareButton url={shareUrl()} appId={293795268691794}>
                  <FacebookMessengerIcon size={64} round />
                </FacebookMessengerShareButton>
                <LinkedinShareButton url={shareUrl()}>
                  <LinkedinIcon size={64} round />
                </LinkedinShareButton>
                <TwitterShareButton url={shareUrl()} title={shareTitle()}>
                  <TwitterIcon size={64} round />
                </TwitterShareButton>
                <Typography variant="body1" className={classes.copydialogtext}>
                  Or, share link
                </Typography>
                <TextField
                  margin="dense"
                  id="link"
                  fullWidth
                  variant="outlined"
                  value={shareUrl()}
                  disabled
                  type="text"
                  InputProps={{endAdornment:
                    <InputAdornment>
                      <IconButton
                        onClick={() => { handleSnackbarClick(
                          shareUrl(),
                          'Share link copied',
                          'share'); }}
                      >
                        <CopyIcon />                                                  
                      </IconButton>
                    </InputAdornment>
                  }}
                />          
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Done
              </Button>
            </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin= {{ vertical: 'top', horizontal: 'center' }}
          key={snackbarKey}
          autoHideDuration={3000}
          open={openSnackbar}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        />

        <div className={classes.spacingFooter} />
      </Container>  
    </React.Fragment>
  ) 
};
export default ProfilePage;
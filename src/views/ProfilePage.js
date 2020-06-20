import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import PublicAppBar from 'components/PublicAppBar';
import MenuAppBar from 'components/MenuAppBar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Avatar from '@material-ui/core/Avatar';
import AvatarEditor from 'react-avatar-editor'
import Dropzone from 'react-dropzone';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import DialogTitle from '@material-ui/core/DialogTitle';
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';
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


const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});


const MyDialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});


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
  const [avatarImage, setAvatarImage] = useState('')
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
              setAvatarImage(profile.photoURL)
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




  // Handle Avatar
  const setEditorRef = useRef()
  const [scale, setScale] = useState(1.2)

  const handleScale = (event, newValue) => {
    setScale(parseFloat(newValue))
  }

  const handleSave = () => {
    handleCloseAvatarDialog()
    if (setEditorRef){
      const canvasScaled = setEditorRef.current.getImageScaledToCanvas()
      console.log("got cropped image")
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const binaryStr = reader.result
      }
      //reader.readAsArrayBuffer(file)
      setAvatarImage(file)
    })    
  }, [])

  const onFilesRejected = useCallback((fileRejections) => {
    if (fileRejections.length > 1)  {
      setAlertMessage(`Only one file may be added`)
      setShowAlert(true)       
    } else if (fileRejections[0].errors[0].code === 'file-invalid-type') {
      setAlertMessage('Only JPEG and PNG files supported')
      setShowAlert(true)  
    } else if(fileRejections[0].file.size > avatarMaxSize) {
      const sizeInMB = (avatarMaxSize / (1024*1024)).toFixed(2);
      setAlertMessage(`Maximum file size is ${sizeInMB} MB`)
      setShowAlert(true)   
    }
  }, [])

  const avatarMaxSize = 5242880;
  const [alertMessage, setAlertMessage] = useState('Error');
  const [showAlert, setShowAlert] = useState(false);

  const [openAvatarDialog, toggleOpenAvatarDialog] = useState(false);
  const handleOpenAvatarDialog = () => {
    setAvatarImage(profile.photoURL)
    setShowAlert(false)
    toggleOpenAvatarDialog(true);
  };

  const handleCloseAvatarDialog = () => {
    toggleOpenAvatarDialog(false);
  };
  

  // Handle Share Dialog
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
          <Avatar 
            className={classes.avatar} 
            src={profileRecord.photoURL} 
            onClick={() => {if(isUsersProfile()) handleOpenAvatarDialog() }}
          />

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

        <Dialog open={openAvatarDialog} 
            onClose={handleCloseAvatarDialog} 
            aria-labelledby="form-dialog-avatar"
            maxWidth="sm"
          >
            <MyDialogTitle 
              id="form-dialog-avatar" 
              onClose={handleCloseAvatarDialog}
            >              
              Edit photo
            </MyDialogTitle>
            
            <DialogContent>
              <Collapse in={showAlert}>
                <Alert severity="error">
                  {alertMessage}
                </Alert>
              </Collapse>

              <Dropzone 
                name='zone1'
                noClick 
                onDrop={onDrop}
                onDropRejected={onFilesRejected}
                accept='image/jpeg, image/png'
                minSize={0}
                maxSize={avatarMaxSize}
                multiple={false}
              >
                {({getRootProps, getInputProps, isDragActive, isDragReject}) => {
                  if (isDragActive && !isDragReject) setShowAlert(false);
                  return  (
                    <section>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <AvatarEditor
                        ref={setEditorRef}
                        image={avatarImage}
                        width={250}
                        height={250}
                        border={50}
                        borderRadius={125}
                        color={[255, 255, 255, 0.6]} // RGBA
                        scale={scale}
                        rotate={0}
                      />                  
                    </div>
                  </section>
                  )
                }}
              </Dropzone>      
              <Slider
                name="scale"
                defaultValue={1.2}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={0.1}
                min={1}
                max={2}
                onChange={handleScale}                
              />
            </DialogContent>
            <DialogActions>
              <Dropzone 
                name='zone2'
                noDrag
                onDrop={onDrop}
                onDropRejected={onFilesRejected}
                accept='image/jpeg, image/png'
                minSize={0}
                maxSize={avatarMaxSize}
                multiple={false}
              >
                {({getRootProps, getInputProps, isDragActive, isDragReject}) => {
                  if (isDragActive && !isDragReject) setShowAlert(false);
                  return (
                    <section>
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <Button color="primary">
                          Change Photo
                        </Button>
                      </div>
                    </section>
                  )
                }}
              </Dropzone>
              <Button onClick={handleSave} color="primary">
                Save
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
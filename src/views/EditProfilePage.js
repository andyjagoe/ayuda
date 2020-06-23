import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import MenuAppBar from 'components/MenuAppBar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { navigate } from "@reach/router"
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import AvatarEditor from 'react-avatar-editor'
import Dropzone from 'react-dropzone';
import Slider from '@material-ui/core/Slider';
import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { ProfileContext } from "../providers/ProfileProvider";
import { UserContext } from "../providers/UserProvider";
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import { firestore } from "../firebase"
import firebase from 'firebase/app';
import 'firebase/functions';
import axios from 'axios';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
const queryString = require('query-string');


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
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: 'transparent',
    width: theme.spacing(15),
    height: theme.spacing(15),
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
  buttonSuccessAvatar: {
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


const HEADLINE_CHAR_LIMIT = 60;
const HEADLINE_HELPER_TEXT = 'Your professional headline, like "English Teacher", "Music Instructor" or "Service Technician".'
const BIO_CHAR_LIMIT = 2048;
const BIO_HELPER_TEXT = 'Your biography should emphasize your experience and expertise. It must be at least 60 characters.'


const EditProfilePage = (props) => {
  const classes = useStyles();
  const firstRender = useRef(true)
  const parsed = queryString.parse(props.location.search);

  const user = useContext(UserContext);
  const {uid, displayName} = user;
  const profile = useContext(ProfileContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [headline, setHeadline] = useState("");
  const [headlineCounter, setHeadlineCounter] = useState(0);
  const [bio, setBio] = useState("");
  const [bioCounter, setBioCounter] = useState(0);
  const [shortId, setShortId] = useState("");
  //const [photoURL, setPhotoURL] = useState("");
  const [avatarImage, setAvatarImage] = useState('')
  const [avatarEditorImage, setAvatarEditorImage] = useState('')  
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false)

  const [disable, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });


  // Formatting for user name
  const formatUserName = () => {
    if  (firstName !== '' && lastName !== '') {
      return `${firstName} ${lastName}`
    }
    return displayName
  }

  useEffect(() => {
    let isCancelled = false

    if (profile != null && isCancelled === false && !hasLoadedProfile) {
      setFirstName(profile.firstName || '')
      setLastName(profile.lastName || '')
      setHeadline(profile.headline || '')
      if ('headline' in profile) setHeadlineCounter(profile.headline.length)
      setBio(profile.bio || '')
      if ('bio' in profile) setBioCounter(profile.bio.length)
      setShortId(profile.shortId || '')
      getAvatarImage(profile.photoURL || '')
      setHasLoadedProfile(true)
    }

    if (firstRender.current) {
      firstRender.current = false  
      return
    }
    setDisabled(formValidation())

    return () => {
      isCancelled = true;
    };

  }, [firstName, lastName, headline, bio, profile])


  const formValidation = () => {
    if (firstName === "" 
        || lastName === ""
        || headline === ""
        || bio === ""
        || bio.length < 60) {
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

    try {
      await firestore.collection('/users').doc(uid).set({
        firstName: firstName,
        lastName: lastName,    
        headline: headline,
        bio: bio,
      }, { merge: true });
      setDisabled(false)
      setSuccess(true);  
      setLoading(false);
      saveSuccessNavigation();
    } catch (error) {
      console.log(error.message);
      setDisabled(false)
      setSuccess(false);  
      setLoading(false);
    }
  }


  const saveSuccessNavigation =  () => {
    if (!parsed.r) {   
      navigate(`/p/${shortId}`);
      return
    }

    try  {
      const referer = parsed.r
      if (referer === 'getstarted') {
        navigate(`/getstarted?step=1`);
      }    
    } catch (error) {
      console.log("Error setting referer");
      navigate(`/p/${shortId}`);
    }
  }

  // Handle Avatar
  const [disableAvatar, setDisabledAvatar] = useState(false)
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [successAvatar, setSuccessAvatar] = useState(false);
  const buttonClassnameAvatar = clsx({
    [classes.buttonSuccessAvatar]: successAvatar,
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const setEditorRef = useRef()
  const [scale, setScale] = useState(1.2)

  const handleScale = (event, newValue) => {
    setScale(parseFloat(newValue))
  }

  const handleSave = async () => {
    if (setEditorRef){
      setShowAlert(false)
      setDisabledAvatar(true)
  
      if (!loadingAvatar) {
        setSuccessAvatar(false);
        setLoadingAvatar(true);
      }
  
      const canvasScaled = setEditorRef.current.getImageScaledToCanvas()
      const dataUrl = canvasScaled.toDataURL()
      var blobData = dataURItoBlob(dataUrl);

      try {
        // Get permission to upload
        var getUploadAvatarUrl = firebase.functions().httpsCallable('getUploadAvatarUrl');
        const result = await getUploadAvatarUrl()

        // Upload to S3
        let formData = new FormData();
        formData.append("Content-Type", "image/png");
        Object.entries(result.data.signedRequest.fields).forEach(([k, v]) => {
	        formData.append(k, v);
        });
        formData.append("file", blobData);
        await axios({
          method: 'post',
          url: result.data.signedRequest.url,
          data: formData,
          headers: {'Content-Type': 'multipart/form-data' }
        })

        // Update user profile
        await firestore.collection('/users').doc(user.uid).set({
          photoURL: result.data.url,
        }, { merge: true });

        getAvatarImage(profile.photoURL || '')
        setDisabledAvatar(false)
        setSuccessAvatar(true);
        setLoadingAvatar(false);  
        handleCloseAvatarDialog()

      } catch (error) {
        console.error(error);
        setDisabledAvatar(false)
        setSuccessAvatar(false);
        setLoadingAvatar(false);
      }    
    }

  }

  const getAvatarImage = async (url) => {
    const src = await getDataImage(url)
    setAvatarImage(src)
  }

  const getDataImage = async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    const contentType = response.headers.get("content-type")
    const buffer = await response.arrayBuffer();

    let binary = '';
    const bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach(b => binary += String.fromCharCode(b));
    const base64 = window.btoa(binary);

    return `data:${contentType};base64,${base64}`;
  }

  const dataURItoBlob = (dataURI) => {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
  }

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const binaryStr = reader.result
      }
      setAvatarEditorImage(file)
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
    setAvatarEditorImage(avatarImage)
    setShowAlert(false)
    toggleOpenAvatarDialog(true);
    const hubspot = document.getElementById('hubspot-messages-iframe-container')
    if (hubspot != null)  hubspot.style.setProperty('display', 'none', 'important');
  };

  const handleCloseAvatarDialog = () => {    
    setSuccessAvatar(false);
    toggleOpenAvatarDialog(false);
    const hubspot = document.getElementById('hubspot-messages-iframe-container')
    if (hubspot != null)  hubspot.style.display = 'initial';
  };
  

  return (
    <React.Fragment>
      <MenuAppBar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Breadcrumbs aria-label="breadcrumb" className={classes.breadcrumb} >
          <Link color="inherit" onClick={() => { navigate('/home'); }}>
            Home
          </Link>
          <Link color="inherit" onClick={() => { navigate(`/p/${shortId}`); }}>
            {formatUserName()}
          </Link>          
          <Typography color="textPrimary">Edit Profile</Typography>
        </Breadcrumbs>

        <div className={classes.paper}>
            <Avatar 
              className={classes.avatar} 
              src={avatarImage} 
              onClick={() => {handleOpenAvatarDialog() }}
            />
            <Typography component="h1" variant="h5">
              Edit Profile
            </Typography>
            <form 
              className={classes.form} 
              noValidate
              onSubmit={handleSubmit}
              >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                    autoFocus
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
                      autoComplete="headline"
                      name="headline"
                      variant="outlined"
                      required
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                            ({headlineCounter}/{HEADLINE_CHAR_LIMIT})
                          </InputAdornment>
                      }}
                      inputProps={{
                        maxLength: HEADLINE_CHAR_LIMIT
                      }}                           
                        id="headline"
                      label="Headline"
                      value={headline}
                      helperText={HEADLINE_HELPER_TEXT}
                      onChange={e => {
                        setHeadline(e.target.value);
                        setHeadlineCounter(e.target.value.length)
                      }}
                  />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    autoComplete="bio"
                    name="bio"
                    variant="outlined"
                    required
                    fullWidth
                    multiline
                    InputProps={{
                      endAdornment: <InputAdornment position="end">
                          ({bioCounter}/{BIO_CHAR_LIMIT})
                        </InputAdornment>
                    }}
                  inputProps={{
                      maxLength: BIO_CHAR_LIMIT
                    }}                           
                    id="bio"
                    label="Biography"
                    value={bio}
                    helperText={BIO_HELPER_TEXT}
                    onChange={e => {
                      setBio(e.target.value);
                      setBioCounter(e.target.value.length);
                    }}
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

          <Dialog open={openAvatarDialog} 
            onClose={handleCloseAvatarDialog} 
            aria-labelledby="form-dialog-avatar"
            maxWidth="sm"
            fullScreen={fullScreen}
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
                        image={avatarEditorImage}
                        crossOrigin='anonymous'
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
                          <div className={classes.root}>
                          <div className={classes.wrapper}>
                            <Button color="primary">
                              Change Photo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </section>
                  )
                }}
              </Dropzone>
              <div className={classes.root}>
                <div className={classes.wrapper}>
                  <Button
                    type="submit"
                    color="primary"
                    className={buttonClassnameAvatar}
                    disabled={disableAvatar}
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                  {loadingAvatar && <CircularProgress size={24} className={classes.buttonProgress} />}
                </div>
              </div>


            </DialogActions>
        </Dialog>

          <div className={classes.spacingFooter} />

      </Container>  
    </React.Fragment>
  ) 
};
export default EditProfilePage;
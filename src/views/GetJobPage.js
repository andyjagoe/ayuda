import React,  { useContext, useState, useRef, useEffect } from "react";
import MenuAppBar from 'components/MenuAppBar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { navigate } from "@reach/router"
import Avatar from '@material-ui/core/Avatar';
import WorkIcon from '@material-ui/icons/Work';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Collapse from '@material-ui/core/Collapse';
import Alert from '@material-ui/lab/Alert';
import { UserContext } from "../providers/UserProvider";
import { ProfileContext } from "../providers/ProfileProvider";
import {isMobile} from 'react-device-detect';
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
  primarybutton: {
    margin: theme.spacing(2, 0, 0),
  },
  spacingFooter: {
    marginTop: theme.spacing(50),
  },
}));



const GetJobPage = () => {
  const classes = useStyles();
  const firstRender = useRef(true)

  const user = useContext(UserContext);
  const {displayName} = user;
  const profile = useContext(ProfileContext);

  const [disable, setDisabled] = useState(true)
  const [service, setService] = React.useState("");
  const [pitchType, setPitchType] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [pitch, setPitch] = React.useState("");
  const [hidePitchType, setHidePitchType] = React.useState(false);
  const [hideMessage, setHideMessage] = React.useState(false);

  const [alertMessage, setAlertMessage] = useState('Error');
  const [showAlert, setShowAlert] = useState(false);


  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setDisabled(formValidation())
    
  }, [service, pitchType, subject, pitch])


  const formValidation = () => {
    if (subject != null &&  subject.includes('[Mutual connection]')) {
      setAlertMessage("'[Mutual connection]' must be replaced with a name in subject")
      setShowAlert(true)
      return true
    }
    if (subject != null && subject.includes('[Service Name]')) {
      setAlertMessage("'[Service Name]' must be replaced with a name in subject")
      setShowAlert(true)
      return true
    }
    if (pitch != null && pitch.includes('[Mutual connection]')) {
      setAlertMessage("'[Mutual connection]' must be replaced with a name in message")
      setShowAlert(true)
      return true
    }
    setShowAlert(false)
    
    if (service === "" 
        || pitchType === "" 
        || subject === "" 
        || pitch === "") {
      return true
    } else {
      return false
    }

  }

  // Formatting for user name
  const formatUserName = () => {
    if (profile != null) {
      if  (profile.firstName !== '') {
        return `${profile.firstName}`
      } else {
        return displayName
      }        
    }   
    return '';
  }

  const handleServiceChange = (event) => {
    setShowAlert(false)
    setService(event.target.value);
    if (event.target.value !== '') {
      setHidePitchType(true)
      setHideMessage(true)
    }  else {
      setHidePitchType(false)
      setHideMessage(false)
      setPitch("")
      setSubject("")
      setPitchType("")
      return null
    }
    setPitch(pitchTemplate(event.target.value, pitchType));
    setSubject(pitchSubject(event.target.value, pitchType));
  };

  const handlePitchTypeChange = (event) => {
    setShowAlert(false)
    setPitchType(event.target.value);
    if (event.target.value !== '') {
      setHideMessage(true)
    }  else {
      setHideMessage(false)
    }
    setPitch(pitchTemplate(service, event.target.value));
    setSubject(pitchSubject(service, event.target.value));    
  };


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
    if (profile != null) {
      return `${document.location.origin}/p/${profile.shortId}`;
    }
    return document.location.origin
  }

  const shareTitle = () =>  {
    return `${subject}`
  }
  
  const shareText = () =>  {
    return `${pitch}`
  }

  // Handle Share Dialog
  const [openDialog, toggleOpenDialog] = useState(false);
  const handleOpenDialog = () => {
    toggleOpenDialog(true);
  };
  const handleCloseDialog = () => {
    toggleOpenDialog(false);
  };

  
  const pitchHeader = 
`Hi!
  
`


  const pitchBody = () => {
    return 'With Covid-19 and all the recent changes in work and school, many people '
      + 'are exploring virtual alternatives for things they used to do in person.'      
  }

  
  const pitchOffer = (pitchService) => {
    switch (pitchService) {
      case 'coaching':
      return `I'm offering live 1:1 video coaching using Zoom and I thought it might interest you.`;
      case 'lessons':
      return `I'm offering live 1:1 video lessons using Zoom and I thought it might interest you.`;
      case 'tutoring':
      return `I'm offering live 1:1 video tutoring using Zoom and I thought it might interest you.`;
      case 'babysitting':
      return `I'm offering live 1:1 video babysitting using Zoom and I thought it might interest you.`;
      case 'other':
      return `I'm offering live 1:1 video sessions using Zoom and I thought it might interest you.`;
      default:  
      return '';
    }
  }


  const pitchCloser =  () => {
    return `Would you or your family be interested in a 30 minute free trial? Let me know if you have any questions and I'd be happy to answer them.`
  }

  const pitchFooter = ()  => {
    return `  
Best,
      
${formatUserName()}
--
${shareUrl()}
    
P.S. If this is not a fit for you right now, can you suggest two people who might be interested?`
  } 


const pitchSubject = (pitchService, type) => {
  if (type === '') {
    return ''
  }
  if (type === 'referral') {
    return '[Mutual connection] recommended I get in touch'
  }
  switch (pitchService) {
    case 'coaching':
    return `Have you considered live 1:1 video coaching?`;
    case 'lessons':
    return `Have you considered live 1:1 video lessons?`;
    case 'tutoring':
    return `Have you considered live 1:1 video tutoring?`;
    case 'babysitting':
    return `Have you considered live 1:1 video babysitting?`;
    case 'other':
    return `Have you considered live 1:1 video sessions for [Service Name]?`;
    default:  
    return '';
  }
}


const pitchTemplate = (pitchService, type) => {
  if (type === 'referral') {
  return `${pitchHeader}[Mutual connection] suggested I contact you. I hope you and your family are keeping well.

${pitchBody()}

${pitchOffer(pitchService)} More information on my background and offerings are available at the link below.

${pitchCloser()}
${pitchFooter()}`
  }
  if (type === 'standard') {
    return `${pitchHeader}I hope you and your family are keeping well.
    
${pitchBody()}

${pitchOffer(pitchService)} More information on my background and offerings are available at the link below.

${pitchCloser()}
${pitchFooter()}`
  }
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
          <Typography color="textPrimary">Get Jobs</Typography>
        </Breadcrumbs>

        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
          <WorkIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Get Jobs
          </Typography>
        </div>

        <Grid container spacing={2} className={classes.form}>

          <Grid item xs={12}>
            <FormControl 
              variant="outlined" 
              required
              fullWidth
              className={classes.formControl}
            >
            <InputLabel htmlFor="service">What service do you want to promote?</InputLabel>
            <Select
              native
              id="service"
              value={service}
              onChange={handleServiceChange}
              label="What service do you plan to offer?"
              >
              <option aria-label="None" value="" />
              <option value={'coaching'}>Online Coaching</option>
              <option value={'lessons'}>Online Lessons</option>
              <option value={'tutoring'}>Online Tutoring</option>
              <option value={'babysitting'}>Online Babysitting</option>
              <option value={'other'}>Other</option>
            </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={hidePitchType}>
              <FormControl 
                variant="outlined" 
                required
                fullWidth
                className={classes.formControl}
              >
              <InputLabel htmlFor="pitchType">What template would you like to use?</InputLabel>
              <Select
                native
                id="pitchType"
                value={pitchType}
                onChange={handlePitchTypeChange}
                label="What template would you like to use?"
                >
                <option aria-label="None" value="" />
                <option value={'referral'}>Referral</option>
                <option value={'standard'}>Standard</option>
              </Select>
              </FormControl>
            </Collapse>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={hideMessage}>
              <TextField                      
                  autoComplete="subject"
                  name="subject"
                  variant="outlined"  
                  required
                  fullWidth
                  id="subject"
                  label="Subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
              />
            </Collapse>
          </Grid>

          <Grid item xs={12}>
            <Collapse in={hideMessage}>
              <TextField                      
                  autoComplete="pitch"
                  name="pitch"
                  variant="outlined"
                  required
                  multiline
                  fullWidth
                  id="pitch"
                  label="Message"
                  value={pitch}
                  helperText={`Customize this template for yourself, then click share.                     
                      Sending more messages makes getting work more likely.`}
                  onChange={e => {
                    setPitch(e.target.value);
                  }}
              />
            </Collapse>
          </Grid>

          <Collapse in={showAlert}>
            <Alert severity="error">
              {alertMessage}
            </Alert>
          </Collapse>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={disable}
            className={classes.primarybutton}
            onClick={() => { share() }}
          >
            Share
          </Button>

        </Grid>

        <Dialog open={openDialog} 
            onClose={handleCloseDialog} 
            aria-labelledby="form-dialog"
            maxWidth="sm"
          >
            <DialogTitle 
              id="form-dialog" 
              onClose={handleCloseDialog}
            >              
              Send message options
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" className={classes.sharedialogtext}>                  
                </Typography>            
                <EmailShareButton url={shareUrl()} subject={shareTitle()} body={shareText()}>
                  <EmailIcon size={64} round />
                </EmailShareButton>
                <FacebookMessengerShareButton url={shareUrl()} appId={293795268691794}>
                  <FacebookMessengerIcon size={64} round />
                </FacebookMessengerShareButton>
                <FacebookShareButton url={shareUrl()} quote={shareTitle()}>
                  <FacebookIcon size={64} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl()} title={shareTitle()}>
                  <TwitterIcon size={64} round />
                </TwitterShareButton>        
                <LinkedinShareButton url={shareUrl()}>
                  <LinkedinIcon size={64} round />
                </LinkedinShareButton>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Done
              </Button>
            </DialogActions>
        </Dialog>

        <div className={classes.spacingFooter} />

      </Container>  
    </React.Fragment>
  ) 
};
export default GetJobPage;
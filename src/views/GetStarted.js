import React, { useEffect } from "react";
import MenuAppBar from 'components/MenuAppBar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { navigate } from "@reach/router"
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
const queryString = require('query-string');


const useStyles = makeStyles((theme) => ({
root: {
    marginTop: theme.spacing(4),
    width: '100%',
},
button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
},
actionsContainer: {
    marginBottom: theme.spacing(2),
},
resetContainer: {
    padding: theme.spacing(3),
},
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
spacingFooter: {
    marginTop: theme.spacing(50),
},
}));


function getSteps() {
    return ['Complete your profile', 'Get jobs', 'Enable payments'];
  }
  
function getStepContent(step) {
    switch (step) {
        case 0:
        return `Your profile helps people understand who you are and what services you 
                offer. Doing it well makes getting jobs easier.`;
        case 1:
        return `Use our templates and tools to share your profile and get new jobs.`;
        case 2:
        return `Payments must be enabled before you can charge for a call.`;
        default:
        return 'Unknown step';
    }
}

function getStepAction(step) {
    switch (step) {
        case 0:
            return {text: 'Complete profile', url: '/profile?r=getstarted'};
        case 1:
            return {text: 'Get jobs', url: '/getjob?r=getstarted'};
        case 2:
            return {text: 'Enable payments', url: '/setup-payments?r=getstarted'};
        default:
            return {text: '', url: '/getstarted'};
    }
}

const GetStarted = (props) => {
  const classes = useStyles();
  const parsed = queryString.parse(props.location.search);

  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  useEffect(() => {
    setStep()
  }, []);

  async function setStep() {
    if (!parsed.step) {   
        return
    }
    try  {
        const step = parseInt(parsed.step)
        console.log(step)
        if (step >= 0 && step <= 3) {
            console.log("setting active  step")
            setActiveStep(parseInt(step))
        }    
    } catch (error) {
        console.log("Error setting get started step");
    }
  }

  const handleNext = () => {
    navigate(getStepAction(activeStep).url)
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleFinish = () => {
    navigate('/home')
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
          <Typography color="textPrimary">Getting Started</Typography>
        </Breadcrumbs>
        <div className={classes.paper}>
            <Avatar className={classes.avatar}>
            <AssignmentIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              How to get started
            </Typography>
        </div>
        <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                    <StepContent>
                    <Typography>{getStepContent(index)}</Typography>
                    <div className={classes.actionsContainer}>
                        <div>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            className={classes.button}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            className={classes.button}
                        >
                            {getStepAction(index).text}
                        </Button>
                        </div>
                    </div>
                    </StepContent>
                </Step>
                ))}
            </Stepper>
            {activeStep === steps.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                <Typography>All steps completed - you&apos;re good to go!</Typography>
                <Button onClick={handleFinish} className={classes.button}>
                    Home
                </Button>
                </Paper>
            )}
        </div>

      </Container>  
    </React.Fragment>
  ) 
};
export default GetStarted;
import React from "react";
import Card from '@material-ui/core/Card';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CardHeader from '@material-ui/core/CardHeader';
//import Avatar from '@material-ui/core/Avatar';
import Avatar from 'react-avatar';
import IconButton from '@material-ui/core/IconButton';
import { navigate } from "@reach/router";
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
var moment = require('moment');


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

const StyledCardHeader = withStyles({
    action: {
      margin: 0,
      alignSelf: 'auto'
    },
  })(CardHeader);
  

const JobCell = ({props, jobRecord, jobKey}) => {
    const classes = useStyles();  
    
    return (
    <React.Fragment>
        <Card variant="outlined">
            <StyledCardHeader
            className={classes.jobheader}
            avatar={
                <Avatar 
                  size="40" 
                  round={true} 
                  name={jobRecord.payer} 
                  color={jobRecord.payer.toHex()} 
                />
            }
            title={jobRecord.topic}
            subheader={moment(jobRecord
                      .t
                      .toDate())
                      .tz(jobRecord.tz)
                      .format(('MMMM Do, h:mm a'))} 
            action={
                <IconButton 
                aria-label="settings"
                onClick={() => { navigate(
                                  `/job/${jobKey}`,
                                  { state: { jobRecord: jobRecord} }
                                  ); 
                                }
                              }
                >
                <ArrowForwardIosIcon />
                </IconButton>
            }
            >
            </StyledCardHeader>
        </Card>
    </React.Fragment>
  ) 
};
export default JobCell;


// Generate consistent random color based on string
String.prototype.toHex = function() {
  var hash = 0;
  if (this.length === 0) return hash;
  for (var i = 0; i < this.length; i++) {
      hash = this.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
  }
  var color = '#';
  for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 255;
      color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}
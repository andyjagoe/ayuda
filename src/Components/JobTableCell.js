import React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { navigate } from "@reach/router";
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';


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
  

const JobTableCell = ({jobRecord}) => {
    const classes = useStyles();

    return (
    <React.Fragment>
        <Card>
            <StyledCardHeader
            className={classes.jobheader}
            avatar={
                <Avatar className={classes.avatar} src={'https://res.cloudinary.com/dqcsk8rsc/image/upload/v1577268053/avatar-1-bitmoji_upgwhc.png'}/>
            }
            title={jobRecord.title}
            subheader={jobRecord.subtitle}
            action={
                <IconButton 
                aria-label="settings"
                onClick={() => { navigate('/job'); }}
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
export default JobTableCell;
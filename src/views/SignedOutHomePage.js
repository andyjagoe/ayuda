import React from "react";
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import PublicAppBar from 'components/PublicAppBar';
import BenefitCard from 'components/BenefitCard';
import Footer from 'components/Footer';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';


const useStyles = makeStyles((theme) => ({
    '@global': {
        ul: {
            margin: 0,
            padding: 0,
            listStyle: 'none',
        },
    },
    link: {
        margin: theme.spacing(1, 1.5),
    },
    heroContent: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(8, 0, 6),
    },
    heroButtons: {
        marginTop: theme.spacing(4),
    },
    cardGrid: {
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    card: {
        height: 300,
        display: 'flex',
    },
    cardMedia: {
        width: '100%',        
    },
    cardContent: {
        flexGrow: 1,
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
}));

const cards = [
    {
        headline: 'Selling your time made easy',
        subhead: `Email and calendar-based scheduling system with unlimited 1:1 
            video calls. Bills generate automatically, and payment is collected 
            by credit card once a call has ended.`,
        imageIsRight:  false,
        imageId: 'HJmxky8Fvmo'
    }, 
    {
        headline: 'No cost to get started',
        subhead: `Pricing built for everyone\u2014from part-time individuals to 
            full-time small businesses. Pay only for what you use. No setup fees, 
            monthly fees, or hidden fees.`,
        imageIsRight:  true,
        imageId: '9dYwCScW0Rs'
    }, 
    {
        headline: 'Help finding work',
        subhead: `Your time is valuable. And finding work can be hard. If you need help, 
            use our templates and automated tools to make finding great work easier.`,
        imageIsRight:  false,
        imageId: 'PGnqT0rXWLs'
    }
];

const SignedOutHomePage = () => {
    const classes = useStyles();

    return (
        <React.Fragment>
        <CssBaseline />
        <PublicAppBar />
        <main>

            {/* Hero unit */}
            <div className={classes.heroContent}>
            <Container maxWidth="sm">
                <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                Earn from home
                </Typography>
                <Typography variant="h5" align="center" color="textSecondary" paragraph>
                Ayuda is the easiest way to get paid for consulting, coaching or anything you do by Zoom video call.
                </Typography>
                <div className={classes.heroButtons}>
                <Grid container spacing={2} justify="center">
                    <Grid item>
                        <Button variant="contained" color="primary" href="/signin">
                            Start Now
                        </Button>
                    </Grid>
                </Grid>
                </div>
            </Container>
            </div>
            {/* End hero unit */}
            
            {/* Benefit unit */}
            <Container className={classes.cardGrid} maxWidth="md" id='features'>
            <Grid container spacing={4}>
                {cards.map((card) => (
                <Grid item key={card.headline} xs={12}>
                    <BenefitCard carddata={card} />
                </Grid>
                ))}
            </Grid>
            </Container>
            {/* End Benefit unit */}


        </main>
        <Footer />
        </React.Fragment>
    ) 
};
export default SignedOutHomePage;
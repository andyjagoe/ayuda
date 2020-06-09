import React from "react";
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import PublicAppBar from 'components/PublicAppBar';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import StarIcon from '@material-ui/icons/StarBorder';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Footer from 'components/Footer';
import { makeStyles } from '@material-ui/core/styles';


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
        padding: theme.spacing(8, 0, 4),
    },
    cardHeader: {
        backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
    },
    cardPricing: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
    },
    cardPricingCents: {
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    cardPricingPerCharge:  {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: theme.spacing(4),
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
}));



const tiers = [
    {
      title: "Pay only for what you use",
      price: '4.9',
      description: [
        'Unlimited 1:1 video calls',
        'Accept credit card payments',
        'Easy scheduling & reminders',
        'Automated invoicing & payments',
        'No setup fees, monthly fees, or hidden fees',
      ],
      buttonText: 'Start now',
      buttonVariant: 'contained',
    },
  ];


const PricingPage = () => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <CssBaseline />
            <PublicAppBar />
            <Container maxWidth="sm" component="main" className={classes.heroContent}>
                <Typography component="h1" variant="h2" align="center" color="textPrimary">
                Pricing
                </Typography>
            </Container>

            <Container maxWidth="sm" component="main">
                <Grid container spacing={5} alignItems="center">
                {tiers.map((tier) => (
                    // Enterprise card is full width at sm breakpoint
                    <Grid item key={tier.title} xs={12} sm={tier.title === 'Enterprise' ? 12 : 6} sm={12}>
                    <Card>
                        <CardHeader
                        title={tier.title}
                        subheader={tier.subheader}
                        titleTypographyProps={{ align: 'center' }}
                        subheaderTypographyProps={{ align: 'center' }}
                        action={tier.title === 'Pro' ? <StarIcon /> : null}
                        className={classes.cardHeader}
                        />
                        <CardContent>
                        <div className={classes.cardPricing}>
                            <Typography component="h2" variant="h3" color="textPrimary">
                            {tier.price}%
                            </Typography>
                            <Box className={classes.cardPricingCents}>
                                <Typography variant="h6" color="textPrimary">
                                    &nbsp;&nbsp;+ 60¢
                                </Typography>                                
                            </Box>                                
                        </div>
                        <div className={classes.cardPricingPerCharge}>
                            <Typography variant="body2" color="textSecondary">
                                    per successful card charge
                            </Typography>
                        </div>

                        <ul>
                            {tier.description.map((line) => (
                            <Typography component="li" variant="subtitle1" align="center" key={line}>
                                {line}
                            </Typography>
                            ))}
                        </ul>
                        </CardContent>
                        <CardActions>
                        <Button fullWidth variant={tier.buttonVariant} color="primary">
                            {tier.buttonText}
                        </Button>
                        </CardActions>
                    </Card>
                    </Grid>
                ))}
                </Grid>
            </Container>

            <Footer />
        </React.Fragment>
    ) 
};
export default PricingPage;
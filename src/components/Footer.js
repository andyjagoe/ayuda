import React from "react";
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Copyright from 'components/Copyright';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    '@global': {
      ul: {
        margin: 0,
        padding: 0,
        listStyle: 'none',
      },
    },
    footer: {
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: theme.spacing(8),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(6),
      },
    },
  }));


const footers = [
  /*
     {
        title: 'Features',
        description: [
            {
                name:'Cool stuff', 
                href: '#',
            },
            {
                name:'Random feature', 
                href: '#',
            },
            {
                name:'Team feature', 
                href: '#',
            },
            {
                name:'Developer stuff', 
                href: '#',
            },
        ],
    },    
    {
        title: 'Resources',
        description: [
            {
                name:'Resource', 
                href: '#',
            },
            {
                name:'Resource name', 
                href: '#',
            },
            {
                name:'Another resource', 
                href: '#',
            },
            {
                name:'Final resource', 
                href: '#',
            },
        ],
    },
    */
    {
        title: 'Company',
        description: [
            {
                name:'Support', 
                href: '/support',
            },
            {
                name:'Contact us', 
                href: '/contact',
            },
        ],
    },
    {
        title: 'Legal',
        description: [
            {
                name:'Privacy policy', 
                href: '/privacy',
            },
            {
                name:'Terms of use', 
                href: '/tos',
            },
        ],
    },    
  ];


const Footer = () => {
    const classes = useStyles();

    return (
    <React.Fragment>
      <Container maxWidth="md" component="footer" className={classes.footer}>
        <Grid container spacing={4} justify="space-evenly">
          {footers.map((footer) => (
            <Grid item xs={6} sm={3} key={footer.title}>
              <Typography variant="h6" color="textPrimary" gutterBottom>
                {footer.title}
              </Typography>
              <ul>
                {footer.description.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} variant="subtitle1" color="textSecondary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>
          ))}
        </Grid>
        <Box mt={5}>
          <Copyright />
        </Box>
      </Container>
    </React.Fragment>
  ) 
};
export default Footer;

import React from "react";
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import { makeStyles } from '@material-ui/core/styles';



const useStyles = makeStyles((theme) => ({
    '@global': {
        ul: {
            margin: 0,
            padding: 0,
            listStyle: 'none',
        },
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
}));


function HeroText(props) {
    const classes = useStyles();
    const headline = props.cardData.headline;
    const subhead = props.cardData.subhead;

    return (
        <div className={classes.details}>
            <CardContent className={classes.cardContent}>
                <Typography gutterBottom variant="h4" component="h2">
                {headline}
                </Typography>
                <Typography>
                {subhead}
                </Typography>
            </CardContent>
        </div>
    );
}


function HeroMedia(props) {
    const classes = useStyles();
    const imageId = props.cardData.imageId;

    return (
        <CardMedia
            className={classes.cardMedia}
            image={`https://source.unsplash.com/${imageId}/`}
            title="Image title"
        />
);
}


const BenefitCard = (props) => {
    const classes = useStyles();
    const imageIsRight = props.cardData.imageIsRight;
    const cardData = props.cardData;

    return (
        <React.Fragment>
            <div {...props}>
                <Card className={classes.card}>
                    {imageIsRight ? ( 
                        <React.Fragment>
                            <HeroText cardData={cardData} />
                            <HeroMedia cardData={cardData}/>
                        </React.Fragment>
                    ) : ( 
                        <React.Fragment>
                            <HeroMedia cardData={cardData}/>
                            <HeroText cardData={cardData} />
                        </React.Fragment>
                    )}
                </Card>
            </div>
        </React.Fragment>
    )  
};
export default BenefitCard;

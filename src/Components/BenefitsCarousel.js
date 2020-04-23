import React from 'react';
import { red, blue, green } from "@material-ui/core/colors";
import { AutoRotatingCarousel, Slide } from "material-auto-rotating-carousel";


export default function BenefitsCarousel() {
    return (
        <AutoRotatingCarousel
        label="Get started"
        open
        mobile
        interval={5000}
      >
        <Slide
          media={<img src="http://www.icons101.com/icon_png/size_256/id_79394/youtube.png" />}
          mediaBackgroundStyle={{ backgroundColor: red }}
          contentStyle={{ backgroundColor: red }}
          title="This is a very cool feature"
          subtitle="Just using this will blow your mind."
        />
        <Slide
          media={<img src="http://www.icons101.com/icon_png/size_256/id_80975/GoogleInbox.png" />}
          mediaBackgroundStyle={{ backgroundColor: blue }}
          contentStyle={{ backgroundColor: blue }}
          title="Ever wanted to be popular?"
          subtitle="Well just mix two colors and your are good to go!"
        />
        <Slide
          media={<img src="http://www.icons101.com/icon_png/size_256/id_76704/Google_Settings.png" />}
          mediaBackgroundStyle={{ backgroundColor: green }}
          contentStyle={{ backgroundColor: green }}
          title="May the force be with you"
          subtitle="The Force is a metaphysical and ubiquitous power in the Star Wars universe."
        />
      </AutoRotatingCarousel>
  );
}


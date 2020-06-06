import React, { useEffect, useRef } from "react";


const HubSpotChat = () => {
    const firstRender = useRef(true)

    useEffect(() => {

        if (firstRender.current) {
            firstRender.current = false
            const script = document.createElement('script');
      
            script.src = '//js.hs-scripts.com/7857404.js';
            script.id = 'hs-script-loader';
            script.async = true;
            script.defer = true;
          
            document.body.appendChild(script);
        }
        return

    }, []);

    return (
        <React.Fragment>
        </React.Fragment>
    ) 
};
export default HubSpotChat;


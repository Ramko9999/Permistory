import React, {useEffect} from "react";
import UsageService from "../../services/Usage";

function Home () {

    useEffect(() => {
        UsageService.getUsageData().then((data) => {
            console.log(data);
        });
    }, []);

    return (
        <div> Hello </div>
    );
}

export default Home;
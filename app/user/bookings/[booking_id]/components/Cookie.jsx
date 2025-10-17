import { getTokenFromCookie } from "@/helper/cookies";

export default function Cookie(){
    const token = getTokenFromCookie("token");

    console.log("This is token from cookie component",token);
    return(
        <div>
            This is cookie component {token}
        </div>
    )
}

import Cookies from 'js-cookie';

export  const getTokenFromCookie =  (token)=>{
    console.log("Fetching token from cookie:", token);
    console.log("thIS IS COOKIES OBJECT",Cookies);

    const cookieValue =  Cookies.get(token);
    console.log("this is cookie value",cookieValue);

    return cookieValue;

}
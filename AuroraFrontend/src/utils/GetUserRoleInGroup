import Cookies from "universal-cookie";

const GetRole = async (id)=>{
    const cookies = new Cookies();
    try {
        const response = await fetch('https://localhost:7242/api/Groups/role?id='+id, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json',
            'Authorization': cookies.get("JWT")
           },
        });
        const json = await response.json();
        return json.role;
    }
    catch(error){
        console.log('Error getting role:',error);
        return "None";
    }
}
export default GetRole
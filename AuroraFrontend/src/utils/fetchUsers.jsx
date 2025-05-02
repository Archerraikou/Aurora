import Cookies from "universal-cookie";

const fetchUsers = async (groupId) => {
    const cookies= new Cookies();
    try {
        const response = await fetch(`https://localhost:7242/api/UserGroups?groupId=${groupId}`, {
            headers: { 'Content-Type': 'application/json', 'Authorization' : cookies.get('JWT') },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const json = await response.json();
        return json;
    } 
    catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};

export default fetchUsers;
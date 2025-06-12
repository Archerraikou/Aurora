import { useEffect, useState } from 'react'
import Cookies from 'universal-cookie'
import { useNavigate } from 'react-router-dom';

function OAuth(){
    const navigate = useNavigate()
    const queryParams = new URLSearchParams(location.search);
    useEffect(()=>{
        async function login(){
            try{
                var accessToken = queryParams.get("accessToken")
                var refreshToken = queryParams.get("refreshToken")
                var expiresIn = queryParams.get("expiresIn")
                const cookies = new Cookies
                cookies.set('JWT', 'Bearer ' + accessToken, { path: '/' });
                cookies.set('JWTRefresh', refreshToken, { path: '/' });
                cookies.set('ExpirationDate', expiresIn*1000 + Date.now(), { path: '/' });
                localStorage.setItem("isLoggedIn", "true");
                const roleResponse = await fetch('https://localhost:7242/api/Auth/roles', {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': cookies.get("JWT")
                    }
                });

                const roleData = await roleResponse.json();
                if (roleData?.roles?.length > 0) {
                    cookies.set("Roles", roleData.roles[0], { path: '/' });
                }
                const response = await fetch(`https://localhost:7242/api/ApplicationUsers/currentUser`, {
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': cookies.get("JWT")
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    cookies.set("UserId",data.id, { path: '/' });
                } else {
                    console.error('Failed to fetch group info');
                }
                navigate("/")
                location.reload()
            }
            catch (err) {
                console.error('Login error:', err);
                setError('An error occurred during login. Please try again.');
            }
        }  
        login();
    },[])
    return (
        <></>
    )
}
export default OAuth
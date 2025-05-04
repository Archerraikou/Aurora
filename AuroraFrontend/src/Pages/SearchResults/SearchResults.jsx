import React, { useEffect, useState, useRef } from "react";
import "./SearchResults.css";
import Cookies from "universal-cookie";
import { useLocation } from "react-router-dom";
import Group from "../../components/group/group";
import { useNavigate } from 'react-router-dom'; 
function SearchResults(){
    const location = useLocation();
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    useEffect(() => {
        if (location.state) {
          setResults(location.state);
        }
      }, [location.state]);
    return(
        <>
        <div className="search-results">
            {results.length > 0 && (
            <ul>
                {results.map((group) => (
                <Group name={group.name} image={group.picture} description={group.description} id={group.id} key={group.id}></Group>
                ))}
            </ul>
            )}
            {results.length==0&&<h1>No results found</h1>}
        </div>
        </>
    )
}
export default SearchResults
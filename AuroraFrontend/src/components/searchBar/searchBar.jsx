import React, { useState } from "react";
import "./searchBar.css";
import Cookies from "universal-cookie";
import MyProfile from "../myProfile/myProfile";

function SearchBar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [useCategory, setUseCategory] = useState(false);
  const cookies = new Cookies();

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!useCategory) {
      try {
        const response = await fetch(
          `https://localhost:7242/api/Groups/search?search=${search}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: cookies.get("JWT"),
            },
          }
        );

        if (response.ok) {
          const json = await response.json();
          setResults(json);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error during search:", error);
        setResults([]);
      }
    } else {
      try {
        const response = await fetch(
          `https://localhost:7242/api/Groups/search?search=${search}&&param=1`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: cookies.get("JWT"),
            },
          }
        );

        if (response.ok) {
          const json = await response.json();
          setResults(json);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error during search:", error);
        setResults([]);
      }
    }
  };

  return (
    <div>
      <form className="header" onSubmit={handleSubmit}>
        <input
          className="search-bar"
          type="text"
          name="search"
          placeholder="Search"
          value={search}
          onChange={handleChange}
        />

        <div className="useCategory">
          <input
            type="checkbox"
            name="useCategory"
            id="useCategory"
            onChange={() => setUseCategory(!useCategory)}
          />
          <label htmlFor="useCategory">Search by Category now</label>
        </div>
        <button className="btn" type="submit">
          Search
        </button>
        <MyProfile
          name="Diocletian"
          image="https://avatars.githubusercontent.com/u/110779745?v=4"
        ></MyProfile>
      </form>
      <div className="search-results">
        {results.length > 0 ? (
          <ul>
            {results.map((group) => (
              <li key={group.Id} className="group-item">
                {console.log(group)}
                <div>
                  {group.picture && (
                    <img src={"../../../Aurora/wwwroot/images"+group.Picture} alt="Group" width="100" />

                  )}
                  <h3>{group.name}</h3>
                </div>
                <p>{group.description}</p>
                <p>Admin: {group.admin}</p>
                <p>Categories: {group.categories?.join(", ")}</p>
                <p>
                  Creation date: {new Date(group.date).toLocaleDateString()}
                </p>
                <p>Private: {group.isPrivate ? "Yes" : "No"}</p>
              </li>
            ))}
          </ul>
        ) : (
          search !== "" && <p>No results found.</p>
        )}
      </div>
    </div>
  );
}

export default SearchBar;

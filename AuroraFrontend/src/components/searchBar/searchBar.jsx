import React from "react";
import "./SearchBar.css";

function SearchBar() {
  return (
    <form>
      <div className="header">
        <input
          className="search-bar"
          type="text"
          placeholder="Search for ceva"
        ></input>
        <button className="btn" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;

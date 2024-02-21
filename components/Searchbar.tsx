"use client";
import React, { useState } from "react";

const isValidAmazonProductUrl = (url: string): boolean => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (
      hostname.includes("amazon.cp,") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
};

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState<string>("");
  const [loading, setIsLoading] = useState<boolean>(false);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValidLink = isValidAmazonProductUrl(searchPrompt);

    if (!isValidLink) {
      alert("Please enter a valid Amazon product link");
      return;
    }

    try {
      setIsLoading(true);
      //scrape the product page
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mt-12">
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />
      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === ""}
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default Searchbar;

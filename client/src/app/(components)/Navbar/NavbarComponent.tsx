import React, { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const NavbarComponent = () => {
  const userEmail = useSearchParams().get("email");

  const data = [
    { title: "Dashboard", link: `/Dashboard?email=${userEmail}` },
    { title: "Screenshots", link: `/screenshots?email=${userEmail}` },
    { title: "Live Streaming", link: `/liveStream?email=${userEmail}` },
    { title: "Geo Tracking", link: `/geoTrack?email=${userEmail}` },
    {
      title: "Projects Dashboard",
      link: `/projectsDashboard?email=${userEmail}`,
    },
    { title: "Attendance", link: `/attendance?email=${userEmail}` },
    { title: "Productivity", link: `/productivity?email=${userEmail}` },
    { title: "Activity", link: `/activity?email=${userEmail}` },
    { title: "User Details", link: `/userDetails?email=${userEmail}` },
    { title: "Alerts", link: `/alerts?email=${userEmail}` },
    { title: "Reports", link: `/reports?email=${userEmail}` },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter data based on search query
    if (query === "") {
      setFilteredData(data); // Show all data when no query
    } else {
      setFilteredData(
        data.filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  const handleItemClick = () => {
    setSearchQuery(""); // Clear the search query
  };

  return (
    <div className="relative flex items-center w-[250px]">
      {/* Search icon */}
      {/* <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white cursor-pointer"
        aria-label="Search"
      />
\      <input
        className="w-full rounded-xl border border-gray-300 bg-gray-100 p-2 pt-2 mt-1 pl-10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-white"
        type="search"
        placeholder="Search..."
        aria-label="Search Input"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {searchQuery && (
        <ul className="absolute left-0 w-full bg-white border rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg z-20 top-full">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <li
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleItemClick()}
              >
                <Link
                  href={item.link} // React Router's Link for navigation
                  className="block w-full"
                >
                  {item.title}
                </Link>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No results found</li>
          )}
        </ul>
      )} */}
    </div>
  );
};

export default NavbarComponent;

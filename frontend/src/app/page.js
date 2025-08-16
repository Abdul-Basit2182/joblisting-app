"use client";

import { useEffect, useState } from "react";
import API from "@/app/lib/api";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [tags, setTags] = useState([]);

  const [filters, setFilters] = useState({
    keyword: "",
    jobType: "All",
    location: "All",
    tags: [],
  });

  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    fetchJobs();
    fetchLocations();
    fetchTags();
  }, []);

  const fetchJobs = () => {
    API.get("/jobs")
      .then((res) => {
        console.log("Fetched jobs:", res.data);
        setJobs(res.data);
      })
      .catch((err) => console.error("Error fetching jobs:", err));
  };

  const fetchLocations = () => {
    API.get("/locations")
      .then((res) => setLocations(["All", ...res.data]))
      .catch((err) => console.error("Error fetching locations:", err));
  };

  const fetchTags = () => {
    API.get("/tags")
      .then((res) => setTags(res.data))
      .catch((err) => console.error("Error fetching tags:", err));
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await API.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err) {
        console.error("Failed to delete job:", err);
      }
    }
  };

  const handleScrape = async () => {
    if (confirm("Run scraper to fetch new job listings?")) {
      try {
        const res = await API.post("/scrape");
        alert(res.data.message || "Scraping done.");
        fetchJobs();
      } catch (err) {
        console.error("Scrape error:", err);
        alert("Scraping failed. Check console for details.");
      }
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("⚠️ This will permanently delete all job listings. Continue?")) {
      try {
        await Promise.all(jobs.map((job) => API.delete(`/jobs/${job.id}`)));
        fetchJobs();
      } catch (err) {
        console.error("Failed to delete all jobs:", err);
      }
    }
  };

  const resetFilters = () => {
    setFilters({
      keyword: "",
      jobType: "All",
      location: "All",
      tags: [],
    });
    setSortOrder("default");
  };

  const filteredJobs = jobs.filter((job) => {
    const keywordMatch =
      filters.keyword === "" ||
      job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.keyword.toLowerCase());

    const jobTypeMatch =
      filters.jobType === "All" || job.job_type === filters.jobType;

    const locationMatch =
      filters.location === "All" || job.location === filters.location;

    const tagsMatch =
      filters.tags.length === 0 ||
      filters.tags.every((tag) =>
        job.tags.map((t) => t.trim().toLowerCase()).includes(tag.toLowerCase())
      );

    return keywordMatch && jobTypeMatch && locationMatch && tagsMatch;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOrder === "title") return a.title.localeCompare(b.title);
    if (sortOrder === "company") return a.company.localeCompare(b.company);
    return 0;
  });

  return (
  <main className="max-w-6xl mx-auto px-4 py-10 bg-white">
    <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
      Job Listings
    </h1>

    {/* Controls */}
    <div className="flex flex-wrap justify-end gap-3 mb-8">
      <button
        onClick={resetFilters}
        className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
      >
        Reset Filters
      </button>
      {jobs.length > 0 && (
        <button
          onClick={handleDeleteAll}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Delete All
        </button>
      )}
      <button
        onClick={handleScrape}
        className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
      >
        Scrape Jobs
      </button>
    </div>

    {/* Filters */}
    <div className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg">
      <input
        type="text"
        placeholder="🔍 Search by title or company"
        className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 w-full text-black bg-white/40"
        value={filters.keyword}
        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
      />
      <select
        className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 w-full text-black bg-white/40"
        value={filters.jobType}
        onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
      >
        <option value="All">All Job Types</option>
        <option value="Full-time">Full-time</option>
        <option value="Part-time">Part-time</option>
        <option value="Internship">Internship</option>
      </select>
      <select
        className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 w-full text-black bg-white/40"
        value={filters.location}
        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
      >
        {locations.map((loc, i) => (
          <option key={i} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      {/* Tags */}
      <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <label
            key={tag}
            className="flex items-center space-x-2 text-sm text-black bg-white/40 px-3 py-1 rounded-full cursor-pointer hover:bg-white/30 transition"
          >
            <input
              type="checkbox"
              value={tag}
              checked={filters.tags.includes(tag)}
              onChange={() => {
                const updatedTags = filters.tags.includes(tag)
                  ? filters.tags.filter((t) => t !== tag)
                  : [...filters.tags, tag];
                setFilters({ ...filters, tags: updatedTags });
              }}
            />
            <span>{tag}</span>
          </label>
        ))}
      </div>

      <select
        className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 w-full text-black bg-white/40"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="default">Sort By</option>
        <option value="title">Title (A–Z)</option>
        <option value="company">Company (A–Z)</option>
      </select>
    </div>

    {/* Job Listings */}
    {sortedJobs.length === 0 ? (
      <p className="text-center text-gray-400">No matching jobs found.</p>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-6 relative hover:scale-[1.02] transition-transform flex flex-col justify-between h-full"
          >
            <button
              onClick={() => handleDelete(job.id)}
              className="absolute top-3 right-4 text-red-500 hover:text-red-700 transition"
            >
              ❌
            </button>

            <div>
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <p className="text-gray-700">
                {job.company} — {job.location}
              </p>
              <p className="text-sm text-blue-600 mt-1">{job.job_type}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm hover:scale-105 transition"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <a
                href={`/edit-job/${job.id}`}
                className="px-3 py-1 rounded-lg text-white"
                style={{ backgroundColor: "#00c3c3" }}
              >
                Edit
              </a>
            </div>
          </div>
        ))}
      </div>
    )}
  </main>
);
}

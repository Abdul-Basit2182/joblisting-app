"use client";

import { useState } from "react";
import API from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function AddJobPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    job_type: "Full-time",
    tags: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/jobs", form);
      alert("Job posted successfully!");
      router.push("/"); // redirect back to job list
    } catch (err) {
      console.error("Error creating job", err);
      alert("Failed to create job");
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
          🚀 Post a New Job
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {["title", "company", "location", "tags"].map((field) => (
            <div key={field}>
              <label className="block text-black font-medium mb-2 capitalize">
                {field}
              </label>
              <input
                type="text"
                name={field}
                placeholder={`Enter ${field}`}
                value={form[field]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none transition bg-gray-50 text-black placeholder-gray-400"
                required={field !== "tags"}
              />
            </div>
          ))}

          {/* Job type */}
          <div>
            <label className="block text-black font-medium mb-2">
              Job Type
            </label>
            <select
              name="job_type"
              value={form.job_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none transition bg-gray-50 text-black"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#00c3c3] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#00a9a9] transition font-semibold"
            >
              Post Job
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

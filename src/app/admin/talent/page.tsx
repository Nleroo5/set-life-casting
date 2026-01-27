"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface TalentProfile {
  id: string;
  basicInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
  };
  appearance: {
    gender: string;
    dateOfBirth: string;
    ethnicity: string[];
    height: string;
    weight: number;
    hairColor: string;
    hairLength: string;
    eyeColor: string;
  };
  sizes: {
    shirtSize: string;
    pantsWaist: number;
    pantsInseam: number;
    dressSize?: string;
    suitSize?: string;
    shoeSize: string;
    shoeSizeGender: string;
  };
  details: {
    visibleTattoos: boolean;
    tattoosDescription?: string;
    piercings?: boolean;
    piercingsDescription?: string;
    facialHair: string;
  };
  photos: Array<{ url: string; type: string }>;
  status?: "active" | "archived";
  adminTag?: "green" | "yellow" | "red" | null;
  adminNotes?: string;
  createdAt: Date;
}

export default function TalentDatabasePage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");

  // Filter states
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [ageRangeFilter, setAgeRangeFilter] = useState<string>("all");
  const [adminTagFilter, setAdminTagFilter] = useState<string[]>([]);
  const [ethnicityFilter, setEthnicityFilter] = useState<string[]>([]);
  const [hairColorFilter, setHairColorFilter] = useState<string>("all");
  const [minHeight, setMinHeight] = useState<string>("");
  const [maxHeight, setMaxHeight] = useState<string>("");
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    newThisMonth: 0,
    active: 0,
    complete: 0,
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/admin");
    } else if (user && isAdmin && !authLoading) {
      fetchTalents();
    }
  }, [authLoading, user, isAdmin]);

  useEffect(() => {
    applyFilters();
  }, [talents, searchQuery, genderFilter, locationFilter, ageRangeFilter, adminTagFilter, ethnicityFilter, hairColorFilter, minHeight, maxHeight, showArchived, sortBy]);

  async function fetchTalents() {
    try {
      setLoading(true);
      const profilesRef = collection(db, "profiles");
      const profilesSnapshot = await getDocs(profilesRef);

      const talentsData: TalentProfile[] = [];
      profilesSnapshot.forEach((doc) => {
        const data = doc.data();
        talentsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status || "active",
        } as TalentProfile);
      });

      // Calculate statistics
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const newThisMonth = talentsData.filter(
        (t) => t.createdAt >= firstDayOfMonth
      ).length;

      const active = talentsData.filter((t) => t.status === "active").length;

      const complete = talentsData.filter(
        (t) => t.photos && t.photos.length >= 2
      ).length;

      setStats({
        total: talentsData.length,
        newThisMonth,
        active,
        complete,
      });

      setTalents(talentsData);
    } catch (error) {
      console.error("Error fetching talents:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...talents];

    // Filter by status (show archived if toggle is on)
    if (!showArchived) {
      filtered = filtered.filter((t) => t.status === "active");
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.basicInfo.firstName.toLowerCase().includes(query) ||
          t.basicInfo.lastName.toLowerCase().includes(query) ||
          t.basicInfo.email.toLowerCase().includes(query) ||
          `${t.basicInfo.city}, ${t.basicInfo.state}`.toLowerCase().includes(query)
      );
    }

    // Admin tag filter
    if (adminTagFilter.length > 0) {
      filtered = filtered.filter((t) => {
        if (adminTagFilter.includes("untagged")) {
          return !t.adminTag || adminTagFilter.includes(t.adminTag);
        }
        return t.adminTag && adminTagFilter.includes(t.adminTag);
      });
    }

    // Ethnicity filter
    if (ethnicityFilter.length > 0) {
      filtered = filtered.filter((t) =>
        t.appearance.ethnicity.some((eth) => ethnicityFilter.includes(eth))
      );
    }

    // Hair color filter
    if (hairColorFilter !== "all") {
      filtered = filtered.filter((t) => t.appearance.hairColor === hairColorFilter);
    }

    // Height range filter
    if (minHeight || maxHeight) {
      filtered = filtered.filter((t) => {
        const heightInInches = parseHeightToInches(t.appearance.height);
        const minHeightInches = minHeight ? parseHeightToInches(minHeight) : 0;
        const maxHeightInches = maxHeight ? parseHeightToInches(maxHeight) : 999;
        return heightInInches >= minHeightInches && heightInInches <= maxHeightInches;
      });
    }

    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((t) => t.appearance.gender === genderFilter);
    }

    // Location filter
    if (locationFilter) {
      const locQuery = locationFilter.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.basicInfo.city.toLowerCase().includes(locQuery) ||
          t.basicInfo.state.toLowerCase().includes(locQuery)
      );
    }

    // Age range filter
    if (ageRangeFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((t) => {
        const birthDate = new Date(t.appearance.dateOfBirth);
        const age = now.getFullYear() - birthDate.getFullYear();

        switch (ageRangeFilter) {
          case "18-25":
            return age >= 18 && age <= 25;
          case "26-35":
            return age >= 26 && age <= 35;
          case "36-45":
            return age >= 36 && age <= 45;
          case "46-55":
            return age >= 46 && age <= 55;
          case "56+":
            return age >= 56;
          default:
            return true;
        }
      });
    }

    // Sort
    if (sortBy === "name") {
      filtered.sort((a, b) =>
        `${a.basicInfo.firstName} ${a.basicInfo.lastName}`.localeCompare(
          `${b.basicInfo.firstName} ${b.basicInfo.lastName}`
        )
      );
    } else {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    setFilteredTalents(filtered);
  }

  // Helper function to parse height string (e.g., "5'10\"" or "5'10") to inches
  function parseHeightToInches(height: string): number {
    const match = height.match(/(\d+)'?\s*(\d+)?/);
    if (match) {
      const feet = parseInt(match[1]);
      const inches = match[2] ? parseInt(match[2]) : 0;
      return feet * 12 + inches;
    }
    return 0;
  }

  function calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Helper functions for multi-select filters
  function toggleAdminTagFilter(tag: string) {
    setAdminTagFilter((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function toggleEthnicityFilter(ethnicity: string) {
    setEthnicityFilter((prev) =>
      prev.includes(ethnicity)
        ? prev.filter((e) => e !== ethnicity)
        : [...prev, ethnicity]
    );
  }

  function clearAllFilters() {
    setSearchQuery("");
    setGenderFilter("all");
    setAgeRangeFilter("all");
    setLocationFilter("");
    setAdminTagFilter([]);
    setEthnicityFilter([]);
    setHairColorFilter("all");
    setMinHeight("");
    setMaxHeight("");
    setShowArchived(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
          <p
            className="mt-4 text-lg text-secondary"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Loading talent database...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold text-secondary mb-2"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              Talent{" "}
              <span className="bg-gradient-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Database
              </span>
            </h1>
            <p
              className="text-base text-secondary-light"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Search, filter, and manage all talent profiles
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-4 border-2 border-accent shadow-[0_0_20px_rgba(95,101,196,0.1)]">
            <p
              className="text-sm text-secondary-light mb-1"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Total Talent
            </p>
            <p
              className="text-3xl font-bold text-secondary"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              {stats.total}
            </p>
          </div>
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-4 border-2 border-accent shadow-[0_0_20px_rgba(95,101,196,0.1)]">
            <p
              className="text-sm text-secondary-light mb-1"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              New This Month
            </p>
            <p
              className="text-3xl font-bold text-accent"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              {stats.newThisMonth}
            </p>
          </div>
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-4 border-2 border-accent shadow-[0_0_20px_rgba(95,101,196,0.1)]">
            <p
              className="text-sm text-secondary-light mb-1"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Active Profiles
            </p>
            <p
              className="text-3xl font-bold text-green-600"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              {stats.active}
            </p>
          </div>
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-4 border-2 border-accent shadow-[0_0_20px_rgba(95,101,196,0.1)]">
            <p
              className="text-sm text-secondary-light mb-1"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Complete Profiles
            </p>
            <p
              className="text-3xl font-bold text-purple-600"
              style={{ fontFamily: "var(--font-galindo)" }}
            >
              {stats.complete}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)] mb-8">
          {/* Search Bar and Show Archived Toggle */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <label
                className="block text-sm font-medium text-secondary mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Search
              </label>
              <input
                type="text"
                placeholder="Name, email, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="w-4 h-4 text-accent border-2 border-accent/30 rounded focus:ring-accent"
                />
                <span
                  className="text-sm font-medium text-secondary"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Show Archived Profiles
                </span>
              </label>
            </div>
          </div>

          {/* Admin Tag Filter */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium text-secondary mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Admin Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {["green", "yellow", "red", "untagged"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleAdminTagFilter(tag)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    adminTagFilter.includes(tag)
                      ? tag === "green"
                        ? "bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        : tag === "yellow"
                        ? "bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                        : tag === "red"
                        ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        : "bg-gray-500 text-white shadow-[0_0_15px_rgba(107,114,128,0.3)]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Gender Filter */}
            <div>
              <label
                className="block text-sm font-medium text-secondary mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Gender
              </label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <option value="all">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>

            {/* Age Range Filter */}
            <div>
              <label
                className="block text-sm font-medium text-secondary mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Age Range
              </label>
              <select
                value={ageRangeFilter}
                onChange={(e) => setAgeRangeFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <option value="all">All Ages</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-55">46-55</option>
                <option value="56+">56+</option>
              </select>
            </div>

            {/* Hair Color Filter */}
            <div>
              <label
                className="block text-sm font-medium text-secondary mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Hair Color
              </label>
              <select
                value={hairColorFilter}
                onChange={(e) => setHairColorFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <option value="all">All</option>
                <option value="Black">Black</option>
                <option value="Brown">Brown</option>
                <option value="Blonde">Blonde</option>
                <option value="Red">Red</option>
                <option value="Gray">Gray</option>
                <option value="White">White</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label
                className="block text-sm font-medium text-secondary mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "date")}
                className="w-full px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <option value="date">Newest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Ethnicity Multi-Select */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium text-secondary mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Ethnicity
            </label>
            <div className="flex flex-wrap gap-2">
              {["White/Caucasian", "Black/African American", "Hispanic/Latino", "Asian", "Native American", "Pacific Islander", "Middle Eastern", "Mixed/Multiracial", "Other"].map((ethnicity) => (
                <button
                  key={ethnicity}
                  onClick={() => toggleEthnicityFilter(ethnicity)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    ethnicityFilter.includes(ethnicity)
                      ? "bg-accent text-white shadow-[0_0_10px_rgba(95,101,196,0.3)]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {ethnicity}
                </button>
              ))}
            </div>
          </div>

          {/* Height Range */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-secondary mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
              >
              Height Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Min (e.g., 5'4)"
                value={minHeight}
                onChange={(e) => setMinHeight(e.target.value)}
                className="px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
              />
              <input
                type="text"
                placeholder="Max (e.g., 6'2)"
                value={maxHeight}
                onChange={(e) => setMaxHeight(e.target.value)}
                className="px-4 py-2 border-2 border-accent/30 rounded-lg focus:outline-none focus:border-accent transition-colors"
                style={{ fontFamily: "var(--font-outfit)" }}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || genderFilter !== "all" || ageRangeFilter !== "all" || adminTagFilter.length > 0 || ethnicityFilter.length > 0 || hairColorFilter !== "all" || minHeight || maxHeight || showArchived) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearAllFilters}
                className="text-sm text-accent hover:text-accent/80 font-medium"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p
            className="text-sm text-secondary-light"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Showing {filteredTalents.length} of {talents.length} profiles
          </p>
        </div>

        {/* Talent Grid */}
        {filteredTalents.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-secondary-light/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p
              className="text-secondary-light"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              No talent profiles found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTalents.map((talent) => {
              // Handle both nested and direct array structure
              const photoArray = Array.isArray(talent.photos)
                ? talent.photos
                : (talent.photos as any)?.photos;

              const headshotPhoto = photoArray?.find?.((p: any) => p.type === "headshot");
              const photoUrl = headshotPhoto?.url || photoArray?.[0]?.url;
              const age = calculateAge(talent.appearance.dateOfBirth);

              // Determine border and shadow based on admin tag
              let borderClass = "border-accent/20";
              let shadowClass = "shadow-[0_0_20px_rgba(95,101,196,0.1)]";
              let hoverBorderClass = "hover:border-accent";
              let hoverShadowClass = "hover:shadow-[0_0_30px_rgba(95,101,196,0.25)]";

              if (talent.adminTag === "green") {
                borderClass = "border-green-400/60";
                shadowClass = "shadow-[0_0_25px_rgba(34,197,94,0.3)]";
                hoverBorderClass = "hover:border-green-500";
                hoverShadowClass = "hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]";
              } else if (talent.adminTag === "yellow") {
                borderClass = "border-yellow-400/60";
                shadowClass = "shadow-[0_0_25px_rgba(234,179,8,0.3)]";
                hoverBorderClass = "hover:border-yellow-500";
                hoverShadowClass = "hover:shadow-[0_0_40px_rgba(234,179,8,0.5)]";
              } else if (talent.adminTag === "red") {
                borderClass = "border-red-400/60";
                shadowClass = "shadow-[0_0_25px_rgba(239,68,68,0.3)]";
                hoverBorderClass = "hover:border-red-500";
                hoverShadowClass = "hover:shadow-[0_0_40px_rgba(239,68,68,0.5)]";
              }

              return (
                <Link
                  key={talent.id}
                  href={`/admin/talent/${talent.id}`}
                  className={`bg-gradient-to-br from-white to-purple-50/30 rounded-xl border-2 ${borderClass} ${shadowClass} ${hoverBorderClass} ${hoverShadowClass} transition-all duration-300 overflow-hidden group`}
                >
                  {/* Photo */}
                  <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`${talent.basicInfo.firstName} ${talent.basicInfo.lastName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                        <svg
                          className="w-24 h-24 text-secondary-light/30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className="text-lg font-bold text-secondary mb-2"
                      style={{ fontFamily: "var(--font-galindo)" }}
                    >
                      {talent.basicInfo.firstName} {talent.basicInfo.lastName}
                    </h3>
                    <div
                      className="space-y-1 text-sm text-secondary-light"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      <p>
                        {talent.appearance.gender} • {age} years
                      </p>
                      <p>
                        {talent.basicInfo.city}, {talent.basicInfo.state}
                      </p>
                      <p>
                        {talent.appearance.height} • {talent.appearance.weight} lbs
                      </p>
                      <p className="text-xs text-accent font-medium mt-2">
                        {talent.photos?.length || 0} photos
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

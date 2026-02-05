"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import * as XLSX from "exceljs";
import type { Booking } from "@/types/booking";
import { logger } from "@/lib/logger";
import { getProjects } from "@/lib/supabase/casting";
import { getRoles } from "@/lib/supabase/casting";
import { getBookedSubmissions } from "@/lib/supabase/submissions";

interface Project {
  id: string;
  title: string;
  shootDates: string;
}

interface Role {
  id: string;
  name: string;
  rate: string;
  date: string;
  location: string;
}

interface SkinRole {
  id: string;
  booking: Booking;
  role: Role;
  callTime: string;
  notes: string;
}

interface SkinHeader {
  productionTitle: string;
  shootDate: string;
  productionDay: string;
  totalDays: string;
  castingCompany: string;
  castingAssociate: string;
  associatePhone: string;
}

export default function SkinsBuilderPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  // Projects and roles for selection
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Header data
  const [skinHeader, setSkinHeader] = useState<SkinHeader>({
    productionTitle: "",
    shootDate: "",
    productionDay: "1",
    totalDays: "1",
    castingCompany: "Set Life Casting",
    castingAssociate: "",
    associatePhone: "",
  });

  // Roles added to skin
  const [skinRoles, setSkinRoles] = useState<SkinRole[]>([]);

  // UI state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      router.push("/admin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch roles when project selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchRoles();
      fetchBookings();
      // Auto-fill production title from project
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        setSkinHeader(prev => ({
          ...prev,
          productionTitle: project.title,
          shootDate: project.shootDates || "",
        }));
      }
    }
  }, [selectedProjectId]);

  async function fetchProjects() {
    try {
      const { data, error } = await getProjects();

      if (error) {
        logger.error("Error fetching projects:", error);
        return;
      }

      if (!data) {
        setProjects([]);
        return;
      }

      // Transform Supabase schema to expected format
      const projectsList = data.map((project) => ({
        id: project.id,
        title: project.title,
        shootDates: project.start_date || "",
      })) as Project[];

      setProjects(projectsList);
    } catch (error) {
      logger.error("Error fetching projects:", error);
    }
  }

  async function fetchRoles() {
    if (!selectedProjectId) return;

    try {
      const { data, error } = await getRoles({ projectId: selectedProjectId });

      if (error) {
        logger.error("Error fetching roles:", error);
        return;
      }

      if (!data) {
        setRoles([]);
        return;
      }

      // Transform Supabase schema to expected format
      const rolesList = data.map((role) => ({
        id: role.id,
        name: role.title, // Supabase uses 'title', UI expects 'name'
        rate: role.pay_rate || "",
        date: role.shoot_dates || "",
        location: role.shoot_location || "",
      })) as Role[];

      setRoles(rolesList);
    } catch (error) {
      logger.error("Error fetching roles:", error);
    }
  }

  async function fetchBookings() {
    if (!selectedProjectId) return;

    try {
      // Fetch booked submissions (replaces bookings collection)
      const { data, error } = await getBookedSubmissions(selectedProjectId);

      if (error) {
        logger.error("Error fetching booked submissions:", error);
        return;
      }

      if (!data) {
        setBookings([]);
        return;
      }

      // Transform Supabase submissions to booking format with talentProfile
      const bookingsList = data.map((submission: any) => {
        const profile = submission.profiles;

        // Build talentProfile object matching expected structure
        const talentProfile = {
          basicInfo: {
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            dateOfBirth: profile.date_of_birth || "",
            location: profile.city && profile.state ? `${profile.city}, ${profile.state}` : "",
          },
          physical: {
            gender: profile.gender || "",
            ethnicity: profile.ethnicity ? (Array.isArray(profile.ethnicity) ? profile.ethnicity : [profile.ethnicity]) : [],
            height: profile.height_feet && profile.height_inches ? `${profile.height_feet}'${profile.height_inches}"` : "",
            weight: profile.weight ? String(profile.weight) : "",
            hairColor: profile.hair_color || "",
            eyeColor: profile.eye_color || "",
            tattoos: profile.has_tattoos || false,
          },
          wardrobe: {
            gender: profile.gender || "",
            shirtSize: profile.shirt_size || undefined,
            pantWaist: profile.pant_waist || undefined,
            pantInseam: profile.pant_inseam || undefined,
            dressSize: profile.dress_size || undefined,
            womensPantSize: profile.womens_pant_size || undefined,
            shoeSize: profile.shoe_size || undefined,
            bust: profile.bust || undefined,
            waist: profile.waist || undefined,
            hips: profile.hips || undefined,
            neck: profile.neck || undefined,
            sleeve: profile.sleeve || undefined,
            jacketSize: profile.jacket_size || undefined,
          },
          experience: {
            actingExperience: profile.acting_experience || false,
            comfortable: profile.comfortable_with || [],
            specialSkills: profile.special_skills || [],
          },
        };

        // Return booking-like object
        return {
          id: submission.id,
          submissionId: submission.id,
          userId: submission.user_id,
          roleId: submission.role_id,
          projectId: submission.project_id,
          status: "confirmed", // Booked submissions are confirmed
          talentProfile: talentProfile,
        } as Booking;
      });

      logger.debug(`✅ Fetched ${bookingsList.length} booked submissions for project`);
      setBookings(bookingsList);
    } catch (error) {
      logger.error("Error fetching bookings:", error);
    }
  }

  function addRoleToSkin() {
    if (!selectedRoleId) {
      alert("Please select a role");
      return;
    }

    logger.debug("🎬 Adding role to skin:", selectedRoleId);
    logger.debug("📋 Available bookings:", bookings.length);
    logger.debug("📋 Bookings roleIds:", bookings.map(b => `${b.roleId} (${b.talentProfile?.basicInfo?.firstName})`));

    // Find the role
    const role = roles.find(r => r.id === selectedRoleId);
    if (!role) {
      logger.error("❌ Role not found:", selectedRoleId);
      return;
    }

    logger.debug("✅ Role found:", role.name);

    // Find the booking for this role
    const booking = bookings.find(b => b.roleId === selectedRoleId);
    if (!booking) {
      logger.error("❌ No booking found for roleId:", selectedRoleId);
      logger.error("Available roleIds in bookings:", bookings.map(b => b.roleId));
      alert("No talent booked for this role. Please book talent from the Submissions page first.");
      return;
    }

    logger.debug("✅ Booking found:", booking.talentProfile?.basicInfo?.firstName, booking.talentProfile?.basicInfo?.lastName);

    // Check if role already added
    if (skinRoles.some(sr => sr.role.id === selectedRoleId)) {
      alert("This role is already in the skin");
      return;
    }

    // Add role to skin
    const newSkinRole: SkinRole = {
      id: `${Date.now()}-${selectedRoleId}`,
      booking,
      role,
      callTime: "",
      notes: "",
    };

    setSkinRoles([...skinRoles, newSkinRole]);
    setSelectedRoleId(""); // Reset selection
    logger.debug("✅ Role added to skin successfully");
  }

  function removeRoleFromSkin(skinRoleId: string) {
    setSkinRoles(skinRoles.filter(sr => sr.id !== skinRoleId));
  }

  function updateRoleField(skinRoleId: string, field: "callTime" | "notes", value: string) {
    setSkinRoles(skinRoles.map(sr =>
      sr.id === skinRoleId ? { ...sr, [field]: value } : sr
    ));
  }

  // Convert ethnicity to code
  function getEthnicityCode(ethnicity: string | string[] | undefined): string {
    let ethValue = "";

    // Handle array or string
    if (Array.isArray(ethnicity) && ethnicity.length > 0) {
      ethValue = ethnicity[0].toLowerCase();
    } else if (ethnicity && typeof ethnicity === 'string') {
      ethValue = ethnicity.toLowerCase();
    } else {
      return "O"; // Default to Other
    }

    // Convert to code
    if (ethValue.includes("caucasian") || ethValue.includes("white")) {
      return "C";
    } else if (ethValue.includes("asian")) {
      return "A";
    } else if (ethValue.includes("african") || ethValue.includes("black")) {
      return "AA";
    } else if (ethValue.includes("hispanic") || ethValue.includes("latino") || ethValue.includes("latina")) {
      return "H";
    } else {
      return "O"; // Other
    }
  }

  async function exportToExcel() {
    if (skinRoles.length === 0) {
      alert("Please add roles to the skin before exporting");
      return;
    }

    setIsExporting(true);

    try {
      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet("Skin");

      // Brand colors
      const brandPurple = "5F65C4"; // Accent color
      const brandGray = "484955"; // Secondary
      const lightGray = "E0E2ED"; // Primary

      // Production Info Header - PURPLE ONLY HERE (merged cells, full width)
      worksheet.mergeCells("A1:J1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = skinHeader.productionTitle || "Production";
      titleCell.font = { bold: true, size: 20, color: { argb: "FFFFFFFF" } }; // White text
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${brandPurple}` } }; // Purple background
      titleCell.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        bottom: { style: "medium" },
        right: { style: "medium" },
      };

      // Set row heights
      worksheet.getRow(1).height = 50; // Tall purple header
      worksheet.getRow(2).height = 25;
      worksheet.getRow(3).height = 25;

      // Column header styling - GRAY, NOT PURPLE
      const headerStyle = {
        font: { bold: true, size: 12, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: `FF${brandGray}` } }, // Gray background
        border: {
          top: { style: "thin" as const },
          left: { style: "thin" as const },
          bottom: { style: "thin" as const },
          right: { style: "thin" as const },
        },
        alignment: { horizontal: "center" as const, vertical: "middle" as const },
      };

      // Production Details (Row 2)
      worksheet.getCell("A2").value = "Shoot Date:";
      worksheet.getCell("A2").font = { bold: true };
      worksheet.getCell("B2").value = skinHeader.shootDate;

      worksheet.getCell("D2").value = "Production Day:";
      worksheet.getCell("D2").font = { bold: true };
      worksheet.getCell("E2").value = `${skinHeader.productionDay} of ${skinHeader.totalDays}`;

      // Casting Info (Row 3)
      worksheet.getCell("A3").value = "Casting Company:";
      worksheet.getCell("A3").font = { bold: true };
      worksheet.getCell("B3").value = skinHeader.castingCompany;

      worksheet.getCell("D3").value = "Casting Associate:";
      worksheet.getCell("D3").font = { bold: true };
      worksheet.getCell("E3").value = skinHeader.castingAssociate;

      worksheet.getCell("G3").value = "Phone:";
      worksheet.getCell("G3").font = { bold: true };
      worksheet.getCell("H3").value = skinHeader.associatePhone;

      // Column headers (Row 4) - Gray background
      const headers = ["No.", "Role", "Last", "First", "Sex", "Ethnicity", "Phone", "Email", "Call Time", "Notes"];
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });

      // Add role data
      skinRoles.forEach((skinRole, index) => {
        const profile = skinRole.booking.talentProfile;

        // ✅ CRITICAL: Check BOTH new physical field AND old appearance field for backwards compatibility
        const ethnicity = profile?.physical?.ethnicity || (profile as any)?.appearance?.ethnicity;

        // ✅ Convert ethnicity to code (C, A, AA, H, O)
        const ethCode = getEthnicityCode(ethnicity);

        logger.debug(`📋 Ethnicity for ${profile?.basicInfo?.firstName}:`, {
          physical: profile?.physical?.ethnicity,
          appearance: (profile as any)?.appearance?.ethnicity,
          code: ethCode
        });

        // ✅ CRITICAL: Check BOTH new physical field AND old appearance field for backwards compatibility
        const gender = (profile?.physical?.gender || (profile as any)?.appearance?.gender)?.toLowerCase() || "";
        let sexValue = "";
        if (gender === "male") {
          sexValue = "M";
        } else if (gender === "female") {
          sexValue = "F";
        } else if (gender) {
          sexValue = gender.charAt(0).toUpperCase();
        }

        logger.debug(`👤 Gender for ${profile?.basicInfo?.firstName}:`, {
          physical: profile?.physical?.gender,
          appearance: (profile as any)?.appearance?.gender,
          final: sexValue
        });

        const row = worksheet.addRow([
          index + 1,
          skinRole.role.name,
          profile?.basicInfo?.lastName || "",
          profile?.basicInfo?.firstName || "",
          sexValue,
          ethCode, // ✅ Using ethnicity code instead of full name
          profile?.basicInfo?.phone || "",
          profile?.basicInfo?.email || "",
          skinRole.callTime,
          skinRole.notes,
        ]);

        // Add borders and center alignment
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };

          // Center align certain columns
          if ([1, 5, 6].includes(colNumber)) { // No., Sex, Ethnicity
            cell.alignment = { horizontal: "center", vertical: "middle" };
          }
        });

        row.height = 25;
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: false }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Add logo WELL BELOW table - 5 rows for clear visual separation
      const lastTableRow = worksheet.rowCount; // Last row with data
      const logoRowIndex = lastTableRow + 4; // Image positioning is 0-indexed, so +4 gives us 5 rows below

      // Fetch and add logo (positioned clearly below table)
      try {
        const logoUrl = "/api/logo";
        const response = await fetch(logoUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch logo");
        }

        const imageBuffer = await response.arrayBuffer();
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: 'jpeg',
        });

        // Place logo - col 4 for center, row is 0-indexed
        worksheet.addImage(imageId, {
          tl: { col: 4, row: logoRowIndex },
          ext: { width: 180, height: 80 },
        });

        logger.debug(`✅ Logo at image row ${logoRowIndex}, table ends at sheet row ${lastTableRow}`);
      } catch (error) {
        logger.error("❌ Logo error:", error);
        const fallbackCell = worksheet.getCell(`E${lastTableRow + 5}`);
        fallbackCell.value = "SET LIFE CASTING";
        fallbackCell.font = { bold: true, size: 14, color: { argb: `FF${brandGray}` } };
        fallbackCell.alignment = { horizontal: "center", vertical: "middle" };
      }
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${skinHeader.productionTitle.replace(/\s+/g, "_")}_Skin.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error("Export error:", error);
      alert("Failed to export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-pink-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-secondary mb-2"
            style={{ fontFamily: "var(--font-galindo)" }}
          >
            Create Skin
          </h1>
          <p
            className="text-base text-secondary-light"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Build your production skin by adding roles with talent information
          </p>
        </div>

        {/* Production Header Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-accent mb-6">
          <h2 className="text-xl font-bold text-secondary mb-4" style={{ fontFamily: "var(--font-galindo)" }}>
            Production Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Production Title"
              value={skinHeader.productionTitle}
              onChange={(e) => setSkinHeader({ ...skinHeader, productionTitle: e.target.value })}
              placeholder="Enter production title"
            />

            <Input
              label="Shoot Date"
              type="date"
              value={skinHeader.shootDate}
              onChange={(e) => setSkinHeader({ ...skinHeader, shootDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              label="Production Day"
              type="number"
              value={skinHeader.productionDay}
              onChange={(e) => setSkinHeader({ ...skinHeader, productionDay: e.target.value })}
              placeholder="1"
            />

            <Input
              label="Total Days"
              type="number"
              value={skinHeader.totalDays}
              onChange={(e) => setSkinHeader({ ...skinHeader, totalDays: e.target.value })}
              placeholder="1"
            />

            <Input
              label="Casting Company"
              value={skinHeader.castingCompany}
              onChange={(e) => setSkinHeader({ ...skinHeader, castingCompany: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Casting Associate Name"
              value={skinHeader.castingAssociate}
              onChange={(e) => setSkinHeader({ ...skinHeader, castingAssociate: e.target.value })}
              placeholder="Enter name"
            />

            <Input
              label="Associate Phone"
              type="tel"
              value={skinHeader.associatePhone}
              onChange={(e) => setSkinHeader({ ...skinHeader, associatePhone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Project Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-accent mb-6">
          <h2 className="text-xl font-bold text-secondary mb-4" style={{ fontFamily: "var(--font-galindo)" }}>
            Select Project
          </h2>

          <Select
            label="Project"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            options={[
              { value: "", label: "Select a project" },
              ...projects.map((project) => ({
                value: project.id,
                label: project.title,
              })),
            ]}
          />
        </div>

        {/* Add Role Section */}
        {selectedProjectId && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-accent mb-6">
            <h2 className="text-xl font-bold text-secondary mb-4" style={{ fontFamily: "var(--font-galindo)" }}>
              Add Role to Skin
            </h2>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Select
                  label="Select Role"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  options={[
                    { value: "", label: "Choose a role" },
                    ...roles.map((role) => ({
                      value: role.id,
                      label: `${role.name} - ${role.rate}`,
                    })),
                  ]}
                />
              </div>

              <Button
                variant="primary"
                onClick={addRoleToSkin}
                disabled={!selectedRoleId}
              >
                Add Role
              </Button>
            </div>
          </div>
        )}

        {/* Roles in Skin */}
        {skinRoles.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-accent mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-secondary" style={{ fontFamily: "var(--font-galindo)" }}>
                Roles in Skin ({skinRoles.length})
              </h2>

              <Button
                variant="primary"
                onClick={exportToExcel}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export to Excel
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {skinRoles.map((skinRole, index) => {
                const profile = skinRole.booking.talentProfile;
                return (
                  <div key={skinRole.id} className="border-2 border-accent/20 rounded-lg p-4 hover:border-accent transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-accent text-white">#{index + 1}</Badge>
                          <h3 className="text-lg font-bold text-secondary">
                            {skinRole.role.name}
                          </h3>
                          <Badge className="bg-green-100 text-green-800">
                            {skinRole.role.rate}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-secondary-light">
                          <div>
                            <span className="font-semibold">Name:</span>{" "}
                            {profile?.basicInfo?.firstName} {profile?.basicInfo?.lastName}
                          </div>
                          <div>
                            <span className="font-semibold">Gender:</span>{" "}
                            {profile?.physical?.gender || (profile as any)?.appearance?.gender || "N/A"}
                          </div>
                          <div>
                            <span className="font-semibold">Ethnicity:</span>{" "}
                            {(() => {
                              const eth = profile?.physical?.ethnicity || (profile as any)?.appearance?.ethnicity;
                              const code = getEthnicityCode(eth);
                              let fullName = "";
                              if (Array.isArray(eth) && eth.length > 0) {
                                fullName = eth.join(", ");
                              } else if (eth && typeof eth === 'string') {
                                fullName = eth;
                              }
                              return fullName ? `${code} (${fullName})` : code;
                            })()}
                          </div>
                          <div>
                            <span className="font-semibold">Phone:</span>{" "}
                            {profile?.basicInfo?.phone || "N/A"}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeRoleFromSkin(skinRole.id)}
                        className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Call Time"
                        type="time"
                        value={skinRole.callTime}
                        onChange={(e) => updateRoleField(skinRole.id, "callTime", e.target.value)}
                        placeholder="9:00 AM"
                      />

                      <Input
                        label="Notes"
                        value={skinRole.notes}
                        onChange={(e) => updateRoleField(skinRole.id, "notes", e.target.value)}
                        placeholder="Add any special notes"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {skinRoles.length === 0 && selectedProjectId && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border-2 border-dashed border-accent/30 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-secondary mb-2" style={{ fontFamily: "var(--font-galindo)" }}>
              No Roles Added Yet
            </h3>
            <p className="text-secondary-light">
              Select a role above and click "Add Role" to start building your skin
            </p>
          </div>
        )}

        {!selectedProjectId && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border-2 border-dashed border-accent/30 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-bold text-secondary mb-2" style={{ fontFamily: "var(--font-galindo)" }}>
              Select a Project
            </h3>
            <p className="text-secondary-light">
              Choose a project to start creating your production skin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

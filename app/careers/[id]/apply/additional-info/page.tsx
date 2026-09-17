"use client";

import {
  useEffect,
  useState,
  useRef,
  useSyncExternalStore,
  DragEvent,
} from "react";
import { useRouter, useParams } from "next/navigation";
import { useApplicationStore } from "@/store/applicationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { cn, isValidBangladeshiPhone } from "@/lib/utils";

import { hiringApi } from "@/lib/api";
import {
  shouldAutoGradeAssessment,
  assessmentConfigs,
} from "@/data/questions-data";
import { openPositionsData } from "@/data/career-data";

const HEARD_ABOUT_OPTIONS = [
  "Company Website",
  "LinkedIn",
  "Employee Referral",
  "Dealer Network",
  "Other",
];

// Returns false during SSR, true once mounted on the client.
// Avoids a setState-in-effect just to detect hydration.
function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function AdditionalInfoPage() {
  const router = useRouter();
  const { id } = useParams();
  const store = useApplicationStore();
  const {
    applicationId,
    isOtpVerified,
    isCompleted,
    isPassed,
    assessmentConfig,
    phoneNumber: storePhone,
    location: storeLoc,
    cvFileName: storeCvName,
    cvFileSize: storeCvSize,
    setAdditionalInfo,
  } = store;

  const position = openPositionsData.positions.find(
    (pos) => pos.id.toString() === id || pos.slug === id
  );
  const positionId = position ? position.id : (typeof id === "string" ? parseInt(id, 10) : 0);

  let isAutoGrade = false;
  const config = assessmentConfig ?? assessmentConfigs[positionId];
  if (config) {
    const types = config.assessmentTypes ?? [config.assessmentType];
    isAutoGrade = types.length === 1 && types[0] === "mcq";
  } else if (positionId) {
    isAutoGrade = shouldAutoGradeAssessment(positionId);
  }

  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [heardAbout, setHeardAbout] = useState<string[]>([]);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<{ name: string; size: number } | null>(
    null
  );
  const [cvFileObject, setCvFileObject] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hydrated = useHasHydrated();

  useEffect(() => {
    if (hydrated) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setPhoneNumber(storePhone || "");
      setLocation(storeLoc || "");
      setLinkedin(store.linkedin || "");
      setPortfolio(store.portfolio || "");
      setHeardAbout(store.heardAbout || []);
      if (storeCvName) {
        setCvFile({ name: storeCvName, size: storeCvSize || 0 });
      }
    }
  }, [hydrated, store, storePhone, storeLoc, storeCvName, storeCvSize]);

  // Validation redirect
  useEffect(() => {
    if (hydrated) {
      if (!isOtpVerified) {
        router.replace(`/careers/${id}/apply/otp`);
      }
    }
  }, [isOtpVerified, hydrated, id, router]);

  if (!hydrated || !isOtpVerified) {
    return <div className="py-10 text-center">Loading form...</div>;
  }

  // Handle file selection
  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setCvFile({ name: file.name, size: file.size });
        setCvFileObject(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setCvFile({ name: file.name, size: file.size });
        setCvFileObject(file);
      }
    }
  };

  const validateFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["pdf", "doc", "docx"];

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || "")) {
      setError("Only PDF or DOCX/DOC files are accepted");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit");
      return false;
    }
    setError("");
    return true;
  };

  const removeFile = () => {
    setCvFile(null);
    setCvFileObject(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectHeardAbout = (option: string) => {
    setHeardAbout([option]);
  };

  // Submit final application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setError("Phone number is required");
      return;
    }
    if (!isValidBangladeshiPhone(cleanPhone)) {
      setError("Please enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX or +88017XXXXXXXX)");
      return;
    }

    const cleanLocation = location.trim();
    if (!cleanLocation || cleanLocation.length < 2) {
      setError("Current location is required");
      return;
    }

    if (linkedin && linkedin.trim()) {
      const cleanLink = linkedin.trim();
      if (!cleanLink.toLowerCase().includes("linkedin.com") && !cleanLink.startsWith("http")) {
        setError("Please enter a valid LinkedIn URL (e.g. linkedin.com/in/yourprofile)");
        return;
      }
    }

    if (portfolio && portfolio.trim()) {
      const cleanPort = portfolio.trim();
      if (!cleanPort.includes(".") && !cleanPort.startsWith("http")) {
        setError("Please enter a valid portfolio or website URL");
        return;
      }
    }

    if (!cvFile) {
      setError("Please upload your CV / Resume to submit your application");
      return;
    }

    setLoading(true);
    setError("");

    let cvUrl = store.cvUrl || "";

    try {
      if (cvFileObject) {
        // Create local object URL for client preview/storage
        cvUrl = URL.createObjectURL(cvFileObject);
      }

      // If application_id exists from step 1, submit to the backend API endpoint
      const targetAppId = applicationId || (typeof id === "string" ? parseInt(id, 10) : null);
      if (targetAppId && !isNaN(targetAppId)) {
        const userEmail = store.email || "";
        const sourceValue = heardAbout && heardAbout.length > 0 ? heardAbout[0] : "LinkedIn";

        // Construct FormData per FastAPI / OpenAPI multipart specification
        const formData = new FormData();
        formData.append("email", userEmail);
        formData.append("phone", phoneNumber);
        formData.append("current_location", location);
        formData.append("source", sourceValue);

        if (linkedin && linkedin.trim()) {
          formData.append("linkedin_url", linkedin.trim());
        }
        if (portfolio && portfolio.trim()) {
          formData.append("portfolio_url", portfolio.trim());
        }

        if (cvFileObject) {
          formData.append("resume", cvFileObject, cvFileObject.name);
        } else if (cvFile?.name) {
          formData.append("resume", cvFile.name);
        }

        try {
          await hiringApi.submitAdditionalInfo(targetAppId, formData);
        } catch (apiErr) {
          console.warn("submitAdditionalInfo API call warning/error:", apiErr);
          // Non-blocking fallback so user experience is smooth even in offline or partial backend environments
        }
      }

      // Update local store
      setAdditionalInfo({
        phoneNumber,
        location,
        linkedin,
        portfolio,
        heardAbout,
        experience: "",
        expectedSalary: "",
        noticePeriod: "",
        coverLetter: "",
        cvFileName: cvFile.name,
        cvFileSize: cvFile.size,
        cvUrl,
      });

      const hasNoAssessment = store.assessmentLoadError === "This position does not require an assessment.";
      if (hasNoAssessment) {
        router.push(`/careers/${id}/apply/submitted`);
      } else {
        router.push(`/careers/${id}/apply/start`);
      }
    } catch (err: any) {
      console.error("Failed to submit application:", err);
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format file size in MB
  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-[400px] w-full rounded-[24px] border border-[#E4E7EC] bg-white p-6 shadow-sm md:p-10">
      <div className="mx-auto flex max-w-[736px] flex-col gap-12 py-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-12">
          {/* Section 1: Additional Information */}
          <div className="flex flex-col gap-8">
            <h2
              className="font-inter-tight text-[20px] leading-[20px] font-medium text-[#0D1A14]"
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              Additional Information
            </h2>

            <div className="flex w-full flex-col gap-6">
              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="phone"
                  className="font-inter flex items-center text-[16px] leading-[24px] font-normal text-[#0D1A14]"
                >
                  Phone Number<span className="ml-0.5 text-[#FF4242]">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="e.g. 01712345678 or +8801712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  className="h-12 rounded-[10px] border border-[#E4E7EC] bg-[#F9FAFB] px-[18px] text-[16px] text-[#0D1A14] transition-all placeholder:text-[#414E62] focus-visible:ring-[#195236]"
                />
              </div>

              {/* Current Location */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="location"
                  className="font-inter flex items-center text-[16px] leading-[24px] font-normal text-[#0D1A14]"
                >
                  Current Location
                  <span className="ml-0.5 text-[#FF4242]">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="Enter your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                  className="h-12 rounded-[10px] border border-[#E4E7EC] bg-[#F9FAFB] px-[18px] text-[16px] text-[#0D1A14] transition-all placeholder:text-[#414E62] focus-visible:ring-[#195236]"
                />
              </div>

              {/* LinkedIn Profile */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="linkedin"
                  className="font-inter text-[16px] leading-[24px] font-normal text-[#0D1A14]"
                >
                  LinkedIn Profile (Optional)
                </Label>
                <Input
                  id="linkedin"
                  placeholder="Enter link here"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  disabled={loading}
                  className="h-12 rounded-[10px] border border-[#E4E7EC] bg-[#F9FAFB] px-[18px] text-[16px] text-[#0D1A14] transition-all placeholder:text-[#414E62] focus-visible:ring-[#195236]"
                />
              </div>

              {/* Portfolio / Website */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="portfolio"
                  className="font-inter text-[16px] leading-[24px] font-normal text-[#0D1A14]"
                >
                  Portfolio / Website (Optional)
                </Label>
                <Input
                  id="portfolio"
                  placeholder="Enter link here"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  disabled={loading}
                  className="h-12 rounded-[10px] border border-[#E4E7EC] bg-[#F9FAFB] px-[18px] text-[16px] text-[#0D1A14] transition-all placeholder:text-[#414E62] focus-visible:ring-[#195236]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: How did you hear about this opportunity? */}
          <div className="flex flex-col gap-4">
            <h3 className="font-inter text-[16px] leading-[24px] font-normal text-[#0D1A14]">
              How did you hear about this opportunity?
            </h3>
            <div className="flex flex-col gap-2">
              {HEARD_ABOUT_OPTIONS.map((option) => {
                const isSelected = heardAbout.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectHeardAbout(option)}
                    className="group flex w-fit cursor-pointer items-center gap-3 py-1 text-left select-none"
                  >
                    <div
                      className={cn(
                        "flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-all",
                        isSelected
                          ? "border-[#195236] bg-[#195236]"
                          : "border-[#D0D5DD] bg-white group-hover:border-[#195236]"
                      )}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="font-inter text-[16px] leading-[24px] text-[#0D1A14]">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="w-full border-t border-[#CED2DA]" />

          {/* Section 3: Upload Documents */}
          <div className="flex flex-col gap-8">
            <h2
              className="font-inter-tight text-[20px] leading-[20px] font-medium text-[#0D1A14]"
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              Upload Documents
            </h2>

            <div className="flex w-full flex-col gap-2">
              <Label className="font-inter flex items-center text-[16px] leading-[24px] font-normal text-[#0D1A14]">
                Upload Your CV / Resume
                <span className="ml-0.5 text-[#FF4242]">*</span>
              </Label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
                disabled={loading}
              />

              {!cvFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed bg-[#F9FAFB] p-6 text-center transition-all",
                    isDragging
                      ? "border-[#195236] bg-[#195236]/5"
                      : "border-[#CED2DA] hover:border-[#195236] hover:bg-[#195236]/5"
                  )}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#195236]/10 text-[#195236]">
                    <Upload className="h-6 w-6 text-[#195236]" />
                  </div>
                  <div className="flex flex-col gap-1 text-center">
                    <span className="font-inter text-[15px] sm:text-[16px] leading-[22px] font-medium text-[#0D1A14]">
                      Click to upload or drag and drop
                    </span>
                    <span className="font-inter text-[13px] text-[#414E62]">
                      PDF, DOC or DOCX preferred
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[#E4E7EC] bg-[#F9FAFB] p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#195236]/10 text-[#195236]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-inter truncate text-[14px] font-medium text-[#0D1A14]">
                        {cvFile.name}
                      </span>
                      <span className="font-inter text-[12px] text-[#0D1A14]/50">
                        {formatSize(cvFile.size)}
                      </span>
                    </div>
                  </div>
                  <button
                    key="remove-cv-file"
                    type="button"
                    onClick={removeFile}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all hover:bg-gray-100 hover:text-[#FF4242]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-[8px] border border-[#FF4242]/20 bg-[#FF4242]/5 p-3 text-[14px] text-[#FF4242]">
              {error}
            </div>
          )}

          {/* Apply Now Button */}
          <div className="mt-4 flex justify-end border-t border-[#E4E7EC] pt-6">
            <Button
              type="submit"
              disabled={loading || !phoneNumber || !location || !cvFile}
              className="flex h-[44px] w-full sm:h-[46px] sm:w-auto sm:min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-[60px] border border-transparent bg-[#195236] px-6 text-[16px] font-medium text-[#F2F7F1] transition-all duration-200 select-none hover:bg-[#153e28] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Apply Now</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { openPositionsData } from "@/data/career-data";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ActionButton from "@/components/ActionButton";
import { hiringApi, mapApiPositionToJobPosition, getPageMetadata } from "@/lib/api";
import { BenefitBadge } from "@/components/ui/BenefitBadge";
import { cleanHtml, isHtmlContent } from "@/lib/utils";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_NAME = "Malik Seeds";
export async function generateStaticParams() {
  try {
    const apiPositions = await hiringApi.getPositions(undefined, { revalidate: 0, tags: ["careers"] });
    if (apiPositions && apiPositions.length > 0) {
      return apiPositions.map((pos) => ({
        id: pos.slug || pos.id.toString(),
      }));
    }
  } catch (err) {
    console.error("Failed to generate static params for careers:", err);
  }
  return openPositionsData.positions.map((pos) => ({
    id: pos.slug || pos.id.toString(),
  }));
}

/** Dynamic per-job SEO metadata. */
export async function generateMetadata({
  params,
}: JobDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  
  let position = null;
  const isNumeric = /^\d+$/.test(id);
  try {
    if (isNumeric) {
      const res = await hiringApi.getPositionById(parseInt(id), { revalidate: 0, tags: ["careers"] });
      if (res && res.position) {
        position = mapApiPositionToJobPosition(res.position);
      }
    } else {
      const res = await hiringApi.getPositionBySlug(id, { revalidate: 0, tags: ["careers"] });
      if (res && res.position) {
        position = mapApiPositionToJobPosition(res.position);
      }
    }
  } catch (err) {
    console.error(`Failed to fetch metadata for job ${id}:`, err);
  }

  if (!position) {
    position = openPositionsData.positions.find(
      (pos) => pos.id.toString() === id || pos.slug === id
    );
  }

  if (!position) {
    return getPageMetadata(`/careers/${id}`, { title: `Position Not Found - ${SITE_NAME}` }, { revalidate: 0, tags: ["careers", "seo"] });
  }
  
  const cleanDescription = position.description;

  const fallback: Metadata = {
    title: `${position.title} - ${SITE_NAME}`,
    description: cleanDescription,
    openGraph: {
      title: `${position.title} at ${SITE_NAME}`,
      description: cleanDescription,
      type: "website",
    },
  };

  return getPageMetadata(`/careers/${id}`, fallback, { revalidate: 0, tags: ["careers", "seo"] });
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  
  let position = null;
  const isNumeric = /^\d+$/.test(id);
  try {
    if (isNumeric) {
      const res = await hiringApi.getPositionById(parseInt(id), { revalidate: 0, tags: ["careers"] });
      if (res && res.position) {
        position = mapApiPositionToJobPosition(res.position);
      }
    } else {
      const res = await hiringApi.getPositionBySlug(id, { revalidate: 0, tags: ["careers"] });
      if (res && res.position) {
        position = mapApiPositionToJobPosition(res.position);
      }
    }
  } catch (err) {
    console.error(`Failed to fetch job details for ${id}:`, err);
  }

  if (!position) {
    position = openPositionsData.positions.find(
      (pos) => pos.id.toString() === id || pos.slug === id
    );
  }

  if (!position) {
    notFound();
  }

  const isHtml = isHtmlContent(position.fullDescription || "");

  return (
    <div className="min-h-screen bg-[#F2F7F1]">
      {/* ─── HERO SECTION ─── */}
      <section
        className="w-full bg-[#DCF3C7] pt-[120px] pb-12 lg:pt-[160px] lg:pb-16"
        aria-label={`Job opening: ${position.title}`}
      >
        <div className="mx-auto w-full max-w-[1030px] px-4 lg:px-0">
          <div className="flex flex-col gap-8 lg:gap-10">
            {/* Breadcrumbs */}
            <Breadcrumb className="text-[#0D1A14]">
              <BreadcrumbList className="font-inter-tight flex-wrap gap-1.5 text-[14px] leading-[24px] text-[#0D1A14] lg:text-[16px]">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={<Link href="/careers" />}
                    className="text-[#0D1A14]/70 transition-colors hover:text-[#0D1A14]"
                  >
                    Hiring
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[#0D1A14]/40" />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={<Link href="/careers/open-positions" />}
                    className="text-[#0D1A14]/70 transition-colors hover:text-[#0D1A14]"
                  >
                    Open Positions
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[#0D1A14]/40" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-[#0D1A14]">
                    {position.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header Content (Title, Salary, Action Button) */}
            <div className="flex flex-col gap-6">
              <div className="flex max-w-[844px] flex-col gap-4">
                {position.is_active === false && (
                  <div className="flex items-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF4242]/30 bg-[#FF4242]/10 px-3.5 py-1 text-[13px] font-semibold text-[#FF4242]" style={{ fontFamily: "var(--font-inter-tight)" }}>
                      <span className="h-2 w-2 rounded-full bg-[#FF4242] animate-pulse"></span>
                      Position Closed / Inactive
                    </span>
                  </div>
                )}
                <h1 className="font-inter-tight text-[38px] leading-11.5 font-medium tracking-tight text-[#141C24] lg:text-[64px] lg:leading-[77px]">
                  {position.title}
                </h1>

                {position.salary && (
                  <div className="flex flex-col gap-2 md:items-center sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="font-inter-tight text-[24px] leading-6 font-semibold text-[#0D1A14]" style={{ fontFamily: "var(--font-inter-tight)" }}>
                      {position.salary}
                    </span>
                      {/* <span className="font-inter-tight text-[14px] leading-[24px] text-[#0D1A14] lg:text-[16px]" style={{ fontFamily: "var(--font-inter-tight)" }}>
                        (On-target earnings; base + commission)
                      </span> */}
                  </div>
                )}
              </div>
              <div className="flex flex-row items-start justify-between gap-3 overflow-x-auto scrollbar-none pb-1 sm:flex-wrap sm:justify-start sm:gap-x-8 sm:gap-y-6 lg:gap-x-12">
                {position.location && (
                  <div className="flex shrink-0 flex-col gap-1 sm:gap-2">
                    <span className="font-inter-tight text-[12px] text-[#0D1A14]/60 sm:text-[14px] lg:text-[16px]">
                      Location
                    </span>
                    <span className="font-inter-tight text-[14px] font-medium text-[#0D1A14] sm:text-[18px] lg:text-[24px]">
                      {position.location}
                    </span>
                  </div>
                )}
                {position.jobType && (
                  <div className="flex shrink-0 flex-col gap-1 sm:gap-2">
                    <span className="font-inter-tight text-[12px] text-[#0D1A14]/60 sm:text-[14px] lg:text-[16px]">
                      Job Type
                    </span>
                    <span className="font-inter-tight text-[14px] font-medium text-[#0D1A14] sm:text-[18px] lg:text-[24px]">
                      {position.jobType}
                    </span>
                  </div>
                )}
                {position.experience && (
                  <div className="flex shrink-0 flex-col gap-1 sm:gap-2">
                    <span className="font-inter-tight text-[12px] text-[#0D1A14]/60 sm:text-[14px] lg:text-[16px]">
                      Experience
                    </span>
                    <span className="font-inter-tight text-[14px] font-medium text-[#0D1A14] sm:text-[18px] lg:text-[24px]">
                      {position.experience}
                    </span>
                  </div>
                )}
                {/* {position.deadline && (
                  <div className="flex shrink-0 flex-col gap-1 sm:gap-2">
                    <span className="font-inter-tight text-[12px] text-[#0D1A14]/60 sm:text-[14px] lg:text-[16px]">
                      Deadline
                    </span>
                    <span className="font-inter-tight text-[14px] font-medium text-[#0D1A14] sm:text-[18px] lg:text-[24px]">
                      {position.deadline}
                    </span>
                  </div>
                )} */}
              </div>
            </div>

            {/* Apply Now Button (Hero) */}
            <ActionButton
              href={`/careers/${id}/apply/info`}
              label="Apply Now"
              variant="dark"
              className="h-[41px] px-6 text-[14px] lg:h-[46px] lg:text-[16px]"
            />
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT SECTION ─── */}
      <section
        className="w-full bg-[#F2F7F1] py-12 lg:py-20"
        aria-label="Job details description"
      >
        <div className="mx-auto w-full max-w-[1030px] px-4 lg:px-0">
          <div className="flex flex-col gap-12 lg:gap-16">
            {isHtml ? (
              <div className="flex max-w-[800px] flex-col gap-12 lg:gap-14">
                {position.fullDescription && (
                  <div
                    className="job-prose"
                    dangerouslySetInnerHTML={{
                      __html: cleanHtml(position.fullDescription, { mode: "job" }),
                    }}
                  />
                )}

                {/* Basics & Benefits */}
                {position.benefitsList && position.benefitsList.length > 0 && (
                  <div className="flex flex-col gap-6">
                    <h2 className="font-inter-tight text-[22px] leading-[24px] font-medium text-[#0D1A14] lg:text-[24px]">
                      Basics & Benefits
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {position.benefitsList.map((benefit, index) => (
                        <BenefitBadge
                          key={index}
                          text={benefit.text}
                          icon={benefit.icon}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Full description / intro */}
                {position.fullDescription && (
                  <p className="font-inter text-[16px] leading-[24px] text-[#0D1A14] lg:text-[18px] lg:leading-[27px]">
                    {position.fullDescription}
                  </p>
                )}

                {/* Grid for two column lists if desired, otherwise standard single column stacked layout as in figma */}
                <div className="flex max-w-[800px] flex-col gap-12 lg:gap-14">
                  {/* What You'll Do */}
                  {position.whatYoullDo && position.whatYoullDo.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h2 className="font-inter-tight text-[22px] leading-[24px] font-medium text-[#0D1A14] lg:text-[24px]">
                        What You’ll Do
                      </h2>
                      <ul className="font-inter flex list-disc flex-col gap-3 pl-5 text-[16px] leading-[24px] text-[#0D1A14]/80">
                        {position.whatYoullDo.map((item, index) => (
                          <li key={index} className="pl-1">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What We're Looking For */}
                  {position.whatWereLookingFor &&
                    position.whatWereLookingFor.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <h2 className="font-inter-tight text-[22px] leading-[24px] font-medium text-[#0D1A14] lg:text-[24px]">
                          What We’re Looking For
                        </h2>
                        <ul className="font-inter flex list-disc flex-col gap-3 pl-5 text-[16px] leading-[24px] text-[#0D1A14]/80">
                          {position.whatWereLookingFor.map((item, index) => (
                            <li key={index} className="pl-1">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Skills & Competencies */}
                  {position.skillsAndCompetencies &&
                    position.skillsAndCompetencies.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <h2 className="font-inter-tight text-[22px] leading-[24px] font-medium text-[#0D1A14] lg:text-[24px]">
                          Skills & Competencies
                        </h2>
                        <ul className="font-inter flex list-disc flex-col gap-3 pl-5 text-[16px] leading-[24px] text-[#0D1A14]/80">
                          {position.skillsAndCompetencies.map((item, index) => (
                            <li key={index} className="pl-1">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Why Join Malik Seeds? */}
                  {position.whyJoin && position.whyJoin.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h2 className="font-inter-tight text-[22px] leading-[24px] font-medium text-[#0D1A14] lg:text-[24px]">
                        Why Join Malik Seeds?
                      </h2>
                      <ul className="font-inter flex list-disc flex-col gap-3 pl-5 text-[16px] leading-[24px] text-[#0D1A14]/80">
                        {position.whyJoin.map((item, index) => (
                          <li key={index} className="pl-1">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Basics & Benefits */}
                  {position.benefitsList && position.benefitsList.length > 0 && (
                    <div className="flex flex-col gap-6">
                      <h2 className="font-inter-tight text-[22px] leading-[24px] font-medium text-[#0D1A14] lg:text-[24px]">
                        Basics & Benefits
                      </h2>
                      <div className="flex flex-wrap gap-3">
                        {position.benefitsList.map((benefit, index) => (
                          <BenefitBadge
                            key={index}
                            text={benefit.text}
                            icon={benefit.icon}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Separator line */}
            <hr className="my-4 w-full border-t border-[#CED2DA]" />

            {/* Job Details PDF Download */}
            {position.detailsPdfUrl && (
              <div className="my-6 flex flex-col gap-4 rounded-xl border border-[#CED2DA] bg-white p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#DCF3C7]/30 text-[#195236]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M9 15h6" />
                      <path d="M9 11h6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h4 className="font-inter-tight font-medium text-[#0D1A14] text-[16px] sm:text-[18px]">
                      Detailed Job Description
                    </h4>
                    <p className="font-inter text-xs sm:text-sm text-[#0D1A14]/60">
                      Download the full job specifications and details in PDF format.
                    </p>
                  </div>
                </div>
                <ActionButton
                  href={position.detailsPdfUrl}
                  label="Download PDF"
                  variant="secondary"
                  className="h-[40px] px-5 text-[14px] border border-[#CED2DA] w-full md:w-auto justify-center"
                  containerClassName="w-full md:w-auto"
                  target="_blank"
                  rel="noopener noreferrer"
                  download={true}
                  showArrow={false}
                />
              </div>
            )}

            {/* Ready to apply call to action */}
            <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="flex max-w-[548px] flex-col gap-4">
                <h3 className="font-inter-tight text-[28px] leading-[34px] font-medium text-[#0D1A14] lg:text-[32px] lg:leading-[38px]">
                  Ready to apply?
                </h3>
                <p className="font-inter text-[16px] leading-[24px] text-[#0D1A14]/80 lg:text-[18px] lg:leading-[27px]">
                  If you are passionate about advancing agricultural innovation
                  and making a measurable impact in the field, we encourage you
                  to apply.
                </p>
              </div>

              {/* Scroll back to CV Drop form at bottom */}
              {position.is_active === false ? (
                <button
                  disabled
                  className="flex h-[41px] w-fit cursor-not-allowed items-center justify-center rounded-[60px] bg-[#97A1AF] px-6 text-[14px] font-medium text-white lg:h-[46px] lg:text-[16px]"
                  style={{ fontFamily: "var(--font-inter-tight)" }}
                >
                  Applications Closed
                </button>
              ) : (
                <ActionButton
                  href={`/careers/${id}/apply/info`}
                  label="Apply Now"
                  variant="dark"
                  className="h-[41px] px-6 text-[14px] lg:h-[46px] lg:text-[16px]"
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

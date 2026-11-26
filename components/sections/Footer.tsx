import Link from "next/link";
import NextImage from "next/image";
import Logo from "@/components/Logo";
import { footerData, FooterLink, SocialLink } from "@/data/sections-data";
import { OFFICE_DETAILS } from "@/data/pages-data";
import { contactApi, homepageApi } from "@/lib/api";

// Common Typography Classes for Scalability
const TYPOGRAPHY = {
  title:
    "font-inter-tight text-[18px] md:text-[24px] font-medium leading-[27px] md:leading-[36px] text-white",
  link: "font-inter-tight text-[14px] md:text-[16px] leading-[21px] md:leading-[24px] text-white/60 transition-colors hover:text-brand-light-green transition-colors",
  label:
    "font-inter-tight text-[16px] md:text-[18px] leading-[19px] md:leading-[22px] text-white/60 font-normal",
  contact:
    "font-inter-tight text-[14px] md:text-[16px] leading-[17px] md:leading-[19px] text-white font-medium hover:text-brand-light-green transition-colors",
} as const;

// Reusable Sub-components for better code quality
const FooterLinkColumn = ({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) => (
  <div className="flex w-44.75 shrink-0 flex-col gap-4 lg:w-54">
    <h3 className={TYPOGRAPHY.title}>{title}</h3>
    <ul className="flex flex-col gap-3 md:gap-4">
      {links.map((link) => (
        <li key={link.label}>
          <Link href={link.href} className={TYPOGRAPHY.link}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ social }: { social: { label: string; href: string } }) => {
  let svgIcon: React.ReactNode = null;

  if (social.label.toLowerCase() === "facebook") {
    svgIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:scale-110">
        <path d="M9.33268 9.0026H10.9993L11.666 6.33594H9.33268V5.0026C9.33268 4.31594 9.33268 3.66927 10.666 3.66927H11.666V1.42927C11.4487 1.4006 10.628 1.33594 9.76135 1.33594C7.95135 1.33594 6.66602 2.4406 6.66602 4.46927V6.33594H4.66602V9.0026H6.66602V14.6693H9.33268V9.0026Z" fill="currentColor" />
      </svg>
    );
  } else if (social.label.toLowerCase() === "linkedin") {
    svgIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:scale-110">
        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" fill="currentColor" />
      </svg>
    );
  } else if (social.label.toLowerCase() === "youtube") {
    svgIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:scale-110">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.9987 2.66797C8.5687 2.66797 9.15336 2.68264 9.72003 2.70664L10.3894 2.73864L11.03 2.77664L11.63 2.8173L12.178 2.85997C12.7728 2.90523 13.3326 3.15892 13.7587 3.57637C14.1848 3.99381 14.4499 4.54823 14.5074 5.14197L14.534 5.4253L14.584 6.03197C14.6307 6.66063 14.6654 7.34597 14.6654 8.0013C14.6654 8.65663 14.6307 9.34197 14.584 9.97063L14.534 10.5773L14.5074 10.8606C14.4499 11.4545 14.1847 12.009 13.7584 12.4264C13.3322 12.8439 12.7723 13.0975 12.1774 13.1426L11.6307 13.1846L11.0307 13.226L10.3894 13.264L9.72003 13.296C9.14658 13.3208 8.57268 13.3337 7.9987 13.3346C7.42471 13.3337 6.85081 13.3208 6.27736 13.296L5.60803 13.264L4.96736 13.226L4.36736 13.1846L3.81936 13.1426C3.22457 13.0974 2.66483 12.8437 2.23873 12.4262C1.81262 12.0088 1.54749 11.4544 1.49003 10.8606L1.46336 10.5773L1.41336 9.97063C1.36259 9.31538 1.33546 8.65851 1.33203 8.0013C1.33203 7.34597 1.3667 6.66063 1.41336 6.03197L1.46336 5.4253L1.49003 5.14197C1.54747 4.54834 1.81251 3.994 2.23847 3.57657C2.66444 3.15914 3.22403 2.90538 3.8187 2.85997L4.36603 2.8173L4.96603 2.77664L5.60736 2.73864L6.2767 2.70664C6.85037 2.68179 7.42449 2.6689 7.9987 2.66797ZM6.66536 6.38463V9.61797C6.66536 9.92597 6.9987 10.118 7.26536 9.96463L10.0654 8.34797C10.1263 8.3129 10.1769 8.26238 10.2121 8.20152C10.2473 8.14066 10.2658 8.0716 10.2658 8.0013C10.2658 7.931 10.2473 7.86194 10.2121 7.80108C10.1769 7.74022 10.1263 7.68971 10.0654 7.65463L7.26536 6.03863C7.20454 6.00352 7.13554 5.98503 7.0653 5.98505C6.99506 5.98506 6.92607 6.00356 6.86525 6.0387C6.80444 6.07384 6.75395 6.12437 6.71886 6.18521C6.68377 6.24606 6.66532 6.31507 6.66536 6.3853V6.38463Z" fill="currentColor" />
      </svg>
    );
  }

  if (!svgIcon) return null;

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-all duration-200 hover:border-[#75BC43] hover:bg-[#75BC43]/10 hover:text-[#75BC43]"
    >
      {svgIcon}
    </a>
  );
};

export default async function Footer() {
  let contactInfo = null;
  try {
    const data = await contactApi.getContact({ revalidate: 60 });
    contactInfo = data || null;
  } catch (err) {
    console.error("Failed to fetch contact details for footer:", err);
  }

  const BRAND_ROUTES = [
    "/our-brands/vegetable-seeds",
    "/our-brands/potato-seeds",
    "/our-brands/maliks-farm",
    "/our-brands/origene",
    "/our-brands/maliks-flower",
    "/our-brands/innovation-development",
  ];

  let brands: FooterLink[] = [];
  try {
    const services = await homepageApi.getServices({ revalidate: 60 });
    if (services && services.length > 0) {
      brands = services.map((s, idx) => ({
        label: s.title,
        href: BRAND_ROUTES[idx] || "/our-brands",
      }));
    }
  } catch (err) {
    console.error("Failed to fetch services/brands for footer:", err);
  }

  // Fallback to static brands data if API fetch fails or is empty
  const displayBrands = brands.length > 0 ? brands : footerData.links.brands;

  // Dynamically map social icons based on API data
  const socials: { label: string; href: string }[] = [];
  if (contactInfo) {
    if (contactInfo.facebook_url) {
      socials.push({
        label: "Facebook",
        href: contactInfo.facebook_url,
      });
    }
    if (contactInfo.youtube_url) {
      socials.push({
        label: "YouTube",
        href: contactInfo.youtube_url,
      });
    }
    if (contactInfo.linkedin_url) {
      socials.push({
        label: "LinkedIn",
        href: contactInfo.linkedin_url,
      });
    }
  }

  // Fallback if no socials returned from API
  const displaySocials =
    socials.length > 0
      ? socials
      : [];

  const phoneLabel = contactInfo?.phone_primary || footerData.contact.phone.label;
  const phoneHref = contactInfo?.phone_primary ? `tel:${contactInfo.phone_primary}` : footerData.contact.phone.href;
  const emailLabel = contactInfo?.email_primary || footerData.contact.email.label;
  const emailHref = contactInfo?.email_primary ? `mailto:${contactInfo.email_primary}` : footerData.contact.email.href;
  const address = contactInfo?.address || OFFICE_DETAILS.address;

  return (
    <footer
      className="bg-brand-dark w-full py-12 text-white md:py-21"
      id="footer"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-25">
        {/* Top Content Layout */}
        <div className="flex w-full flex-col items-start justify-between gap-10 xl:flex-row xl:gap-0">
          {/* Left Block: Identity & Mission */}
          <div className="flex w-full shrink-0 flex-col xl:w-102.25">
            <div className="inline-block">
              <Logo light={true} showText={true} className="h-auto w-55 md:w-67.5" />
            </div>

            <p className="font-inter text-brand-light-green/70 mt-4 text-[16px] leading-6 font-normal md:mt-6 md:text-[18px] md:leading-6.75">
              {contactInfo?.footer_description || footerData.mission}
            </p>

            <div className="mt-8 flex flex-col gap-4 xl:mt-16.75">
              <span className={TYPOGRAPHY.label}>
                {footerData.followUsText}
              </span>
              <div className="flex gap-2">
                {displaySocials.map((social) => (
                  <SocialIcon key={social.label} social={social} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Block: Sitemap & Contact */}
          <div className="mt-10 flex w-full flex-col items-start justify-between gap-10 lg:mt-0 lg:w-183.25 lg:flex-row lg:gap-10">
            {/* Navigation Grid */}
            <div className="flex w-full max-w-100 justify-between lg:contents lg:max-w-none">
              <FooterLinkColumn
                title="Company"
                links={footerData.links.company}
              />
              <FooterLinkColumn
                title="Our Brands"
                links={displayBrands}
              />
            </div>

            {/* Contact Information */}
            <address className="flex w-full shrink-0 flex-col gap-4 not-italic md:gap-6 lg:mt-0 lg:w-54">
                <div className="flex flex-col gap-2 md:gap-4">
                  <h4 className={TYPOGRAPHY.label}>Address</h4>
                <p  className={TYPOGRAPHY.contact}>{address}</p>
                </div>
              <div className="flex flex-col gap-2 md:gap-4">
                <h4 className={TYPOGRAPHY.label}>Contact</h4>
                <a
                  href={phoneHref}
                  className={TYPOGRAPHY.contact}
                >
                  {phoneLabel}
                </a>
              </div>

              <div className="flex flex-col gap-2 md:gap-4">
                <h4 className={TYPOGRAPHY.label}>Email</h4>
                <a
                  href={emailHref}
                  className={`${TYPOGRAPHY.contact} break-all`}
                >
                  {emailLabel}
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Global Brand Wordmark */}
        <div className="mt-12 flex w-full justify-center xl:mt-24">
          <NextImage
            src={footerData.wordmark}
            alt="Malik Seeds Wordmark"
            width={1225}
            height={151}
            className="h-auto w-full max-w-89.5 md:max-w-306.25"
            priority
          />
        </div>
      </div>
    </footer>
  );
}

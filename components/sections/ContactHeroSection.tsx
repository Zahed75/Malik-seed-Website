"use client";

import React, { useState, useId, FormEvent, useRef, useEffect } from "react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { OFFICE_DETAILS, SUBJECT_OPTIONS } from "@/data/pages-data";
import { SectionBadge } from "@/components/ui/SectionBadge";
import { ApiContactInfo, contactApi } from "@/lib/api";

// ---------------------------------------------------------------------------
// Constants & Static Configurations (Architectural Cleanliness)
// ---------------------------------------------------------------------------

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

// Strict Regex Validations (Production-Grade Security)
const NAME_REGEX = /^[a-zA-Z\s\-'.]{2,80}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

const INPUT_BASE_CLASS =
  "h-12 w-full rounded-xl bg-overlay-input-bg border px-[18px] text-sm leading-[21px] font-normal text-white placeholder:text-[#E4E7EC] placeholder:opacity-60 focus:outline-none focus:ring-1 transition-all disabled:opacity-50";

const TEXTAREA_BASE_CLASS =
  "h-[190px] w-full rounded-2xl bg-overlay-input-bg border px-6 pt-5 text-sm leading-[21px] font-normal text-white placeholder:text-[#E4E7EC] placeholder:opacity-60 focus:outline-none focus:ring-1 transition-all resize-none disabled:opacity-50";

// Helper to determine border style based on error state
const getBorderClass = (hasError: boolean) =>
  hasError
    ? "border-brand-error focus:border-brand-error focus:ring-brand-error"
    : "border-overlay-input-border focus:border-brand-secondary focus:ring-brand-secondary";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContactHeroSection({
  apiData,
}: {
  apiData?: ApiContactInfo | null;
}) {
  const info = apiData;

  const subjectOptions = ["Choose an option", ...(info?.subject_options || SUBJECT_OPTIONS)];

  // Unique accessible IDs
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const subjectId = useId();
  const messageId = useId();

  // Focus tracking elements (A11y focus management)
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  // Track if the form has ever been submitted to avoid focusing on initial mount
  const hasSubmittedRef = useRef(false);

  // Focus modal button when it opens, and restore submit button focus when it closes
  useEffect(() => {
    if (isSubmitted) {
      hasSubmittedRef.current = true;
      continueButtonRef.current?.focus();
    } else if (hasSubmittedRef.current) {
      // Only restore focus to submit button after an actual submission, not on mount
      submitButtonRef.current?.focus();
    }
  }, [isSubmitted]);

  const handleChange =
    (field: keyof FormState) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Dynamically clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const newErrors: Partial<Record<keyof FormState, string>> = {};

    // 1. Sanitization (XSS Prevention & Blank Trim)
    const sanitizedName = formData.name.trim();
    const sanitizedEmail = formData.email.trim();
    const sanitizedPhone = formData.phone.trim();
    const sanitizedSubject = formData.subject.trim();
    const sanitizedMessage = formData.message.trim();

    // 2. Strict Validations
    if (!sanitizedName) {
      newErrors.name = "Name is required.";
    } else if (!NAME_REGEX.test(sanitizedName)) {
      newErrors.name = "Please enter a valid name (letters and spaces only).";
    }

    if (!sanitizedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(sanitizedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!sanitizedPhone) {
      newErrors.phone = "Phone number is required.";
    } else if (!PHONE_REGEX.test(sanitizedPhone)) {
      newErrors.phone = "Please enter a valid phone number (7-20 digits).";
    }

    if (!sanitizedSubject) {
      newErrors.subject = "Please select a inquiry subject.";
    }

    if (!sanitizedMessage) {
      newErrors.message = "Message content is required.";
    } else if (sanitizedMessage.length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    } else if (sanitizedMessage.length > 2000) {
      newErrors.message = "Message must not exceed 2000 characters.";
    }

    // Abort if validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Auto-focus the first invalid field for better UX/Keyboard navigation
      const firstErrorField = Object.keys(newErrors)[0] as keyof FormState;
      let fieldElement: HTMLElement | null = null;
      if (firstErrorField === "name")
        fieldElement = document.getElementById(nameId);
      if (firstErrorField === "email")
        fieldElement = document.getElementById(emailId);
      if (firstErrorField === "phone")
        fieldElement = document.getElementById(phoneId);
      if (firstErrorField === "subject")
        fieldElement = document.getElementById(subjectId);
      if (firstErrorField === "message")
        fieldElement = document.getElementById(messageId);
      fieldElement?.focus();
      return;
    }

    setIsSubmitting(true);

    contactApi
      .submitContact({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        subject: sanitizedSubject,
        message: sanitizedMessage,
      })
      .then(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      })
      .catch((err) => {
        setIsSubmitting(false);
        console.error("Failed to submit contact form:", err);
        setErrors((prev) => ({
          ...prev,
          message:
            err instanceof Error
              ? err.message
              : "Failed to submit the contact form. Please try again later.",
        }));
      });
  };
  return (
    <section className="bg-brand-dark relative min-h-fit w-full pt-[120px] pb-16 text-white md:pt-[180px] md:pb-[100px]">
      <div className="mx-auto w-full max-w-[1240px] px-4 xl:px-0">
        <div className="flex w-full flex-col items-start justify-between gap-10 lg:flex-row lg:gap-8 xl:gap-14">
          {/* Left Column — Badge, H1 Title, Head Office Card */}
          <div className="flex w-full flex-col gap-8 lg:flex-1 lg:gap-12 xl:w-152 xl:flex-none">
            {/* Pill & Title container */}
            <div className="flex w-full flex-col items-start gap-6 lg:gap-8">
              <SectionBadge variant="dark" showDot>
                {OFFICE_DETAILS.badgeText}
              </SectionBadge>

              {/* H1 Heading — Figma: 64px (desktop) / 38px (mobile) */}
              <h1 className="contact-page-hero-title white-space w-full leading-[120%] font-medium tracking-tight text-white lg:max-w-md xl:max-w-none">
                {info?.description}
              </h1>
            </div>

            {/* Address Card — Figma: 608x274 (desktop) / 358x224 (mobile), bg #DCF3C7 */}
            <address className="bg-brand-mint-green text-brand-dark relative flex w-full flex-col items-start rounded-[20px] p-6 not-italic lg:w-full lg:rounded-[24px] lg:px-8 lg:py-8 xl:h-[274px] xl:w-[608px] xl:px-[41px] xl:py-8">
              <div className="relative flex w-full flex-col items-start gap-6">
                {/* Office Type Label — Figma: 18px (desktop) / 14px (mobile) */}
                <div className="text-card-label text-brand-dark font-medium tracking-tight opacity-90">
                  {OFFICE_DETAILS.officeLabel}
                </div>

                <div className="relative flex w-full flex-col items-start gap-6 lg:gap-8">
                  {/* Company Name & Address */}
                  <div className="relative inline-flex flex-col items-start gap-2.5">
                    {/* Malik Seeds Ltd. Title — Figma: 30px (desktop) / 28px (mobile) */}
                    <div className="text-card-title text-brand-dark font-medium tracking-tight">
                      {info?.title}
                    </div>
                    {/* Address Text — Figma: 16px */}
                    <p className="text-brand-dark text-[16px] leading-[1.25] font-normal opacity-90">
                      {info?.address}
                    </p>
                  </div>

                  {/* Icon List — Phone & Email with 60x60 base SVGs rendered at 30x30 */}
                  <div className="relative flex w-full flex-col gap-3">
                    {/* Phone link */}
                    <div className="relative flex w-full  items-center gap-2.5">
                      <div className="h-[30px] w-[30px] p-[8px] bg-brand-active justify-center items-center flex rounded-md shrink-0">
                        <OptimizedImage
                          src="/images/contact/phone.svg"
                          alt="Phone Icon"
                          width={14}
                          height={14}
                          className="shrink-0"
                        />
                      </div>
                      <a
                        href={`tel:${info?.phone_primary}`}
                        className="text-brand-dark text-[16px] leading-[19.2px] font-normal hover:underline focus:outline-none inline-flex flex-wrap items-center gap-x-1.5"
                      >
                        <span className="opacity-80">
                          {OFFICE_DETAILS.phone.label}
                        </span>
                        <span className="font-medium">
                          {info?.phone_primary }
                        </span>
                      </a>
                    </div>

                    {/* Email link */}
                    <div className="relative flex w-full items-center gap-2.5">
                      <div className="h-[30px] w-[30px] p-[8px] bg-brand-active justify-center items-center flex rounded-md shrink-0">
                        <OptimizedImage
                          src="/images/contact/email.svg"
                          alt="Email Icon"
                          width={14}
                          height={14}
                          className="shrink-0"
                        />
                      </div>
                      <a
                        href={`mailto:${info?.email_primary || OFFICE_DETAILS.email.href.replace("mailto:", "")}`}
                        className="text-brand-dark text-[16px] leading-[19.2px] font-normal hover:underline focus:outline-none inline-flex flex-wrap items-center gap-x-1.5"
                      >
                        <span className="opacity-80">
                          {OFFICE_DETAILS.email.label}
                        </span>
                        <span className="font-medium">
                          {info?.email_primary}
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </address>
          </div>

          {/* Right Column — Form */}
          <div className="w-full lg:flex-1 xl:w-xl xl:max-w-xl xl:flex-none">
            <form
              className="flex w-full flex-col items-start gap-8"
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
            >
              <div className="flex w-full flex-col gap-6">
                {/* Name field */}
                <div className="flex w-full flex-col gap-3">
                  <label
                    htmlFor={nameId}
                    className="inline-flex items-center gap-0.5"
                  >
                    <span className="text-form-label text-white">Name</span>
                    <span
                      className="text-brand-error font-medium"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange("name")}
                    placeholder="Enter your name"
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? `${nameId}-error` : undefined
                    }
                    className={`${INPUT_BASE_CLASS} ${getBorderClass(!!errors.name)}`}
                  />
                  {errors.name && (
                    <span
                      id={`${nameId}-error`}
                      role="alert"
                      className="text-brand-error text-xs font-normal"
                    >
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Email address field */}
                <div className="flex w-full flex-col gap-3">
                  <label
                    htmlFor={emailId}
                    className="inline-flex items-center gap-0.5"
                  >
                    <span className="text-form-label text-white">
                      Email Address
                    </span>
                    <span
                      className="text-brand-error font-medium"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    placeholder="Enter your email address"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? `${emailId}-error` : undefined
                    }
                    className={`${INPUT_BASE_CLASS} ${getBorderClass(!!errors.email)}`}
                  />
                  {errors.email && (
                    <span
                      id={`${emailId}-error`}
                      role="alert"
                      className="text-brand-error text-xs font-normal"
                    >
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Phone number field */}
                <div className="flex w-full flex-col gap-3">
                  <label
                    htmlFor={phoneId}
                    className="inline-flex items-center gap-0.5"
                  >
                    <span className="text-form-label text-white">
                      Phone Number
                    </span>
                    <span
                      className="text-brand-error font-medium"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    required
                    disabled={isSubmitting}
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    placeholder="Enter your Phone Number"
                    aria-invalid={!!errors.phone}
                    aria-describedby={
                      errors.phone ? `${phoneId}-error` : undefined
                    }
                    className={`${INPUT_BASE_CLASS} ${getBorderClass(!!errors.phone)}`}
                  />
                  {errors.phone && (
                    <span
                      id={`${phoneId}-error`}
                      role="alert"
                      className="text-brand-error text-xs font-normal"
                    >
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Subject dropdown */}
                <div className="flex w-full flex-col gap-3">
                  <label
                    htmlFor={subjectId}
                    className="inline-flex items-center gap-0.5"
                  >
                    <span className="text-form-label text-white">Subject</span>
                    <span
                      className="text-brand-error font-medium"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <div className="relative w-full">
                    <select
                      id={subjectId}
                      name="subject"
                      required
                      disabled={isSubmitting}
                      value={formData.subject}
                      onChange={handleChange("subject")}
                      aria-invalid={!!errors.subject}
                      aria-describedby={
                        errors.subject ? `${subjectId}-error` : undefined
                      }
                      className={`cursor-pointer appearance-none pr-12 ${INPUT_BASE_CLASS} ${getBorderClass(
                        !!errors.subject
                      )}`}
                    >
                      {subjectOptions.map((option, index) => (
                        <option
                          key={option}
                          value={index === 0 ? "" : option}
                          disabled={index === 0}
                          className="bg-brand-dark text-white"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                    {/* Chevron down arrow inside selector */}
                    <svg
                      className="text-brand-muted pointer-events-none absolute top-1/2 right-[18px] h-[18px] w-[18px] shrink-0 -translate-y-1/2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {errors.subject && (
                    <span
                      id={`${subjectId}-error`}
                      role="alert"
                      className="text-brand-error text-xs font-normal"
                    >
                      {errors.subject}
                    </span>
                  )}
                </div>

                {/* Message text area */}
                <div className="flex w-full flex-col gap-3">
                  <label
                    htmlFor={messageId}
                    className="inline-flex items-center gap-0.5"
                  >
                    <span className="text-form-label text-white">Message</span>
                    <span
                      className="text-brand-error font-medium"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>
                  <textarea
                    id={messageId}
                    name="message"
                    required
                    disabled={isSubmitting}
                    value={formData.message}
                    onChange={handleChange("message")}
                    placeholder="Type your message here..."
                    aria-invalid={!!errors.message}
                    aria-describedby={
                      errors.message ? `${messageId}-error` : undefined
                    }
                    className={`${TEXTAREA_BASE_CLASS} ${getBorderClass(!!errors.message)}`}
                  />
                  {errors.message && (
                    <span
                      id={`${messageId}-error`}
                      role="alert"
                      className="text-brand-error text-xs font-normal"
                    >
                      {errors.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit button — Figma: 183x46, bg #195236, radius 60px (desktop) */}
              <button
                ref={submitButtonRef}
                type="submit"
                disabled={isSubmitting}
                className="group/button bg-brand-active text-brand-bg text-button hover:bg-brand-primary-hover focus-visible:ring-brand-light-green relative inline-flex h-[41px] w-fit cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-[60px] px-6 font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 active:scale-95 disabled:opacity-50 lg:h-[46px]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Sending...</span>
                  </span>
                ) : (
                  <>
                    <span className="mt-[-0.50px]">Send Message</span>
                    <ArrowIcon
                      size={20}
                      className="stroke-brand-bg transition-transform group-hover/button:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal Overlay */}
      {isSubmitted && (
        <div
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          aria-describedby="success-modal-desc"
        >
          <div className="bg-brand-dark border-overlay-white-border animate-in zoom-in-95 mx-4 flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border p-8 text-center shadow-2xl duration-200">
            {/* Green Circle Checkmark Icon */}
            <div className="bg-brand-mint-green text-brand-dark flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-md">
              <svg
                className="text-brand-active h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col gap-2">
              <h2
                id="success-modal-title"
                className="text-card-title font-medium tracking-tight text-white"
              >
                Message Sent Successfully!
              </h2>
              <p
                id="success-modal-desc"
                className="text-body-small text-brand-muted"
              >
                Thank you for getting in touch. We have received your inquiry
                and our team will get back to you shortly.
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              ref={continueButtonRef}
              onClick={() => setIsSubmitted(false)}
              className="bg-brand-secondary text-brand-dark hover:bg-brand-secondary-hover focus-visible:ring-brand-light-green w-full cursor-pointer rounded-full px-6 py-2.5 font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

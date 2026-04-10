import type { Metadata } from "next";
import { profile, workExperience, certifications } from "@/lib/data/index";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const BASE_URL = "https://manku27.dev";

const sameAs = profile.socials
  .map((s) => s.url)
  .filter((u) => u.startsWith("https://"));

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: BASE_URL,
  name: `${profile.name} — Portfolio`,
  mainEntity: {
    "@type": "Person",
    name: profile.name,
    givenName: "Mayank",
    familyName: "Jhunjhunwala",
    url: BASE_URL,
    email: profile.email,
    jobTitle: profile.title,
    description: profile.shortBio,
    image: `${BASE_URL}/opengraph-image.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kolkata",
      addressCountry: "IN",
    },
    sameAs,
    knowsAbout: profile.skills.flatMap((s) => s.items),
    hasCredential: certifications.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.name,
      credentialCategory: "certification",
      recognizedBy: { "@type": "Organization", name: c.issuer },
    })),
    worksFor: {
      "@type": "Organization",
      name: workExperience[0].company,
      description: workExperience[0].companyDescription,
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Mayank Jhunjhunwala — Senior Fullstack Engineer",
    template: "%s — Mayank Jhunjhunwala",
  },
  description: profile.bio.split("\n")[0].trim(),
  keywords: [
    // Identity
    "Mayank Jhunjhunwala",
    "Manku27",
    "mankuDevJS",
    "manku27.dev",
    // Roles
    "Senior Fullstack Engineer",
    "Senior Software Engineer",
    "Technology Consultant",
    "React Developer",
    "Next.js Developer",
    "Fullstack Developer India",
    // Certifications
    "Contentful Certified Professional",
    "Cloudinary Certified Implementation Specialist",
    "Microsoft Azure Fundamentals",
    // Employers
    "Merkle",
    "Dentsu",
    "Tech Mahindra",
    "Microsoft Bing Ads",
    "PwC India",
    "Infosys",
    // Tech stack
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "React Native",
    "Redux Toolkit",
    "Contentful",
    "Cloudinary",
    "AWS AppSync",
    "Vercel",
    "Azure",
    "PWA",
    "IndexedDB",
    // Long-tail recruiter terms
    "Senior Fullstack Developer India",
    "Remote Developer India",
    "Fullstack Engineer Remote",
    "React Next.js TypeScript developer",
    "Contentful developer",
    "Cloudinary developer",
    // Location
    "Kolkata",
    "India",
    "Kolkata developer",
  ],
  authors: [{ name: "Mayank Jhunjhunwala", url: BASE_URL }],
  creator: "Mayank Jhunjhunwala",
  applicationName: "Mayank Jhunjhunwala Portfolio",
  category: "technology",
  openGraph: {
    type: "profile",
    firstName: "Mayank",
    lastName: "Jhunjhunwala",
    username: "Manku27",
    gender: "Male",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Mayank Jhunjhunwala",
    title: "Mayank Jhunjhunwala — Senior Fullstack Engineer",
    description: profile.shortBio,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Mayank Jhunjhunwala — Senior Fullstack Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mayank Jhunjhunwala — Senior Fullstack Engineer",
    description: profile.shortBio,
    images: ["/opengraph-image.png"],
    creator: "@mankuDevJS",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

// Ensure all structured data has proper @context to prevent runtime errors
export const structuredData: {
  "@context": string;
  "@type": string;
  [key: string]: any;
} = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OpportunIQ",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1250"
  },
  "description": "Expert guidance for every home and auto decision. Know if it's safe, risky, dangerous, or urgent. Upload photos for diagnosis, compare costs, assess timing, find local pros, and track projects with family—in any language.",
  "featureList": [
    "Safety and risk assessment - know if it's dangerous",
    "Urgency analysis - should you act now or wait",
    "Multilingual photo diagnosis (100+ languages)",
    "DIY vs Professional cost comparison",
    "Expert recommendations - when to call a pro",
    "Local vendor discovery",
    "Collaborate with family, friends, roommates, or keep it private",
    "Budget tracking and decision management",
    "Voice, photo, and text input",
    "Real-time expert guidance"
  ],
  "screenshot": "https://opportuniq.app/screenshot.png",
  "softwareVersion": "1.0",
  "availableLanguage": [
    "English",
    "Chinese",
    "Vietnamese",
    "Spanish",
    "French",
    "Portuguese",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi"
  ],
  "inLanguage": "en-US",
  "provider": {
    "@type": "Organization",
    "name": "OpportunIQ",
    "url": "https://opportuniq.app"
  }
};

export const organizationSchema: {
  "@context": string;
  "@type": string;
  [key: string]: any;
} = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OpportunIQ",
  "url": "https://opportuniq.app",
  "logo": "https://opportuniq.app/opportuniq-logo.png",
  "sameAs": [
    "https://twitter.com/opportuniq",
    "https://linkedin.com/company/opportuniq"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": ["en", "es", "zh", "vi", "fr", "pt", "ja", "ko", "ar", "hi"]
  }
};

export const breadcrumbSchema: {
  "@context": string;
  "@type": string;
  [key: string]: any;
} = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opportuniq.app"
    }
  ]
};

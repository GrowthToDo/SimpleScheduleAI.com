<!-- Split out of seo-aeo-simplescheduleai.md on 2026-08-10 for progressive disclosure.
     Content is VERBATIM from the original; the router skill says when to load this file.
     Mechanical rules restated here are ENFORCED by scripts/check-blog.mjs — the gate is
     the authority, this file explains the intent. -->

# Structured data (JSON-LD schema patterns)

## PART 5 — STRUCTURED DATA (JSON-LD SCHEMA)

SUPERSEDED: schema is auto-injected (Article + BreadcrumbList + conditional FAQPage). Never hand-add or stack JSON-LD. This library is background only.

Implement ALL of these on the appropriate pages. Place JSON-LD in `<head>`.
Validate at: https://search.google.com/test/rich-results

### 5.1 Organization Schema (Global — every page)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SimpleScheduleAI",
  "url": "https://simplescheduleai.com",
  "logo": "https://simplescheduleai.com/images/logo.png",
  "description": "AI-native nurse scheduling service for critical access hospitals in Texas.",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "hello@simplescheduleai.com"
  },
  "sameAs": ["https://www.linkedin.com/company/simplescheduleai", "https://twitter.com/simplescheduleai"]
}
```

### 5.2 SoftwareApplication Schema (How It Works / Product page)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SimpleScheduleAI",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Healthcare Scheduling Software",
  "operatingSystem": "Web",
  "url": "https://simplescheduleai.com",
  "description": "AI-powered nurse scheduling software for critical access hospitals.",
  "audience": {
    "@type": "Audience",
    "audienceType": "Nurse Managers, Directors of Nursing, CAH Administrators"
  },
  "featureList": [
    "AI-generated nurse schedules",
    "Three draft options: balanced, fairness-optimized, cost-optimized",
    "Real-time callout replacement shortlist",
    "Excel roster upload",
    "Texas overtime compliance tracking",
    "Audit trail logging"
  ]
}
```

### 5.3 WebSite Schema (Homepage only)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SimpleScheduleAI",
  "url": "https://simplescheduleai.com"
}
```

### 5.4 FAQPage Schema (FAQ sections on product/home pages)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does SimpleScheduleAI handle last-minute nurse callouts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When a nurse calls out, SimpleScheduleAI instantly generates a ranked replacement shortlist from available, qualified staff — factoring in overtime rules, fairness, and Texas compliance. The nurse manager receives the list and can notify replacements directly, reducing coverage time from hours to minutes."
      }
    }
  ]
}
```

### 5.5 BlogPosting Schema (Every blog post)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Post title",
  "description": "Post excerpt",
  "url": "https://simplescheduleai.com/blog/post-slug",
  "datePublished": "2026-03-01T00:00:00Z",
  "dateModified": "2026-03-15T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "jobTitle": "Co-founder, SimpleScheduleAI"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SimpleScheduleAI",
    "logo": { "@type": "ImageObject", "url": "https://simplescheduleai.com/images/logo.png" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://simplescheduleai.com/blog/post-slug" },
  "image": "https://simplescheduleai.com/images/blog/post-image.png",
  "keywords": ["nurse scheduling", "critical access hospital", "CAH staffing"]
}
```

**CRITICAL**: Keep `dateModified` current. Stale dates = AI citation penalty.

### 5.6 BreadcrumbList Schema (All inner pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://simplescheduleai.com" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://simplescheduleai.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Post Title", "item": "https://simplescheduleai.com/blog/post-slug" }
  ]
}
```

### 5.7 HowTo Schema (DO NOT IMPLEMENT - reference only)

Google removed HowTo rich results in 2023. Never add HowTo schema. Kept here for reference only.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up Automated Nurse Scheduling for a Critical Access Hospital",
  "description": "Step-by-step guide to implementing AI-assisted nurse scheduling at a 25-bed CAH.",
  "totalTime": "PT1W",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Upload nurse roster",
      "text": "Export roster to Excel and upload to SimpleScheduleAI."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Configure shift rules",
      "text": "Set shift structure, Texas overtime rules, and facility constraints."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Review three AI-generated drafts",
      "text": "Choose from balanced, fairness-optimized, or cost-optimized schedule."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Publish and distribute",
      "text": "Approve and publish; audit trail logged automatically."
    }
  ]
}
```

---

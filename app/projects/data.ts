export type Project = {
  slug: string;
  title: string;
  client: string;
  year?: string;
  tags: string[];
  website: string;
  image: string;
  description: string;
  summary: string;
  problem: string;
  solution: string;
  outcome: string;
  deliverables: string[];
  highlights: string[];
};

export const projects: Project[] = [
  {
    slug: "adonay-tiktok-academy",
    title: "Adonay TikTok Academy",
    client: "Adonay TikTok Academy",
    year: "2026",
    tags: ["Education", "Creator Growth", "Lead Generation", "Web Design"],
    website: "https://www.adonaytiktokacademy.com/",
    image: "https://www.adonaytiktokacademy.com/apple-touch-icon.png",
    description:
      "A modern academy website for a TikTok-focused training brand that turns curiosity into course enrollments through a polished, conversion-first experience.",
    summary:
      "We built a high-trust digital presence for a creator education brand, combining compelling storytelling, clear course pathways, and conversion-focused pages for enrollment and FAQs.",
    problem:
      "The academy needed a stronger online identity to explain its value, showcase its training offers, and encourage new learners to take action quickly.",
    solution:
      "We designed and developed a clean, mobile-friendly experience with strong hero messaging, course-focused sections, testimonials, and clear calls to action that guide visitors from first impression to enrollment.",
    outcome:
      "The brand now presents itself as a premium, professional learning platform with a clearer message, easier navigation, and stronger conversion flow.",
    deliverables: [
      "Conversion-first landing experience",
      "Course + about + FAQ structure",
      "Mobile-friendly enrollment journey",
      "Professional education branding",
    ],
    highlights: [
      "Clean academy positioning and offer storytelling",
      "Conversion-focused landing and CTA design",
      "Student trust through testimonials and structured content",
      "Fast, elegant experience optimized for modern mobile viewership",
    ],
  },
  {
    slug: "azmera-coffee",
    title: "Azmera Coffee",
    client: "Azmera Coffee",
    year: "2026",
    tags: ["Coffee Export", "B2B Commerce", "Branding", "Web Design"],
    website: "https://www.azmeracoffee.com/",
    image: "https://www.azmeracoffee.com/assets/hero-_t6F-NKp.jpg",
    description:
      "A premium B2B website for an Ethiopian specialty coffee exporter, highlighting sourcing quality, traceability, and export readiness for international buyers.",
    summary:
      "We created a refined digital presence for a specialty coffee business that wanted to communicate premium sourcing, global reach, and professional trust to buyers and partners.",
    problem:
      "Azmera needed a website that could present its origin story, quality standards, and export capabilities in a way that felt credible, modern, and commercially strong.",
    solution:
      "We built a polished, buyer-focused experience with strong brand storytelling, structured service sections, and clear pathways for wholesale inquiry and product discovery.",
    outcome:
      "The website now positions Azmera as a professional export partner with a strong international brand presence and a more persuasive buyer journey.",
    deliverables: [
      "Premium sourcing storytelling",
      "B2B buyer-focused experience",
      "International trust signals",
      "Modern inquiry-driven website",
    ],
    highlights: [
      "Refined storytelling around Ethiopian coffee origins",
      "Professional presentation for global buyers and partners",
      "Clear service and export navigation",
      "Modern design aligned with premium brand positioning",
    ],
  },
  {
    slug: "teme-upholstery",
    title: "Teme Upholstery",
    client: "Teme Upholstery",
    year: "2026",
    tags: ["Auto Services", "Booking", "Luxury Brand", "Service Website"],
    website: "https://www.temeupholstery.com/",
    image: "https://www.temeupholstery.com/assets/carseat-D90_ro2m.jpg",
    description:
      "A premium auto upholstery website for a luxury interior transformation business, combining service showcases, training content, and strong booking calls to action.",
    summary:
      "We crafted a high-end online experience for a premium upholstery brand that wanted to reflect craftsmanship, luxury, and professionalism across every service page.",
    problem:
      "Teme needed a website that could clearly present its interior transformation services, training programs, and booking options while feeling luxurious and trustworthy.",
    solution:
      "We designed a visually rich, conversion-oriented website with elegant service storytelling, strong visual proof, and clear pathways for booking, gallery exploration, and training enrollment.",
    outcome:
      "The business now has a polished digital storefront that reinforces its premium positioning and makes it easier for clients to book and explore services.",
    deliverables: [
      "Luxury service storytelling",
      "Booking-ready experience",
      "Visual galleries and transformation proof",
      "Training and services integrated",
    ],
    highlights: [
      "Elegant presentation for premium interior transformation",
      "Clear booking and service discovery flow",
      "Training and business services reflected in one platform",
      "Strong visual quality aligned with the brand's craftsmanship",
    ],
  },
  {
    slug: "nhatty-the-barber",
    title: "Nhatty The Barber",
    client: "Nhatty The Barber",
    year: "2026",
    tags: ["Barber Shop", "Booking", "Branding", "Luxury Services"],
    website: "https://www.nhattythebarber.com/",
    image: "https://www.nhattythebarber.com/assets/hairstyiling-CbwIRJhn.jpg",
    description:
      "A premium barber brand website crafted to showcase elite grooming services, modern styles, and a luxury experience that feels both exclusive and accessible.",
    summary:
      "We created a polished online experience for a high-end barber brand that wanted to reflect its reputation, premium service quality, and strong client trust.",
    problem:
      "The brand needed a digital presence that matched its premium positioning and made it easy for clients to discover services, book appointments, and connect with the business.",
    solution:
      "We developed a refined website with service-led storytelling, modern visual presentation, and clear booking pathways designed to support both local and international clients.",
    outcome:
      "The website now strengthens Nhatty's premium image and gives the business a more compelling, conversion-ready experience for new and returning customers.",
    deliverables: [
      "Premium grooming brand experience",
      "Appointment-ready conversion flow",
      "Modern visual storytelling",
      "Client trust and service clarity",
    ],
    highlights: [
      "Luxury barber brand positioning",
      "High-impact service presentation",
      "Clear booking and appointment motivation",
      "Modern design that reflects elite grooming culture",
    ],
  },
  {
    slug: "denbegnaye-ai-platform",
    title: "Denbegnaye AI Workspace",
    client: "Denbegnaye",
    year: "2025",
    tags: ["AI Workspace", "Workflow Automation", "Document Intelligence"],
    website: "https://www.denbegnayeaiagent.com/",
    image: "https://www.denbegnayeaiagent.com/denbegnaye-og.png",
    description:
      "A dual-purpose AI workspace combining a visual agent builder with specialist AI tools for understanding documents, spreadsheets, and business information.",
    summary:
      "We built the Denbegnaye product experience around two connected capabilities: visual AI workflow automation and Office Intelligence for turning business files into useful insights.",
    problem:
      "The product needed to make two complex AI use cases understandable: assembling agents into workflows and applying specialist analysis to business documents and data.",
    solution:
      "We created a product-focused experience that introduces the AI Automation Builder through triggers, agents, tools, and actions, while giving Office Intelligence a distinct path for exploring document and business-data analysis.",
    outcome:
      "The live product experience now presents Denbegnaye as an AI workspace for both workflow automation and business information analysis.",
    deliverables: [
      "Visual workflow builder positioning",
      "AI agent triggers, tools, and actions",
      "Office Intelligence product pathway",
      "Document and business-data use cases",
    ],
    highlights: [
      "Clear distinction between automation and intelligence products",
      "Workflow concepts explained with a trigger → agent → action model",
      "Document analysis positioned for business teams",
      "Direct routes to product exploration and sign-in",
    ],
  },
  {
    slug: "dr-feben-dental-clinic",
    title: "Dr. Feben Dental Clinic",
    client: "Dr. Feben Dental Clinic",
    year: "2025",
    tags: ["Healthcare", "Dental Clinic", "Booking", "Medical Brand"],
    website: "https://dr-feben.vercel.app/",
    image: "https://dr-feben.vercel.app/logo.svg",
    description:
      "A calm, modern dental clinic website designed to make treatment services feel trustworthy, premium, and easy to book.",
    summary:
      "We developed a patient-focused digital experience for a dental clinic that wanted to communicate comfort, professionalism, and modern care in one elegant platform.",
    problem:
      "The clinic needed a more reassuring online presence that could explain its services, build trust, and support appointment bookings with clarity and confidence.",
    solution:
      "We created a refined clinic website with service-focused sections, patient-first messaging, and a straightforward path to consultation and booking.",
    outcome:
      "The clinic now has a polished, reassuring digital front door that strengthens trust and makes its care offerings easier to understand and access.",
    deliverables: [
      "Patient-first clinic experience",
      "Service clarity and trust building",
      "Modern medical web presentation",
      "Appointment-friendly journey",
    ],
    highlights: [
      "Gentle, premium healthcare storytelling",
      "Clear presentation of dental services and treatments",
      "Modern design built around patient confidence",
      "Stronger conversion path from discovery to booking",
    ],
  },
  {
    slug: "fiyorina-chiffon",
    title: "Fiyorina Chiffon",
    client: "Fiyorina Chiffon",
    tags: ["Fashion", "Ethiopian Clothing", "Bridal & Custom Design"],
    website: "https://www.fiyorinachiffon.com/",
    image: "https://www.fiyorinachiffon.com/og-image.jpg",
    description:
      "A digital home for an Addis Ababa fashion brand featuring luxury chiffon dresses, Ethiopian traditional clothing, bridal outfits, and custom designs.",
    summary:
      "We created a focused online presence for Fiyorina Chiffon, bringing its luxury chiffon, Ethiopian traditional clothing, bridal fashion, and custom design offering together under one brand.",
    problem:
      "Fiyorina Chiffon needed a clear online presence to introduce its fashion identity and help visitors discover its traditional, bridal, and custom design offerings.",
    solution:
      "We developed a brand website that presents the label's fashion categories and custom design focus with a digital identity rooted in its Addis Ababa base.",
    outcome:
      "The live website gives the brand a central place to present its fashion offering and connect its Ethiopian identity with prospective customers.",
    deliverables: [
      "Luxury chiffon fashion positioning",
      "Ethiopian traditional clothing focus",
      "Bridal and custom design discovery",
      "Addis Ababa brand presence",
    ],
    highlights: [
      "Brand storytelling centered on Ethiopian fashion",
      "Clear visibility for bridal and custom outfit categories",
      "A dedicated destination for premium chiffon collections",
      "Search and social sharing presentation for the brand",
    ],
  },
  {
    slug: "st-mary-st-gabriel-church",
    title: "St. Mary & St. Gabriel Church",
    client: "St. Mary & St. Gabriel Ethiopian Orthodox Tewahedo Church",
    tags: ["Community", "Church Website", "Ethiopian Orthodox"],
    website: "https://www.stleotc.org/",
    image: "https://www.stleotc.org/church-logo.png",
    description:
      "A community website for St. Mary & St. Gabriel Ethiopian Orthodox Tewahedo Church, introducing worship, spiritual guidance, sacred services, fellowship, and charity.",
    summary:
      "We built a public-facing digital home for St. Mary & St. Gabriel Ethiopian Orthodox Tewahedo Church, helping its community and visitors find information about worship, church life, and spiritual services.",
    problem:
      "The church needed an accessible online presence to represent its faith community and make essential information about worship, sacred services, fellowship, and charity easier to discover.",
    solution:
      "We developed a church website that brings the congregation's identity and community offerings together in one clear destination for members and visitors.",
    outcome:
      "The live website provides the church with a central online presence for sharing its Ethiopian Orthodox Tewahedo traditions and community life.",
    deliverables: [
      "Church identity and community presence",
      "Worship and spiritual guidance information",
      "Sacred services and fellowship discovery",
      "Charity and community engagement focus",
    ],
    highlights: [
      "A dedicated digital home for the congregation",
      "Faith and community information organized for discovery",
      "Public-facing presentation of Ethiopian Orthodox traditions",
      "Responsive, accessible entry point for members and visitors",
    ],
  },
];

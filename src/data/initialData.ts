import { ServiceItem, SIMCard, MobilePackage, POSTransaction, ShopSettings } from '../types';

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: "FR.HASAN TECH",
  tagline: "Your Premier Partner for Technology, Digital Printing & Mobile Services",
  description: "Specializing in high-speed digital printing, laser photocopy, authorized SIM card solutions (Dialog, Mobitel, Hutch, Airtel), network package reloads, and modern IT & digital tech services.",
  logoUrl: "/fr-hasan-logo.svg",
  whatsappNumber: "076 859 7800",
  whatsappGroupUrl: "https://chat.whatsapp.com/Gn3gKNe98zeLMzwVYsETNn?s=cl&p=a&ilr=4",
  phoneNumber: "076 859 7800",
  email: "contact@frhasantech.com",
  address: "529, Siraj Nagar, Thampalagamam, Sri Lanka",
  plusCode: "F37F+49 Mullipotana",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4717.1525016404!2d81.07080359098511!3d8.462772799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afb9f006b19d3a5%3A0x330171f2b7208671!2sFR%20HASAN%20TECH!5e1!3m2!1sen!2slk!4v1787638607633!5m2!1sen!2slk",
  googleMapsUrl: "https://maps.google.com/?q=FR+HASAN+TECH+Mullipotana+F37F%2B49",
  openingHours: {
    monFri: "Mon–Thu, Sat–Sun: 7:00 AM – 10:00 PM | Fri: 3:00 PM – 9:00 PM",
    sat: "7:00 AM – 10:00 PM",
    sun: "7:00 AM – 10:00 PM",
    scheduleList: [
      { day: "Monday", hours: "7 AM – 10 PM" },
      { day: "Tuesday", hours: "7 AM – 10 PM", note: "Mawlid (Hours might differ)" },
      { day: "Wednesday", hours: "7 AM – 10 PM", note: "Mawlid (Hours might differ)" },
      { day: "Thursday", hours: "7 AM – 10 PM", note: "Nikini Full Moon Poya Day (Hours might differ)" },
      { day: "Friday", hours: "3 PM – 9 PM" },
      { day: "Saturday", hours: "7 AM – 10 PM" },
      { day: "Sunday", hours: "7 AM – 10 PM" }
    ],
    closedDays: ["Friday Morning (Opens at 3:00 PM)"],
    note: "Tuesday & Wednesday (Mawlid) & Thursday (Nikini Full Moon Poya Day): 7 AM – 10 PM (Hours might differ)"
  },
  socialMedia: {
    facebook: "https://facebook.com/frhasantech",
    instagram: "https://instagram.com/frhasantech",
    twitter: "https://twitter.com/frhasantech"
  },
  heroContent: {
    title: "FR.HASAN TECH",
    tagline: "Your Premier Partner for Technology, Digital Printing & Mobile Services",
    description: "Quality printing, photocopying, telecom SIM cards, package reloads, and IT services right in your neighborhood. Fast, reliable, and led with dedicated tech expertise.",
    backgroundImageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80"
  },
  aboutContent: {
    title: "About FR.HASAN TECH",
    subtitle: "Innovation, Connectivity & Precision Document Services",
    story: "Founded by FR Hasan with a vision for modern technology solutions and community service excellence, FR.HASAN TECH has grown into a renowned one-stop hub for all document reproduction, color printing, mobile telecommunications connectivity, and digital package reloads. Located at 529, Siraj Nagar, Thampalagamam, Sri Lanka, we empower students, professionals, and enterprise clients with rapid turnaround and uncompromising quality.",
    mission: "To deliver fast, reliable, state-of-the-art printing, telecommunications connectivity, and IT services with honest local care and cutting-edge standards.",
    ceoName: "FR Hasan",
    ceoTitle: "Founder & Chief Executive Officer (CEO)",
    ceoPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80", // NOTE: Replace placeholder CEO photo with real photo of founder FR Hasan when available
    ceoBio: "FR Hasan is the founder and visionary leader of FR.HASAN TECH. Managing direct tech operations, telecommunication network reloads, and high-speed digital print services from our Thampalagamam center, he oversees the company's continuous commitment to customer satisfaction, fast turnaround times, and friendly neighborhood service.",
    ceoQuote: "Empowering individuals and local businesses through reliable technology, seamless telecommunication connectivity, and precision digital print solutions."
  },
  posSettings: {
    defaultPaymentMethod: "Cash",
    currencySymbol: "LKR",
    taxRate: 0,
    receiptHeader: "FR.HASAN TECH\n529, Siraj Nagar, Thampalagamam\nWhatsApp / Tel: 076 859 7800",
    receiptFooter: "Thank you for choosing FR.HASAN TECH!\nPlease visit us again.",
    enableExpenseTracking: true,
    serviceSubTypes: {
      "Photocopy": [
        "Black & White (A4)",
        "Black & White (A3)",
        "Black & White (Legal)",
        "Colour (A4)",
        "Colour (A3)",
        "Document Scanning",
        "Bulk Copying"
      ],
      "Printing": [
        "Document B&W",
        "Document Colour",
        "Photo Printing (4x6 / 5x7)",
        "Photo Printing (A4 Glossy)",
        "Invitation / Card Printing",
        "Poster Printing (A3/A2)",
        "Spiral Binding / Tape Binding",
        "Lamination (A4 / ID Size)"
      ],
      "SIM Cards": [
        "Dialog 4G/5G SIM",
        "Mobitel SIM",
        "Hutch SIM",
        "Airtel SIM"
      ],
      "Packages": [
        "Data Package Reload",
        "Voice Package Reload",
        "Combo Package",
        "Standard Scratch Card / Pin Reload"
      ]
    }
  }
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "serv-1",
    slug: "photocopy",
    name: "Photocopy",
    category: "Photocopy",
    icon: "Copy",
    shortDescription: "Professional black & white and colour photocopy services with high-speed digital clarity.",
    fullDescription: "Fast, crisp, and high-volume photocopying for documents, study materials, legal papers, and IDs. We offer single-sided and double-sided copies with sharp contrast on premium paper stocks.",
    priceInfo: "From LKR 5.00 / page",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    availableServicesList: [
      "Black & White Photocopy (A4, A3, Legal)",
      "Colour Photocopy",
      "Document Scanning (High-DPI PDF/JPEG)",
      "Bulk Copying & Booklet Collating"
    ],
    importantNotes: [
      "Please bring clear originals for best results",
      "Bulk orders may require additional turnaround time",
      "Double-sided printing discounts available for orders over 100 pages"
    ],
    status: "Active",
    isPublished: true
  },
  {
    id: "serv-2",
    slug: "printing",
    name: "Printing",
    category: "Printing",
    icon: "Printer",
    shortDescription: "Quality document, colour, black & white and photo printing services on various media.",
    fullDescription: "From university assignments and business proposals to vibrant studio-grade photo printing and personalized event invitations. Available on plain, art paper, photo glossy, and sticker sheets.",
    priceInfo: "From LKR 10.00 / page (B&W), LKR 35.00 (Colour)",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=1200&q=80",
    availableServicesList: [
      "Document Printing (B&W and Colour)",
      "Photo Printing (High-res glossy & matte)",
      "Invitation & Greeting Card Printing",
      "Poster & Presentation Printing",
      "Spiral Binding & Hardcover Thermal Binding"
    ],
    importantNotes: [
      "We support USB drive, email, and cloud file transfers (WhatsApp / Google Drive)",
      "High-resolution PDF or 300+ DPI images recommended for photo printing",
      "Custom paper grammage options (80gsm, 120gsm, 230gsm glossy)"
    ],
    status: "Active",
    isPublished: true
  },
  {
    id: "serv-3",
    slug: "sims",
    name: "SIM Cards",
    category: "SIM Cards",
    icon: "Smartphone",
    shortDescription: "Official authorized SIM cards (Dialog, Mobitel, Hutch, Airtel) with instant on-spot KYC registration.",
    fullDescription: "Authorized retailer for all major telecommunication providers in Sri Lanka. Instant SIM registration with your National Identity Card (NIC) or Passport for tourists and locals.",
    priceInfo: "From LKR 350.00",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
    availableServicesList: [
      "Dialog 4G / 5G Prepaid & Postpaid SIMs",
      "Mobitel eSIM & Regular 4G SIMs",
      "Hutch High-Speed SIMs",
      "Airtel Unlimited Freedom SIMs",
      "Tourist SIM Kits with preloaded data bundles"
    ],
    importantNotes: [
      "Valid National Identity Card (NIC), Driving License, or Passport required for activation",
      "Biometric/instant photo KYC verification available in-store"
    ],
    status: "Active",
    isPublished: true
  },
  {
    id: "serv-4",
    slug: "packages",
    name: "Packages & Reloads",
    category: "Packages",
    icon: "Package",
    shortDescription: "Instant mobile reloads, unlimited social packages, voice bundles and high-speed data add-ons.",
    fullDescription: "Instant online top-ups and activation for all work-from-home, streaming, unlimited YouTube/TikTok/Social bundles, and monthly voice packs across Dialog, Mobitel, Hutch, and Airtel.",
    priceInfo: "LKR 50.00 to LKR 3,500.00+",
    image: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80",
    availableServicesList: [
      "High-Speed Mobile Data Packages (Daily, 7-Day, 30-Day)",
      "Unlimited Social Media & Streaming Packs (YouTube, Zoom, Teams)",
      "Unlimited Any-Net Voice Packages",
      "Direct Over-the-Air Mobile Reloads & DTH TV top-ups"
    ],
    importantNotes: [
      "Instant confirmation SMS sent directly to your mobile number",
      "Inquire via WhatsApp for current promotional network bonuses"
    ],
    status: "Active",
    isPublished: true
  }
];

export const INITIAL_SIMS: SIMCard[] = [
  {
    id: "sim-101",
    network: "Dialog",
    simNumber: "0771928341",
    iccid: "899401012345678901",
    package: "Dialog Triple Play Starter (30GB)",
    purchasePrice: 300,
    sellingPrice: 500,
    status: "Available",
    receivedDate: "2026-08-15",
    notes: "Batch #D26-08A in display showcase"
  },
  {
    id: "sim-102",
    network: "Dialog",
    simNumber: "0778841290",
    iccid: "899401012345678902",
    package: "Dialog Power Plan 4G",
    purchasePrice: 300,
    sellingPrice: 500,
    status: "Available",
    receivedDate: "2026-08-15"
  },
  {
    id: "sim-103",
    network: "Mobitel",
    simNumber: "0714589201",
    iccid: "899402098765432101",
    package: "Mobitel Master Unlimited Data",
    purchasePrice: 350,
    sellingPrice: 600,
    status: "Available",
    receivedDate: "2026-08-18",
    notes: "High demand package"
  },
  {
    id: "sim-104",
    network: "Mobitel",
    simNumber: "0719823412",
    iccid: "899402098765432102",
    package: "Mobitel Upahara Voice & Data",
    purchasePrice: 300,
    sellingPrice: 500,
    status: "Reserved",
    receivedDate: "2026-08-18",
    notes: "Reserved for Mr. Bandara (071...)"
  },
  {
    id: "sim-105",
    network: "Hutch",
    simNumber: "0785129043",
    iccid: "899403011223344556",
    package: "Hutch CliQ 30-Day Non-Stop",
    purchasePrice: 200,
    sellingPrice: 400,
    status: "Available",
    receivedDate: "2026-08-20"
  },
  {
    id: "sim-106",
    network: "Airtel",
    simNumber: "0756781294",
    iccid: "899404099887766554",
    package: "Airtel Freedom Unlimited Calls + 40GB",
    purchasePrice: 250,
    sellingPrice: 450,
    status: "Available",
    receivedDate: "2026-08-21"
  },
  {
    id: "sim-107",
    network: "Dialog",
    simNumber: "0773341908",
    iccid: "899401012345678903",
    package: "Dialog Tourist 50GB Starter",
    purchasePrice: 800,
    sellingPrice: 1500,
    status: "Sold",
    receivedDate: "2026-08-10",
    soldDate: "2026-08-24",
    notes: "Sold to tourist customer (Cash)"
  },
  {
    id: "sim-108",
    network: "Hutch",
    simNumber: "0723391024",
    iccid: "899403011223344557",
    package: "Hutch Data Pack 15GB",
    purchasePrice: 200,
    sellingPrice: 350,
    status: "Damaged",
    receivedDate: "2026-08-12",
    notes: "Chip scratched during unpacking"
  }
];

export const INITIAL_PACKAGES: MobilePackage[] = [
  {
    id: "pkg-1",
    network: "Dialog",
    name: "Dialog Power Plan 30 Days",
    type: "Data",
    description: "30GB Anytime Data + Unlimited WhatsApp & YouTube (HD 1080p)",
    price: 990,
    status: "Active",
    displayOrder: 1,
    validity: "30 Days",
    quota: "30 GB"
  },
  {
    id: "pkg-2",
    network: "Dialog",
    name: "Dialog Unlimited Voice & SMS",
    type: "Voice",
    description: "Unlimited D2D & Any-Net Calls + 1000 SMS to any network",
    price: 650,
    status: "Active",
    displayOrder: 2,
    validity: "30 Days"
  },
  {
    id: "pkg-3",
    network: "Mobitel",
    name: "Mobitel SelfCare Mega Booster",
    type: "Data",
    description: "45GB 4G/5G High Speed Data + Unlimited Zoom & MS Teams for Work/Study",
    price: 1250,
    status: "Active",
    displayOrder: 3,
    validity: "30 Days",
    quota: "45 GB"
  },
  {
    id: "pkg-4",
    network: "Mobitel",
    name: "Mobitel One Shot Unlimited",
    type: "Combo",
    description: "Truly Unlimited Calls to all networks + 1.5GB daily data",
    price: 1099,
    status: "Active",
    displayOrder: 4,
    validity: "30 Days"
  },
  {
    id: "pkg-5",
    network: "Hutch",
    name: "Hutch CliQ 30-Day Non-Stop Data",
    type: "Data",
    description: "Non-stop data browsing + 50GB high-speed bonus",
    price: 780,
    status: "Active",
    displayOrder: 5,
    validity: "30 Days",
    quota: "50 GB"
  },
  {
    id: "pkg-6",
    network: "Airtel",
    name: "Airtel 5G Freedom Unlimited Pack",
    type: "Combo",
    description: "Unlimited Any-Net Voice Calls + 2GB per day + Free SMS",
    price: 888,
    status: "Active",
    displayOrder: 6,
    validity: "30 Days",
    quota: "60 GB"
  }
];

export const INITIAL_TRANSACTIONS: POSTransaction[] = [
  {
    id: "tx-2026-0824-001",
    type: "sale",
    date: "2026-08-24",
    time: "08:45 AM",
    category: "Photocopy",
    subType: "Black & White (A4)",
    description: "A4 B&W Study Pack Copies x 40 pages",
    quantity: 40,
    unitPrice: 5.00,
    totalAmount: 200.00,
    paymentMethod: "Cash",
    customerName: "Kasun Perera",
    notes: "Fast morning student job",
    createdBy: "Admin User",
    createdAt: "2026-08-24T08:45:00Z",
    updatedAt: "2026-08-24T08:45:00Z"
  },
  {
    id: "tx-2026-0824-002",
    type: "expense",
    date: "2026-08-24",
    time: "09:15 AM",
    category: "Stationery / Supplies",
    description: "Double A A4 80gsm Paper Box (5 Reams)",
    totalAmount: 3200.00,
    paymentMethod: "Cash",
    vendor: "Central Paper Distributors",
    notes: "Restocked A4 high brightness paper",
    createdBy: "Admin User",
    createdAt: "2026-08-24T09:15:00Z",
    updatedAt: "2026-08-24T09:15:00Z"
  },
  {
    id: "tx-2026-0824-003",
    type: "sale",
    date: "2026-08-24",
    time: "10:10 AM",
    category: "Printing",
    subType: "Document Colour",
    description: "Architectural Project Proposal Colour Printouts x 15 pages",
    quantity: 15,
    unitPrice: 40.00,
    totalAmount: 600.00,
    paymentMethod: "Cash",
    customerName: "Arch. Dilshan",
    notes: "Heavy coverage colour laser",
    createdBy: "Admin User",
    createdAt: "2026-08-24T10:10:00Z",
    updatedAt: "2026-08-24T10:10:00Z"
  },
  {
    id: "tx-2026-0824-004",
    type: "sale",
    date: "2026-08-24",
    time: "10:30 AM",
    category: "Photocopy",
    subType: "Black & White (A4)",
    description: "A4 B&W x30 pages",
    quantity: 30,
    unitPrice: 5.00,
    totalAmount: 150.00,
    paymentMethod: "Cash",
    customerName: "Walk-in customer",
    notes: "A4 B&W x30",
    createdBy: "Admin User",
    createdAt: "2026-08-24T10:30:00Z",
    updatedAt: "2026-08-24T10:30:00Z"
  },
  {
    id: "tx-2026-0824-005",
    type: "sale",
    date: "2026-08-24",
    time: "11:20 AM",
    category: "SIM Cards",
    subType: "Dialog 4G/5G SIM",
    description: "Dialog Tourist Starter SIM with 50GB package",
    quantity: 1,
    unitPrice: 1500.00,
    totalAmount: 1500.00,
    paymentMethod: "Cash",
    customerName: "Michael Brown",
    notes: "Passport verified in store",
    createdBy: "Admin User",
    createdAt: "2026-08-24T11:20:00Z",
    updatedAt: "2026-08-24T11:20:00Z"
  },
  {
    id: "tx-2026-0824-006",
    type: "sale",
    date: "2026-08-24",
    time: "12:05 PM",
    category: "Packages",
    subType: "Data Package Reload",
    description: "Dialog Power Plan 30 Days Online Reload",
    quantity: 1,
    unitPrice: 990.00,
    totalAmount: 990.00,
    paymentMethod: "Bank Transfer",
    customerName: "Sanduni Fernando",
    notes: "Commercial Bank transfer reference #84920",
    createdBy: "Admin User",
    createdAt: "2026-08-24T12:05:00Z",
    updatedAt: "2026-08-24T12:05:00Z"
  },
  {
    id: "tx-2026-0823-001",
    type: "sale",
    date: "2026-08-23",
    time: "09:30 AM",
    category: "Printing",
    subType: "Photo Printing (4x6 / 5x7)",
    description: "Family studio photo prints on high-gloss x 10",
    quantity: 10,
    unitPrice: 75.00,
    totalAmount: 750.00,
    paymentMethod: "Cash",
    customerName: "Mrs. Jayawardena",
    createdBy: "Admin User",
    createdAt: "2026-08-23T09:30:00Z",
    updatedAt: "2026-08-23T09:30:00Z"
  },
  {
    id: "tx-2026-0823-002",
    type: "sale",
    date: "2026-08-23",
    time: "02:15 PM",
    category: "Photocopy",
    subType: "Bulk Copying",
    description: "Tuition Class Module Photocopies x 250 pages",
    quantity: 250,
    unitPrice: 4.50,
    totalAmount: 1125.00,
    paymentMethod: "Cash",
    customerName: "Siripala Sir",
    createdBy: "Admin User",
    createdAt: "2026-08-23T14:15:00Z",
    updatedAt: "2026-08-23T14:15:00Z"
  },
  {
    id: "tx-2026-0823-003",
    type: "expense",
    date: "2026-08-23",
    time: "04:30 PM",
    category: "Utilities",
    description: "Shop Electricity Bill Payment (CEB)",
    totalAmount: 4800.00,
    paymentMethod: "Bank Transfer",
    vendor: "Ceylon Electricity Board",
    notes: "August billing cycle",
    createdBy: "Admin User",
    createdAt: "2026-08-23T16:30:00Z",
    updatedAt: "2026-08-23T16:30:00Z"
  },
  {
    id: "tx-2026-0822-001",
    type: "sale",
    date: "2026-08-22",
    time: "11:00 AM",
    category: "SIM Cards",
    subType: "Mobitel SIM",
    description: "Mobitel 4G SIM Card Activation",
    quantity: 1,
    unitPrice: 600.00,
    totalAmount: 600.00,
    paymentMethod: "Cash",
    customerName: "Rohan",
    createdBy: "Admin User",
    createdAt: "2026-08-22T11:00:00Z",
    updatedAt: "2026-08-22T11:00:00Z"
  },
  {
    id: "tx-2026-0822-002",
    type: "sale",
    date: "2026-08-22",
    time: "03:40 PM",
    category: "Packages",
    subType: "Combo Package",
    description: "Mobitel One Shot Unlimited Combo Reload",
    quantity: 1,
    unitPrice: 1099.00,
    totalAmount: 1099.00,
    paymentMethod: "Cash",
    customerName: "Tharindu",
    createdBy: "Admin User",
    createdAt: "2026-08-22T15:40:00Z",
    updatedAt: "2026-08-22T15:40:00Z"
  },
  {
    id: "tx-2026-0821-001",
    type: "sale",
    date: "2026-08-21",
    time: "10:15 AM",
    category: "Printing",
    subType: "Spiral Binding / Tape Binding",
    description: "Degree Thesis Hard Cover Binding & Colour Printing",
    quantity: 2,
    unitPrice: 1250.00,
    totalAmount: 2500.00,
    paymentMethod: "Card",
    customerName: "Nadeeka Wijesinghe",
    createdBy: "Admin User",
    createdAt: "2026-08-21T10:15:00Z",
    updatedAt: "2026-08-21T10:15:00Z"
  },
  {
    id: "tx-2026-0820-001",
    type: "expense",
    date: "2026-08-20",
    time: "11:30 AM",
    category: "Inventory / Stock",
    description: "Dialog SIM Stock Re-order (10 units)",
    totalAmount: 3000.00,
    paymentMethod: "Cash",
    vendor: "Dialog Regional Distributor",
    createdBy: "Admin User",
    createdAt: "2026-08-20T11:30:00Z",
    updatedAt: "2026-08-20T11:30:00Z"
  },
  {
    id: "tx-2026-0820-002",
    type: "sale",
    date: "2026-08-20",
    time: "02:00 PM",
    category: "Photocopy",
    subType: "Colour (A4)",
    description: "Colour Certificates & Passports Photocopy x 12 pages",
    quantity: 12,
    unitPrice: 35.00,
    totalAmount: 420.00,
    paymentMethod: "Cash",
    customerName: "Kavinda",
    createdBy: "Admin User",
    createdAt: "2026-08-20T14:00:00Z",
    updatedAt: "2026-08-20T14:00:00Z"
  }
];

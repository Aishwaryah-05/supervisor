/**
 * LoomPilot Supervisor Portal - Realistic Sample Data & Storage Layer
 * Uses strict 8-stage lifecycle and LoomPilot Client Portal design tokens.
 */

const STORAGE_KEYS = {
  ORDERS: 'loompilot_supervisor_orders',
  EMPLOYEES: 'loompilot_supervisor_employees',
  RAW_MATERIALS: 'loompilot_supervisor_materials',
  MACHINES: 'loompilot_supervisor_machines',
  PRODUCTION_LOGS: 'loompilot_supervisor_production_logs',
  ISSUES: 'loompilot_supervisor_issues',
  NOTIFICATIONS: 'loompilot_supervisor_notifications',
  PROFILE: 'loompilot_supervisor_profile',
  APP_STATE: 'loompilot_supervisor_state'
};

// Strict Eight-Stage Textile Lifecycle
const PRODUCTION_STAGES = [
  '1. Quote Accepted',
  '2. Yarn Sourcing',
  '3. Warping & Sizing',
  '4. Loom Weaving',
  '5. Dyeing & Finishing',
  '6. Quality Check',
  '7. Packaging & Dispatch',
  '8. Delivered'
];
if (typeof window !== 'undefined') window.PRODUCTION_STAGES = PRODUCTION_STAGES;
if (typeof global !== 'undefined') global.PRODUCTION_STAGES = PRODUCTION_STAGES;

const INITIAL_PROFILE = {
  name: "Rajesh Kumar",
  title: "Senior Production Supervisor",
  empId: "LP-SUP-042",
  email: "rajesh.kumar@loompilot.com",
  phone: "+91 98765 43210",
  department: "Weaving & Loom Shed Division",
  area: "Loom Shed A & B (Airjet & Rapier Section)",
  shift: "Shift A (Morning: 06:00 AM – 02:30 PM)",
  facility: "LoomPilot Facility 1, Coimbatore Textile Hub",
  reportingTo: "Suresh Mehta (Plant Operations Director)",
  avatar: "RK",
  status: "On Shift",
  joinedDate: "15 Jan 2021",
  experience: "14 Years in Textile Weaving",
  certifications: [
    "Master Weaver Certification (SITRA)",
    "ISO 9001:2015 Textile Quality Auditor",
    "Picanol OptiMax & Tsudakoma Advanced Systems",
    "Occupational Factory Safety (OSHA Level 2)"
  ]
};

const INITIAL_ORDERS = [
  {
    id: "ORD-8092",
    fabricName: "Organic Combed Cotton Twill 220 GSM",
    clientName: "Aura Textiles International",
    assignedDate: "2026-10-28",
    assignedTime: "09:30 AM",
    totalQty: 12000,
    producedQty: 7400,
    remainingQty: 4600,
    deliveryDeadline: "2026-11-05",
    currentStage: "4. Loom Weaving",
    status: "In Progress",
    isNew: false,
    dailyTarget: 1200,
    specs: {
      composition: "100% GOTS Certified Organic Cotton",
      weavePattern: "2/1 Z-Twill",
      gsm: "220 GSM ± 3%",
      warpYarn: "30s Ne Combed Ring-Spun",
      weftYarn: "30s Ne Combed Ring-Spun",
      reedSpace: "190 cm Finished Width",
      density: "128 EPI × 76 PPI",
      assignedLooms: "Rapier Loom Line 1 (Shed A)",
      colorCode: "Natural Ecru (Greige Stage)"
    }
  },
  {
    id: "ORD-8095",
    fabricName: "Belgian Flax Linen Sheer 140 GSM",
    clientName: "Maison & Ville Interiors",
    assignedDate: "2026-10-30",
    assignedTime: "07:15 AM",
    totalQty: 6500,
    producedQty: 0,
    remainingQty: 6500,
    deliveryDeadline: "2026-11-12",
    currentStage: "3. Warping & Sizing",
    status: "Newly Assigned",
    isNew: true,
    dailyTarget: 800,
    specs: {
      composition: "100% Wet-Spun European Flax Linen",
      weavePattern: "Plain Weave 1/1 Balanced",
      gsm: "140 GSM ± 4%",
      warpYarn: "40s Lea Pure Wet-Spun Linen",
      weftYarn: "40s Lea Pure Wet-Spun Linen",
      reedSpace: "220 cm Finished Width",
      density: "58 EPI × 52 PPI",
      assignedLooms: "Sectional Warping Range 1",
      colorCode: "Bleached Oyster White"
    }
  },
  {
    id: "ORD-8088",
    fabricName: "High-Tenacity Cordura Dobby 340 GSM",
    clientName: "Vanguard Tactical Gear",
    assignedDate: "2026-10-24",
    assignedTime: "11:00 AM",
    totalQty: 18000,
    producedQty: 13200,
    remainingQty: 4800,
    deliveryDeadline: "2026-11-02",
    currentStage: "4. Loom Weaving",
    status: "At Risk",
    isNew: false,
    dailyTarget: 1500,
    specs: {
      composition: "100% High-Tenacity Cordura Nylon 6,6",
      weavePattern: "Micro-Dobby Diamond Ripstop",
      gsm: "340 GSM ± 2%",
      warpYarn: "500D Cordura Continuous Filament",
      weftYarn: "500D Cordura Continuous Filament",
      reedSpace: "175 cm Finished Width",
      density: "72 EPI × 64 PPI",
      assignedLooms: "Airjet Loom Line 2 (Under repair)",
      colorCode: "Tactical Matte Olive Drab"
    }
  },
  {
    id: "ORD-8098",
    fabricName: "Micro-Modal Satin Weave 115 GSM",
    clientName: "Luxe Sleepwear Co.",
    assignedDate: "2026-10-30",
    assignedTime: "08:45 AM",
    totalQty: 8000,
    producedQty: 0,
    remainingQty: 8000,
    deliveryDeadline: "2026-11-18",
    currentStage: "2. Yarn Sourcing",
    status: "Newly Assigned",
    isNew: true,
    dailyTarget: 1000,
    specs: {
      composition: "95% Lenzing Micro-Modal / 5% Elastane",
      weavePattern: "4/1 Satin Weave Ultra Soft",
      gsm: "115 GSM ± 3%",
      warpYarn: "60s Ne Micro-Modal Compact",
      weftYarn: "60s Ne Micro-Modal + 40D Lycra",
      reedSpace: "185 cm Finished Width",
      density: "164 EPI × 98 PPI",
      assignedLooms: "Airjet Shed B Buffer Queue",
      colorCode: "Pearl Champagne"
    }
  },
  {
    id: "ORD-8079",
    fabricName: "Mercerized Poplin Shirting 125 GSM",
    clientName: "Savile & Row Sartorial",
    assignedDate: "2026-10-22",
    assignedTime: "14:15 PM",
    totalQty: 15000,
    producedQty: 15000,
    remainingQty: 0,
    deliveryDeadline: "2026-10-31",
    currentStage: "6. Quality Check",
    status: "In Progress",
    isNew: false,
    dailyTarget: 1400,
    specs: {
      composition: "100% Extra-Long Staple Giza 88 Cotton",
      weavePattern: "Fine Plain Poplin 1/1",
      gsm: "125 GSM ± 2%",
      warpYarn: "80/2 Ne Egyptian Cotton Gas-Singed",
      weftYarn: "80/2 Ne Egyptian Cotton Gas-Singed",
      reedSpace: "160 cm Finished Width",
      density: "144 EPI × 84 PPI",
      assignedLooms: "Airjet Line 2 (Completed) & QC Frame",
      colorCode: "Oxford Light Blue Pin-Stripe"
    }
  },
  {
    id: "ORD-8084",
    fabricName: "Indigo Selvedge Denim 13.5 Oz (410 GSM)",
    clientName: "IronThread Raw Denim Ltd.",
    assignedDate: "2026-10-26",
    assignedTime: "10:30 AM",
    totalQty: 9500,
    producedQty: 4200,
    remainingQty: 5300,
    deliveryDeadline: "2026-11-04",
    currentStage: "4. Loom Weaving",
    status: "At Risk",
    isNew: false,
    dailyTarget: 900,
    specs: {
      composition: "100% Memphis Cotton Slub Warp & Weft",
      weavePattern: "3/1 Right Hand Twill Red-Line Selvedge",
      gsm: "410 GSM (13.5 Oz/yd²)",
      warpYarn: "7s Open-End Pure Indigo Rope-Dyed",
      weftYarn: "9s Ring-Spun Unbleached Ecru",
      reedSpace: "85 cm Shuttleless Red-Edge",
      density: "66 EPI × 44 PPI",
      assignedLooms: "Denim Rapier Line 3 (Shed B)",
      colorCode: "Deep Indigo 8-Dip"
    }
  },
  {
    id: "ORD-8065",
    fabricName: "Recycled Polyester Georgette 85 GSM",
    clientName: "EchoGreen Sustainable Fashion",
    assignedDate: "2026-10-18",
    assignedTime: "08:00 AM",
    totalQty: 10000,
    producedQty: 10000,
    remainingQty: 0,
    deliveryDeadline: "2026-10-29",
    currentStage: "8. Delivered",
    status: "Completed",
    isNew: false,
    dailyTarget: 1200,
    specs: {
      composition: "100% REPREVE Post-Consumer PET",
      weavePattern: "High Twist Crepe Georgette",
      gsm: "85 GSM ± 3%",
      warpYarn: "50D/48F High-Twist (2800 TPM)",
      weftYarn: "50D/48F High-Twist (2800 TPM)",
      reedSpace: "150 cm Finished Width",
      density: "75 EPI × 70 PPI",
      assignedLooms: "Dispatched",
      colorCode: "Forest Emerald Green"
    }
  },
  {
    id: "ORD-8101",
    fabricName: "Bamboo-Charcoal Antibacterial Terry 380 GSM",
    clientName: "PureTherapy Wellness",
    assignedDate: "2026-10-29",
    assignedTime: "16:00 PM",
    totalQty: 7200,
    producedQty: 0,
    remainingQty: 7200,
    deliveryDeadline: "2026-11-20",
    currentStage: "1. Quote Accepted",
    status: "Not Started",
    isNew: false,
    dailyTarget: 750,
    specs: {
      composition: "70% Organic Bamboo Charcoal / 30% Ring Cotton",
      weavePattern: "3-Pick Loop Terry Weave",
      gsm: "380 GSM ± 5%",
      warpYarn: "20/2 Cotton Ground + 16s Bamboo Pile",
      weftYarn: "16s Ring Spun Cotton Weft",
      reedSpace: "200 cm Finished Width",
      density: "54 EPI × 48 PPI",
      assignedLooms: "Scheduled for Terry Shed C",
      colorCode: "Charcoal Heather Grey"
    }
  }
];

const INITIAL_EMPLOYEES = [
  {
    id: "EMP-101",
    name: "Arunachalam V.",
    department: "Loom Weaving",
    role: "Senior Master Weaver",
    station: "Airjet Looms A01 - A04 (Picanol OmniPlus)",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Station Lead",
    status: "Active",
    skill: "Expert",
    experience: "14 Years",
    avatar: "AV"
  },
  {
    id: "EMP-102",
    name: "Kavitha Sundaram",
    department: "Quality Inspection",
    role: "Fabric Quality Inspector L3",
    station: "Inspection Frame Q-01 (4-Point Grading Lab)",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Station Lead",
    status: "Active",
    skill: "Advanced",
    experience: "9 Years",
    avatar: "KS"
  },
  {
    id: "EMP-103",
    name: "Murugan P.",
    department: "Loom Weaving",
    role: "Rapier Loom Operator",
    station: "Rapier Looms A05 - A08 (OptiMax Range)",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Senior",
    experience: "11 Years",
    avatar: "MP"
  },
  {
    id: "EMP-104",
    name: "Deepa Natarajan",
    department: "Warping & Sizing",
    role: "Sectional Warping Specialist",
    station: "Sectional Warper Range W-01 (Karl Mayer)",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Station Lead",
    status: "Active",
    skill: "Senior",
    experience: "8 Years",
    avatar: "DN"
  },
  {
    id: "EMP-105",
    name: "Senthil Kumar R.",
    department: "Maintenance",
    role: "Lead Mechanical Technician",
    station: "Loom Shed Electro-Mechanical Bay B",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Station Lead",
    status: "Active",
    skill: "Master",
    experience: "16 Years",
    avatar: "SK"
  },
  {
    id: "EMP-106",
    name: "Anand Rajan",
    department: "Loom Weaving",
    role: "Airjet Loom Operator",
    station: "Airjet Looms A09 - A12 (Tsudakoma ZAX)",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Intermediate",
    experience: "5 Years",
    avatar: "AR"
  },
  {
    id: "EMP-107",
    name: "Priya Selvam",
    department: "Quality Inspection",
    role: "Greige Quality Auditor",
    station: "Greige Audit Table Q-02 (Defect Marking)",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Senior",
    experience: "7 Years",
    avatar: "PS"
  },
  {
    id: "EMP-108",
    name: "Karthik Subramanian",
    department: "Loom Weaving",
    role: "Weaving Assistant & Creeler",
    station: "Looms A01 - A06 Weft Feeder Staging",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Relief Standby",
    status: "Active",
    skill: "Junior",
    experience: "2 Years",
    avatar: "KS"
  },
  {
    id: "EMP-109",
    name: "Bala Vignesh",
    department: "Warping & Sizing",
    role: "Sizing Kitchen Operator",
    station: "Sizing Kitchen & Starch Cooker Unit S-01",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Advanced",
    experience: "6 Years",
    avatar: "BV"
  },
  {
    id: "EMP-110",
    name: "Meenakshi R.",
    department: "Loom Weaving",
    role: "Warp Beam Tender & Knotter",
    station: "Tying-In Unit & Beam Trolley Bay A",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Intermediate",
    experience: "4 Years",
    avatar: "MR"
  },
  {
    id: "EMP-111",
    name: "Ganesh Moorthy",
    department: "Maintenance",
    role: "Electrical Automation Tech",
    station: "PLC & Inverter Diagnostics Workshop",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Senior",
    experience: "10 Years",
    avatar: "GM"
  },
  {
    id: "EMP-112",
    name: "Vijayan Swamy",
    department: "Loom Weaving",
    role: "Rapier Loom Operator",
    station: "Rapier Looms B01 - B04 (High-Count Shed)",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Senior",
    experience: "12 Years",
    avatar: "VS"
  },
  {
    id: "EMP-113",
    name: "Sangeetha M.",
    department: "Quality Inspection",
    role: "Defect Classifier & Lab Tester",
    station: "Textile Physical Testing Lab Q-03",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Senior",
    experience: "8 Years",
    avatar: "SM"
  },
  {
    id: "EMP-114",
    name: "Manojkumar T.",
    department: "Packaging & Dispatch",
    role: "Roll Stager & Barcode Tech",
    station: "Finished Fabric Roll Packing Line 1",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Station Lead",
    status: "Active",
    skill: "Intermediate",
    experience: "5 Years",
    avatar: "MT"
  },
  {
    id: "EMP-115",
    name: "Saravanan D.",
    department: "Loom Weaving",
    role: "Airjet Loom Operator",
    station: "Airjet Looms B05 - B08 (Terry Line)",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Senior",
    experience: "9 Years",
    avatar: "SD"
  },
  {
    id: "EMP-116",
    name: "Revathi K.",
    department: "Warping & Sizing",
    role: "High-Speed Creel Loader",
    station: "Creel Unit W-01 V-Type Magazine",
    shift: "Shift A (06:00 - 14:30)",
    deployment: "Active on Station",
    status: "Active",
    skill: "Intermediate",
    experience: "4 Years",
    avatar: "RK"
  }
];

// Raw Materials Inventory Dataset
const INITIAL_RAW_MATERIALS = [
  {
    id: "LOT-CTN-401",
    name: "40s Ne Combed Ring-Spun Cotton",
    composition: "100% GOTS Organic Cotton (Long Staple Shankar-6)",
    category: "Cotton Yarns",
    inStockQty: 8400,
    unit: "kg (168 Bags)",
    allocatedOrder: "ORD-8092",
    orderName: "Organic Combed Cotton Twill 220 GSM",
    storageLocation: "Warehouse Bay A-03",
    thresholdQty: 2500,
    status: "In Stock",
    lastReceived: "2026-10-26",
    supplier: "Coimbatore Organic Spinners Ltd",
    yarnCount: "40s Ne (14.8 Tex)",
    csp: "2,950 (Grade A High Strength)",
    twistPerInch: "24.5 TPI (Z-Twist)",
    moistureRegain: "7.8%"
  },
  {
    id: "LOT-CTN-602",
    name: "60s Ne Supima Compact Combed Cotton",
    composition: "100% American Pima Extra-Long Staple (ELS)",
    category: "Cotton Yarns",
    inStockQty: 5200,
    unit: "kg (104 Bags)",
    allocatedOrder: "ORD-8084",
    orderName: "Fine Cotton Sateen Sheeting 300 TC",
    storageLocation: "Warehouse Bay A-04",
    thresholdQty: 2000,
    status: "In Stock",
    lastReceived: "2026-10-27",
    supplier: "Vardhman ELS Textile Division",
    yarnCount: "60s Ne (9.8 Tex Compact)",
    csp: "3,250 (Super Fine)",
    twistPerInch: "28.0 TPI (Z-Twist)",
    moistureRegain: "7.5%"
  },
  {
    id: "LOT-CTN-303",
    name: "30s Ne Carded Open-End Cotton Weft",
    composition: "100% Recycled Post-Industrial Cotton Blend",
    category: "Cotton Yarns",
    inStockQty: 6800,
    unit: "kg (136 Bags)",
    allocatedOrder: "Buffer Stock",
    orderName: "General Weft Buffer across Shed A & B",
    storageLocation: "Warehouse Bay A-01",
    thresholdQty: 3000,
    status: "In Stock",
    lastReceived: "2026-10-22",
    supplier: "Premier Open-End Mills",
    yarnCount: "30s Ne (19.7 Tex)",
    csp: "2,400",
    twistPerInch: "19.5 TPI",
    moistureRegain: "8.1%"
  },
  {
    id: "LOT-SLB-164",
    name: "16s Ring Slub Yarn (Indigo Warp Ready)",
    composition: "100% Virgin Cotton (Engineered Slub Pattern)",
    category: "Cotton Yarns",
    inStockQty: 4100,
    unit: "kg (82 Bags)",
    allocatedOrder: "ORD-8079",
    orderName: "Heritage Raw Selvedge Denim 13.5 Oz",
    storageLocation: "Warehouse Bay B-02",
    thresholdQty: 1800,
    status: "In Stock",
    lastReceived: "2026-10-25",
    supplier: "Arvind Denim Raw Materials",
    yarnCount: "16s Ne with Variable Slub Pitch",
    csp: "2,650",
    twistPerInch: "17.2 TPI",
    moistureRegain: "8.0%"
  },
  {
    id: "LOT-LIN-250",
    name: "25 Lea Wet-Spun Organic Belgian Flax Linen",
    composition: "100% European Flax (Wet-Spun Natural Bleached)",
    category: "Specialty & Bast Fibers",
    inStockQty: 3200,
    unit: "kg (64 Cones)",
    allocatedOrder: "ORD-8095",
    orderName: "Belgian Flax Linen Sheer 140 GSM",
    storageLocation: "Warehouse Bay C-01 (Controlled Humidity)",
    thresholdQty: 1200,
    status: "Ready for Loom",
    lastReceived: "2026-10-28",
    supplier: "Kingdom Flax & Linen Belgium",
    yarnCount: "25 Lea (66 Tex)",
    csp: "2,100 (High Flexural Rigidity)",
    twistPerInch: "14.0 TPI",
    moistureRegain: "11.2%"
  },
  {
    id: "LOT-COR-500",
    name: "500D High-Tenacity Cordura Polyamide 6,6",
    composition: "100% INVISTA Cordura Nylon (Air-Textured)",
    category: "Synthetics & Technical",
    inStockQty: 4600,
    unit: "kg (92 Cones)",
    allocatedOrder: "ORD-8088",
    orderName: "High-Tenacity Cordura Dobby 340 GSM",
    storageLocation: "Warehouse Bay C-04",
    thresholdQty: 1500,
    status: "In Stock",
    lastReceived: "2026-10-24",
    supplier: "INVISTA Advanced Technical Filaments",
    yarnCount: "500 Denier / 136 Filaments",
    csp: "Tenacity 8.2 g/denier",
    twistPerInch: "Air Jet Intermingled",
    moistureRegain: "4.2%"
  },
  {
    id: "LOT-SLK-202",
    name: "20/22D Grade 6A Mulberry Raw Silk Filaments",
    composition: "100% Pure Mulberry Silk (Class 6A High Luster)",
    category: "Specialty & Bast Fibers",
    inStockQty: 1850,
    unit: "kg (37 Hermetic Crates)",
    allocatedOrder: "Export Line",
    orderName: "Jacquard Silk Brocade & Sarees",
    storageLocation: "Secure Vault S-01 (Dehumidified)",
    thresholdQty: 800,
    status: "In Stock",
    lastReceived: "2026-10-20",
    supplier: "Mysore Silk Filature Guild",
    yarnCount: "20/22 Denier (Double-Fold)",
    csp: "Breaking Strength 3.8 g/d",
    twistPerInch: "12 TPI Tram Silk",
    moistureRegain: "10.5%"
  },
  {
    id: "LOT-MDL-601",
    name: "60s Micro-Modal Lenzing Tencel Blend",
    composition: "70% Lenzing MicroModal / 30% Combed Cotton",
    category: "Specialty & Bast Fibers",
    inStockQty: 420,
    unit: "kg (9 Bags)",
    allocatedOrder: "ORD-8098",
    orderName: "Micro-Modal Voile Jacquard 110 GSM",
    storageLocation: "Warehouse Bay C-02",
    thresholdQty: 1500,
    status: "Low Stock Alert",
    lastReceived: "2026-10-15",
    supplier: "Lenzing Fibers Austria",
    yarnCount: "60s Ne Micro (9.8 Tex)",
    csp: "2,750",
    twistPerInch: "26.5 TPI",
    moistureRegain: "12.0%"
  },
  {
    id: "BEAM-W104",
    name: "Sectional Warped Beam #104 (Width 190 cm)",
    composition: "5,800 Ends • 30s Organic Combed Cotton • Loom-Ready",
    category: "Warp Beams",
    inStockQty: 2,
    unit: "Full Beams (14,200 m total)",
    allocatedOrder: "ORD-8092",
    orderName: "Picanol Rapier Looms A01 & A02",
    storageLocation: "Beam Rack R-02 (Loom Shed A Staging)",
    thresholdQty: 1,
    status: "Ready for Loom",
    lastReceived: "2026-10-29",
    supplier: "In-House Warping Unit (WARP-01)",
    yarnCount: "Warp Density 128 EPI",
    csp: "Sized with 8% LoomShield",
    twistPerInch: "Direct Flanged",
    moistureRegain: "7.9%"
  },
  {
    id: "BEAM-W108",
    name: "Sectional Sized Beam #108 (Width 220 cm)",
    composition: "4,200 Ends • 40s Pure Wet-Spun Linen • Sized",
    category: "Warp Beams",
    inStockQty: 1,
    unit: "Full Beam (7,800 m total)",
    allocatedOrder: "ORD-8095",
    orderName: "Scheduled for Loom B01 Mounting",
    storageLocation: "Beam Rack R-04",
    thresholdQty: 1,
    status: "Ready for Loom",
    lastReceived: "2026-10-30",
    supplier: "In-House Warping Unit (WARP-01)",
    yarnCount: "Warp Density 58 EPI",
    csp: "Special Flax Sizing Applied",
    twistPerInch: "Direct Flanged",
    moistureRegain: "11.0%"
  },
  {
    id: "CHM-ST-101",
    name: "Modified Tapioca Starch + PVA Sizing Compound",
    composition: "Loom-Shield Pro High-Adhesion Textile Sizing Blend",
    category: "Chemicals & Dyes",
    inStockQty: 3500,
    unit: "kg (70 Multi-wall Sacks)",
    allocatedOrder: "All Warp Lines",
    orderName: "Sizing Kitchen Active Consumption",
    storageLocation: "Chemical Store Bay 1",
    thresholdQty: 1000,
    status: "In Stock",
    lastReceived: "2026-10-21",
    supplier: "Clariant Textile Chemicals",
    yarnCount: "Solids 12% at 85°C",
    csp: "Viscosity 240 mPa.s",
    twistPerInch: "Dry Powder Mix",
    moistureRegain: "N/A"
  },
  {
    id: "DYE-VER-88",
    name: "Reactive Vermilion Eco-Dye (C.I. Red 195)",
    composition: "Bifunctional Reactive Dye Powder (GOTS Approved)",
    category: "Chemicals & Dyes",
    inStockQty: 850,
    unit: "kg (17 Sealed HDPE Drums)",
    allocatedOrder: "ORD-8092",
    orderName: "Organic Twill Finishing Lot 4",
    storageLocation: "Dyes & Pigments Lab Storage",
    thresholdQty: 300,
    status: "In Stock",
    lastReceived: "2026-10-23",
    supplier: "Archroma Color Management",
    yarnCount: "Optical Density 99.2%",
    csp: "Lightfastness Grade 6",
    twistPerInch: "Micro-granulated",
    moistureRegain: "N/A"
  }
];

const INITIAL_MACHINES = [
  {
    id: "LOOM-A01",
    name: "Picanol OptiMax-i 190",
    type: "Rapier Loom",
    process: "Loom Weaving",
    status: "Running",
    lastUpdated: "10 mins ago",
    rpm: 580,
    efficiency: "94.2%",
    assignedOrder: "ORD-8092",
    line: "Line 1 - Shed A"
  },
  {
    id: "LOOM-A02",
    name: "Picanol OptiMax-i 190",
    type: "Rapier Loom",
    process: "Loom Weaving",
    status: "Running",
    lastUpdated: "15 mins ago",
    rpm: 575,
    efficiency: "92.8%",
    assignedOrder: "ORD-8092",
    line: "Line 1 - Shed A"
  },
  {
    id: "LOOM-A03",
    name: "Tsudakoma ZAX-9200i",
    type: "Airjet Loom",
    process: "Loom Weaving",
    status: "Breakdown",
    lastUpdated: "45 mins ago",
    rpm: 0,
    efficiency: "0%",
    assignedOrder: "ORD-8088",
    line: "Line 2 - Shed A",
    breakdownNote: "Sub-nozzle solenoid pressure failure; maintenance dispatched"
  },
  {
    id: "LOOM-A04",
    name: "Tsudakoma ZAX-9200i",
    type: "Airjet Loom",
    process: "Loom Weaving",
    status: "Running",
    lastUpdated: "5 mins ago",
    rpm: 880,
    efficiency: "96.5%",
    assignedOrder: "ORD-8079",
    line: "Line 2 - Shed A"
  },
  {
    id: "LOOM-A05",
    name: "Itema R9500-2 Denim",
    type: "Heavy Rapier Loom",
    process: "Loom Weaving",
    status: "Under Maintenance",
    lastUpdated: "1 hr ago",
    rpm: 0,
    efficiency: "0%",
    assignedOrder: "ORD-8084",
    line: "Line 3 - Shed B",
    breakdownNote: "Scheduled rapier ribbon lubrication & temple cutter alignment"
  },
  {
    id: "LOOM-A06",
    name: "Itema R9500-2 Denim",
    type: "Heavy Rapier Loom",
    process: "Loom Weaving",
    status: "Running",
    lastUpdated: "25 mins ago",
    rpm: 520,
    efficiency: "91.0%",
    assignedOrder: "ORD-8084",
    line: "Line 3 - Shed B"
  },
  {
    id: "LOOM-B01",
    name: "Toyota JAT810 Airjet",
    type: "Airjet Loom",
    process: "Loom Weaving",
    status: "Available",
    lastUpdated: "35 mins ago",
    rpm: 0,
    efficiency: "Standby",
    assignedOrder: "None",
    line: "Line 4 - Shed B"
  },
  {
    id: "LOOM-B02",
    name: "Toyota JAT810 Airjet",
    type: "Airjet Loom",
    process: "Loom Weaving",
    status: "Available",
    lastUpdated: "40 mins ago",
    rpm: 0,
    efficiency: "Standby",
    assignedOrder: "None",
    line: "Line 4 - Shed B"
  },
  {
    id: "WARP-01",
    name: "Karl Mayer PROWARP",
    type: "Sectional Warper",
    process: "Warping & Sizing",
    status: "Running",
    lastUpdated: "8 mins ago",
    rpm: 1000,
    efficiency: "98.0%",
    assignedOrder: "ORD-8095",
    line: "Warp Preparation Bay"
  },
  {
    id: "WARP-02",
    name: "Karl Mayer ROT-O-MATIC",
    type: "Direct Warper",
    process: "Warping & Sizing",
    status: "Available",
    lastUpdated: "2 hrs ago",
    rpm: 0,
    efficiency: "Standby",
    assignedOrder: "None",
    line: "Warp Preparation Bay"
  },
  {
    id: "SIZE-01",
    name: "Benninger ISOSIZE Range",
    type: "Sizing Range",
    process: "Warping & Sizing",
    status: "Running",
    lastUpdated: "18 mins ago",
    rpm: 120,
    efficiency: "95.4%",
    assignedOrder: "ORD-8095",
    line: "Sizing Bay 1"
  },
  {
    id: "QC-INSP-01",
    name: "Uster FabricScan Frame",
    type: "Optical Inspection Frame",
    process: "Quality Check",
    status: "Running",
    lastUpdated: "12 mins ago",
    rpm: 45,
    efficiency: "99.1%",
    assignedOrder: "ORD-8079",
    line: "Quality Audit Room"
  }
];

const INITIAL_PRODUCTION_LOGS = [
  {
    id: "PROD-LOG-101",
    orderId: "ORD-8092",
    fabricName: "Organic Combed Cotton Twill 220 GSM",
    date: "2026-10-30",
    process: "4. Loom Weaving",
    dailyTarget: 1200,
    actualQty: 1150,
    defectiveQty: 18,
    notes: "Shift A output high; warp yarn tension calibrated at 07:00 AM.",
    supervisor: "Rajesh Kumar",
    timestamp: "10:30 AM"
  },
  {
    id: "PROD-LOG-102",
    orderId: "ORD-8088",
    fabricName: "High-Tenacity Cordura Dobby 340 GSM",
    date: "2026-10-30",
    process: "4. Loom Weaving",
    dailyTarget: 1500,
    actualQty: 620,
    defectiveQty: 34,
    notes: "Production interrupted due to Tsudakoma Airjet solenoid malfunction.",
    supervisor: "Rajesh Kumar",
    timestamp: "09:45 AM"
  },
  {
    id: "PROD-LOG-103",
    orderId: "ORD-8084",
    fabricName: "Indigo Selvedge Denim 13.5 Oz",
    date: "2026-10-30",
    process: "4. Loom Weaving",
    dailyTarget: 900,
    actualQty: 780,
    defectiveQty: 12,
    notes: "Running on Denim Rapier 2 smoothly; Denim Rapier 1 undergoing ribbon maintenance.",
    supervisor: "Rajesh Kumar",
    timestamp: "08:15 AM"
  },
  {
    id: "PROD-LOG-104",
    orderId: "ORD-8079",
    fabricName: "Mercerized Poplin Shirting 125 GSM",
    date: "2026-10-30",
    process: "6. Quality Check",
    dailyTarget: 1400,
    actualQty: 870,
    defectiveQty: 8,
    notes: "High pass rate on Uster inspection frame. 0.9% grade B salvage.",
    supervisor: "Rajesh Kumar",
    timestamp: "11:10 AM"
  }
];

const INITIAL_ISSUES = [
  {
    id: "ISS-401",
    category: "Machine Breakdown",
    relatedOrder: "ORD-8088",
    machineId: "LOOM-A03",
    date: "2026-10-30",
    time: "08:15 AM",
    severity: "Critical",
    description: "Sub-nozzle solenoid valve pressure drop on Tsudakoma Airjet Line 2 causing continuous weft mispicks.",
    impact: "Line halted; 450 meters daily deficit expected if downtime exceeds 3 hours.",
    status: "Technician Assigned",
    adminResponse: "Maintenance Engineer Senthil Kumar dispatched with spare solenoid pack. Expected resolution 12:30 PM."
  },
  {
    id: "ISS-402",
    category: "Material Shortage",
    relatedOrder: "ORD-8098",
    machineId: "WARP-02",
    date: "2026-10-30",
    time: "09:40 AM",
    severity: "High",
    description: "Shortage of 60s Micro-Modal yarn batch; only 400kg received against 1,200kg procurement indent.",
    impact: "Cannot initiate beam winding for Warp Line 2.",
    status: "Under Investigation",
    adminResponse: "Procurement contacted Tirupur warehouse. Buffer shipment of 800kg is scheduled for 3:00 PM today."
  },
  {
    id: "ISS-403",
    category: "Quality Issue",
    relatedOrder: "ORD-8084",
    machineId: "LOOM-A05",
    date: "2026-10-29",
    time: "15:20 PM",
    severity: "Medium",
    description: "Selvedge tension variation noted on heavy denim weave causing edge curl on outer 2 inches.",
    impact: "Minor trimming required; rapier timing requires 0.5mm realignment.",
    status: "Resolved",
    adminResponse: "Loom technician calibrated temple cutters and tension bar. Re-inspection passed 100% on test roll."
  },
  {
    id: "ISS-404",
    category: "Employee Shortage",
    relatedOrder: "ORD-8092",
    machineId: "LOOM-A01",
    date: "2026-10-30",
    time: "06:30 AM",
    severity: "Low",
    description: "Two creel helpers absent in Shift A; need cross-deployment from packaging for 2 hours.",
    impact: "30-minute delay in beam loading.",
    status: "Resolved",
    adminResponse: "Supervisor approved temporary cross-assignment of 2 operators from Shed C packaging team."
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-01",
    type: "order",
    title: "New Manufacturing Order Assigned",
    message: "Belgian Flax Linen Sheer 140 GSM (6,500m) assigned to your weaving section by Factory Admin.",
    timestamp: "2 hours ago",
    timeFormatted: "Today, 07:15 AM",
    isRead: false,
    linkPage: "orders",
    refId: "ORD-8095"
  },
  {
    id: "NOTIF-02",
    type: "breakdown",
    title: "Machine Breakdown Alert: Tsudakoma Airjet",
    message: "Tsudakoma ZAX-9200i reported solenoid pressure failure. Cordura Dobby production temporarily paused.",
    timestamp: "3 hours ago",
    timeFormatted: "Today, 08:15 AM",
    isRead: false,
    linkPage: "resources",
    refId: "LOOM-A03"
  },
  {
    id: "NOTIF-03",
    type: "deadline",
    title: "Production Deadline Approaching",
    message: "Cordura Dobby 340 GSM delivery deadline is in 3 days (02 Nov 2026). Currently marked At Risk.",
    timestamp: "4 hours ago",
    timeFormatted: "Today, 06:00 AM",
    isRead: false,
    linkPage: "orders",
    refId: "ORD-8088"
  },
  {
    id: "NOTIF-04",
    type: "admin",
    title: "Admin Response: Maintenance Engineer Dispatched",
    message: "Plant Manager responded: 'Maintenance Engineer Senthil dispatched with spare solenoid pack.'",
    timestamp: "1 hour ago",
    timeFormatted: "Today, 09:30 AM",
    isRead: true,
    linkPage: "issues",
    refId: "ISS-401"
  },
  {
    id: "NOTIF-05",
    type: "shortage",
    title: "Material Shortage Flagged",
    message: "60s Micro-Modal yarn batch shortage flagged for Micro-Modal Satin Weave. Buffer shipment expected at 3:00 PM.",
    timestamp: "5 hours ago",
    timeFormatted: "Today, 09:40 AM",
    isRead: true,
    linkPage: "issues",
    refId: "ISS-402"
  },
  {
    id: "NOTIF-06",
    type: "production",
    title: "Shift Operations Running",
    message: "Morning Shift A running at 93.8% efficiency across all operational loom lines.",
    timestamp: "6 hours ago",
    timeFormatted: "Today, 06:30 AM",
    isRead: true,
    linkPage: "attendance",
    refId: "Shift A"
  },
  {
    id: "NOTIF-07",
    type: "production",
    title: "Daily Production Target Update",
    message: "3,420 meters produced today out of 4,000 meters daily shift target (85.5% achieved).",
    timestamp: "30 mins ago",
    timeFormatted: "Today, 11:30 AM",
    isRead: false,
    linkPage: "production",
    refId: "Shift A"
  }
];

// Data Store API with localStorage persistence
class DataStore {
  constructor() {
    this.init();
  }

  init() {
    const DATA_VERSION = 'v2_clean_no_ids';
    if (localStorage.getItem('loompilot_data_version') !== DATA_VERSION) {
      this.resetToDefaults();
      localStorage.setItem('loompilot_data_version', DATA_VERSION);
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(INITIAL_RAW_MATERIALS));
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(INITIAL_MACHINES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTION_LOGS, JSON.stringify(INITIAL_PRODUCTION_LOGS));
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(INITIAL_ISSUES));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
  }

  // Generic Get/Set
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return null;
    }
  }

  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
    }
  }

  // Specialized getters
  getOrders() { return this.get(STORAGE_KEYS.ORDERS) || INITIAL_ORDERS; }
  saveOrders(orders) { this.set(STORAGE_KEYS.ORDERS, orders); }

  getEmployees() { return this.get(STORAGE_KEYS.EMPLOYEES) || INITIAL_EMPLOYEES; }
  saveEmployees(emps) { this.set(STORAGE_KEYS.EMPLOYEES, emps); }

  getMaterials() { return this.get(STORAGE_KEYS.RAW_MATERIALS) || INITIAL_RAW_MATERIALS; }
  saveMaterials(materials) { this.set(STORAGE_KEYS.RAW_MATERIALS, materials); }

  getMachines() { return this.get(STORAGE_KEYS.MACHINES) || INITIAL_MACHINES; }
  saveMachines(machines) { this.set(STORAGE_KEYS.MACHINES, machines); }

  getProductionLogs() { return this.get(STORAGE_KEYS.PRODUCTION_LOGS) || INITIAL_PRODUCTION_LOGS; }
  saveProductionLogs(logs) { this.set(STORAGE_KEYS.PRODUCTION_LOGS, logs); }

  getIssues() { return this.get(STORAGE_KEYS.ISSUES) || INITIAL_ISSUES; }
  saveIssues(issues) { this.set(STORAGE_KEYS.ISSUES, issues); }

  getNotifications() { return this.get(STORAGE_KEYS.NOTIFICATIONS) || INITIAL_NOTIFICATIONS; }
  saveNotifications(notifs) { this.set(STORAGE_KEYS.NOTIFICATIONS, notifs); }

  getProfile() { return this.get(STORAGE_KEYS.PROFILE) || INITIAL_PROFILE; }
  saveProfile(profile) { this.set(STORAGE_KEYS.PROFILE, profile); }

  // Helpers
  getUnreadNotificationCount() {
    const list = this.getNotifications();
    return list.filter(n => !n.isRead).length;
  }
}

// Global data store instance
const store = new DataStore();
if (typeof window !== 'undefined') window.store = store;
if (typeof global !== 'undefined') global.store = store;


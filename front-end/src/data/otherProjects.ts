export type OtherProjectCategory =
	| "Research & engineering"
	| "Legal & civic tools"
	| "Software & games"
	| "Public web platforms"
	| "Teaching & curriculum"
	| "Product concepts";

export type OtherProjectStatusTone =
	"active" | "completed" | "live" | "maintained" | "preview" | "prototype" | "published";

export interface OtherProjectLink {
	href: string;
	label: string;
}

export interface OtherProject {
	category: OtherProjectCategory;
	defaultVisible: boolean;
	links: OtherProjectLink[];
	name: string;
	slug: string;
	status: string;
	statusNote: string;
	statusTone: OtherProjectStatusTone;
	summary: string;
	tags: string[];
	timeframe: string;
}

export const otherProjectCategories: OtherProjectCategory[] = [
	"Research & engineering",
	"Legal & civic tools",
	"Software & games",
	"Public web platforms",
	"Teaching & curriculum",
	"Product concepts"
];

export const otherProjects: OtherProject[] = [
	{
		slug: "oscre",
		name: "OSCRE Radiation-Effects Simulation Framework",
		category: "Research & engineering",
		timeframe: "2024 – 2025",
		status: "Published",
		statusTone: "published",
		statusNote: "Research workflow and ISCAS 2025 publication completed.",
		summary:
			"Open-source Xschem and Ngspice workflow for repeatable circuit-level single-event-effects studies across collaborating institutions.",
		tags: ["Circuit simulation", "Ngspice", "Research tooling"],
		links: [
			{ label: "Repository", href: "https://github.com/Jacoba1100254352/OSCRE" },
			{ label: "Publication", href: "https://doi.org/10.1109/ISCAS56072.2025.11043386" }
		],
		defaultVisible: true
	},
	{
		slug: "industrial-drill-monitoring",
		name: "Industrial Drill Monitoring Platform",
		category: "Research & engineering",
		timeframe: "2024",
		status: "Completed",
		statusTone: "completed",
		statusNote: "Delivered as a BYU capstone project for Epiroc.",
		summary:
			"BLE-connected monitoring interface that brought temperature and pressure telemetry from industrial drill hardware into operator and engineering views.",
		tags: ["BLE", "Telemetry", "Embedded systems"],
		links: [],
		defaultVisible: true
	},
	{
		slug: "glucose-monitoring-research",
		name: "Non-Invasive Glucose Monitoring Research Tooling",
		category: "Research & engineering",
		timeframe: "2022 – 2024",
		status: "Completed",
		statusTone: "completed",
		statusNote: "Research contribution completed before graduation.",
		summary:
			"Sensor integration, calibration, signal-processing, and analysis pipelines for a multidisciplinary non-invasive glucose-monitoring research program.",
		tags: ["Sensors", "MATLAB", "Python"],
		links: [{ label: "Calibration tooling", href: "https://github.com/Jacoba1100254352/Calibration-Programs" }],
		defaultVisible: true
	},
	{
		slug: "graphsketcher-desktop",
		name: "GraphSketcher Desktop Ports",
		category: "Research & engineering",
		timeframe: "2026 – Present",
		status: "Early preview",
		statusTone: "preview",
		statusNote: "Useful public previews are available while feature-parity work continues.",
		summary:
			"Independent Windows and Linux ports of the direct-manipulation GraphSketcher app, rebuilt with a portable C# core and Avalonia UI.",
		tags: ["C#", "Avalonia", "Data visualization"],
		links: [
			{ label: "Windows", href: "https://github.com/Jacoba1100254352/GraphSketcher.Windows" },
			{ label: "Linux", href: "https://github.com/Jacoba1100254352/GraphSketcher.Linux" }
		],
		defaultVisible: true
	},
	{
		slug: "pysynth-unified",
		name: "PySynth Unified",
		category: "Research & engineering",
		timeframe: "2025 – Present",
		status: "Maintained",
		statusTone: "maintained",
		statusNote: "Modernized package and compatibility work remains maintained.",
		summary:
			"Unified Python package and command-line interface for legacy PySynth engines, with compatibility layers, MIDI and ABC input, and current Python support.",
		tags: ["Python", "Audio", "Packaging"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/PySynth-Unified" }],
		defaultVisible: true
	},
	{
		slug: "ecen-427-http-modules",
		name: "Apache HTTP Security Modules",
		category: "Research & engineering",
		timeframe: "2025",
		status: "Completed",
		statusTone: "completed",
		statusNote: "Completed computer-security coursework artifacts.",
		summary:
			"C modules for setting bounded HTTP headers and recording selected request fingerprints within an Apache classroom environment.",
		tags: ["C", "Apache", "Web security"],
		links: [
			{ label: "Headers module", href: "https://github.com/byu-ecen427-classroom/mod_http_headers" },
			{
				label: "Fingerprint module",
				href: "https://github.com/byu-ecen427-classroom/mod_http_fingerprint_log"
			}
		],
		defaultVisible: true
	},
	{
		slug: "ece-6100-course-companion",
		name: "Advanced Computer Architecture Course Companion",
		category: "Research & engineering",
		timeframe: "2026",
		status: "In progress",
		statusTone: "active",
		statusNote: "Draft LaTeX course companion and study material.",
		summary:
			"Structured notes and explanatory material developed alongside Georgia Tech advanced computer architecture coursework.",
		tags: ["Computer architecture", "LaTeX", "Technical writing"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/ECE-6100-textbook" }],
		defaultVisible: true
	},
	{
		slug: "scopecraft",
		name: "ScopeCraft",
		category: "Legal & civic tools",
		timeframe: "2026 – Present",
		status: "Released",
		statusTone: "live",
		statusNote: "Public educational release with one complete drafting challenge.",
		summary:
			"Educational patent-claim drafting game covering disclosure review, claim structure, examination, amendment, design-around analysis, and debriefing.",
		tags: ["Legal education", "Patent drafting", "React"],
		links: [
			{ label: "Open ScopeCraft", href: "https://patentpractice.jacobdanderson.net" },
			{ label: "Repository", href: "https://github.com/Jacoba1100254352/patentpractice.jacobdanderson.net" }
		],
		defaultVisible: true
	},
	{
		slug: "civ-pro-trial-ready",
		name: "Civ Pro: Trial Ready",
		category: "Legal & civic tools",
		timeframe: "2026",
		status: "Prototype",
		statusTone: "prototype",
		statusNote: "Playable version 0.2 browser prototype.",
		summary:
			"Competitive Civil Procedure card-game prototype with tutorial and professor modes, doctrine tests, printable cards, and reviewed source artifacts.",
		tags: ["Legal education", "Game design", "JavaScript"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/Civ-Pro-Game" }],
		defaultVisible: true
	},
	{
		slug: "congress-institutional-simulator",
		name: "Congress Institutional Simulator",
		category: "Legal & civic tools",
		timeframe: "2026 – Present",
		status: "Active research",
		statusTone: "active",
		statusNote: "Simulator, reproducible reports, and manuscript remain under active development.",
		summary:
			"Java comparative institutional-design simulator for stress-testing legislative mechanism bundles under shared synthetic worlds.",
		tags: ["Java", "Simulation", "Institutional design"],
		links: [
			{
				label: "Repository",
				href: "https://github.com/Jacoba1100254352/congress-institutional-simulator"
			}
		],
		defaultVisible: true
	},
	{
		slug: "constitutional-review-simulator",
		name: "Constitutional Review Simulator",
		category: "Legal & civic tools",
		timeframe: "2026 – Present",
		status: "Active research",
		statusTone: "active",
		statusNote: "Scenario, sensitivity, and paired-campaign work is active.",
		summary:
			"Dependency-free Java model for comparing constitutional-review designs across access, cost, compliance, rights pressure, and veto-relocation tradeoffs.",
		tags: ["Java", "Constitutional design", "Reproducible research"],
		links: [
			{
				label: "Repository",
				href: "https://github.com/Jacoba1100254352/constitutional-review-simulator"
			}
		],
		defaultVisible: true
	},
	{
		slug: "lobby-capture-simulator",
		name: "Lobby Capture Simulator",
		category: "Legal & civic tools",
		timeframe: "2026 – Present",
		status: "Active research",
		statusTone: "active",
		statusNote: "Calibration, validation, and manuscript workflows remain active.",
		summary:
			"Simulation of lobbying, campaign finance, regulatory capture, and anti-capture reforms across legislative and administrative arenas.",
		tags: ["Java", "Public policy", "Calibration"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/lobby-capture-simulator" }],
		defaultVisible: true
	},
	{
		slug: "ballot-clarity",
		name: "Ballot Clarity",
		category: "Legal & civic tools",
		timeframe: "2026 – Present",
		status: "MVP",
		statusTone: "prototype",
		statusNote: "Fulton County is the first reviewed launch jurisdiction.",
		summary:
			"Nonpartisan civic-information platform for address-based lookup, representative context, official election resources, and source-transparent local guides.",
		tags: ["Civic information", "Nuxt", "Source review"],
		links: [
			{ label: "Live site", href: "https://ballotclarity.org" },
			{ label: "Repository", href: "https://github.com/anderson-webops/ballotclarity.org" }
		],
		defaultVisible: true
	},
	{
		slug: "is-there-consensus",
		name: "Is There Consensus?",
		category: "Legal & civic tools",
		timeframe: "2025 – Present",
		status: "Live",
		statusTone: "live",
		statusNote: "Public evidence-literacy site with ongoing source and content work.",
		summary:
			"Public-interest site for examining whether scientific claims reflect broad agreement, active debate, weak evidence, or misleading headlines.",
		tags: ["Evidence literacy", "Science communication", "Nuxt"],
		links: [
			{ label: "Live site", href: "https://isthereconsensus.org" },
			{ label: "Repository", href: "https://github.com/anderson-webops/isthereconsensus.org" }
		],
		defaultVisible: true
	},
	{
		slug: "incan-gold-strategy-tester",
		name: "Incan Gold Strategy Tester",
		category: "Software & games",
		timeframe: "2025 – Present",
		status: "Maintained",
		statusTone: "maintained",
		statusNote: "Reproducible strategy sweeps and validation tooling are maintained.",
		summary:
			"Java simulator for comparing Incan Gold strategies with common seed schedules, confidence intervals, player-count sweeps, and finalist validation.",
		tags: ["Java", "Monte Carlo simulation", "Game strategy"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/Incan-Gold-Strategy-Tester" }],
		defaultVisible: true
	},
	{
		slug: "zilch-game-family",
		name: "Zilch Game Family",
		category: "Software & games",
		timeframe: "2018 – Present",
		status: "Playable",
		statusTone: "maintained",
		statusNote: "Visual Java implementation and earlier C++ variants remain available.",
		summary:
			"Multiple implementations and strategy experiments for the Zilch dice game, including a LibGDX interface, configurable rules, and optional stealing.",
		tags: ["Java", "C++", "LibGDX"],
		links: [
			{ label: "Zilch Basic", href: "https://github.com/Jacoba1100254352/Zilch-Basic" },
			{ label: "Original C++ game", href: "https://github.com/Jacoba1100254352/Zilch" },
			{
				label: "Strategy trainer",
				href: "https://github.com/Jacoba1100254352/Computers_vs_Zilch"
			}
		],
		defaultVisible: true
	},
	{
		slug: "boggle",
		name: "Boggle for macOS",
		category: "Software & games",
		timeframe: "2026",
		status: "Playable",
		statusTone: "maintained",
		statusNote: "Gameplay and visual refinement reached a stable public state.",
		summary:
			"Swift implementation of Boggle with a native macOS interface, reproducible word validation, and iterative gameplay refinement.",
		tags: ["Swift", "macOS", "Game development"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/Boggle" }],
		defaultVisible: true
	},
	{
		slug: "cofoundry",
		name: "CoFoundry",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "MVP",
		statusTone: "prototype",
		statusNote: "Production-minded prototype with mock and provider-ready paths.",
		summary:
			"Founder and collaborator matching platform with venture workspaces, structured proposals, agreements, team decisions, and optional governed investment review.",
		tags: ["Nuxt", "Product design", "Supabase-ready"],
		links: [{ label: "Live prototype", href: "https://cofoundry.jacobdanderson.net" }],
		defaultVisible: true
	},
	{
		slug: "np-service-request",
		name: "NP Service Request",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "Public beta",
		statusTone: "live",
		statusNote: "Live community board with ongoing moderation and provider work.",
		summary:
			"Community board for service requests, borrowing, lending, replies, location-aware discovery, and curated service-directory resources.",
		tags: ["Community platform", "Nuxt", "Express"],
		links: [
			{ label: "Live site", href: "https://np-servicerequest.org" },
			{ label: "Repository", href: "https://github.com/anderson-webops/np-servicerequest.org" }
		],
		defaultVisible: true
	},
	{
		slug: "operation-opportunity",
		name: "Operation Opportunity",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "Pilot",
		statusTone: "prototype",
		statusNote: "Tutor and participant workflow remains a bounded pilot.",
		summary:
			"Role-aware volunteer tutoring platform with participant assignment, tutor approval, and carefully bounded administrator workflows.",
		tags: ["Vue", "MongoDB", "Volunteer coordination"],
		links: [
			{ label: "Project site", href: "https://operationopportunity.jacobdanderson.net" },
			{
				label: "Repository",
				href: "https://github.com/anderson-webops/operationopportunity.jacobdanderson.net"
			}
		],
		defaultVisible: true
	},
	{
		slug: "retroverse",
		name: "Retro Zetro Comics and the Retroverse",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "Live",
		statusTone: "live",
		statusNote: "Production site with an owner-managed content system.",
		summary:
			"Comics and world-building platform with story arcs, characters, artwork, media management, contact delivery, and a protected owner console.",
		tags: ["Vue", "MongoDB", "Content management"],
		links: [
			{ label: "Live site", href: "https://retrozetrocomics.com" },
			{ label: "Repository", href: "https://github.com/anderson-webops/retrozetrocomics.com" }
		],
		defaultVisible: true
	},
	{
		slug: "agroindustria-torca",
		name: "Agroindustria Torca",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "Live catalog",
		statusTone: "live",
		statusNote: "Public catalog is live; online ordering remains intentionally disabled.",
		summary:
			"Spanish-language agricultural product catalog with device-local visit planning, WhatsApp availability inquiries, and a guarded future ordering path.",
		tags: ["Vue", "Product catalog", "Spanish"],
		links: [{ label: "Live site", href: "https://agroindustriatorca.com" }],
		defaultVisible: true
	},
	{
		slug: "marietta-violin",
		name: "Marietta Violin with Carla",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "Live",
		statusTone: "live",
		statusNote: "Static studio site with an owner-editable content workflow.",
		summary:
			"Accessible violin-studio website with lesson information, a privacy-aware request form, and a nontechnical content-editing path for the owner.",
		tags: ["Nuxt", "Accessibility", "Client website"],
		links: [
			{ label: "Live site", href: "https://mariettaviolinwithcarla.com" },
			{ label: "Repository", href: "https://github.com/anderson-webops/mariettaviolinwithcarla.com" }
		],
		defaultVisible: true
	},
	{
		slug: "the-restoration",
		name: "The Restoration History Site",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "Live",
		statusTone: "live",
		statusNote: "Public history site with a bounded contact service.",
		summary:
			"Static public-history experience backed by a small, hardened contact API and a direct atomic release process.",
		tags: ["Vue", "Public history", "Web operations"],
		links: [
			{ label: "Live site", href: "https://therestoration.jacobdanderson.net" },
			{
				label: "Repository",
				href: "https://github.com/anderson-webops/therestoration.jacobdanderson.net"
			}
		],
		defaultVisible: true
	},
	{
		slug: "personal-portfolio",
		name: "Jacob Anderson Professional Portfolio",
		category: "Public web platforms",
		timeframe: "2023 – Present",
		status: "Live",
		statusTone: "live",
		statusNote: "Current professional portfolio and deployment system.",
		summary:
			"The site you are viewing, including source-backed professional content, downloadable resumes, release identity, accessibility checks, and direct deployment safeguards.",
		tags: ["Vue", "Vite SSG", "Portfolio"],
		links: [
			{ label: "Home", href: "https://jacobdanderson.net" },
			{ label: "Repository", href: "https://github.com/anderson-webops/jacobdanderson.net" }
		],
		defaultVisible: true
	},
	{
		slug: "webops-template",
		name: "Vitesse Nuxt Web Platform Template",
		category: "Public web platforms",
		timeframe: "2024 – Present",
		status: "Maintained",
		statusTone: "maintained",
		statusNote: "Shared foundation for several public web projects.",
		summary:
			"Reusable Nuxt and Express monorepo foundation with workspace tooling, deployment conventions, validation scripts, and security-conscious defaults.",
		tags: ["Nuxt", "Express", "Developer tooling"],
		links: [{ label: "Repository", href: "https://github.com/anderson-webops/vitesse-nuxt-template" }],
		defaultVisible: true
	},
	{
		slug: "classes-with-jacob",
		name: "Classes with Jacob Platform",
		category: "Teaching & curriculum",
		timeframe: "2025 – Present",
		status: "Active",
		statusTone: "active",
		statusNote: "Live teaching, scheduling, curriculum, and student-project platform.",
		summary:
			"Public teaching site and supporting course platform for private programming, STEM, math, and Spanish instruction.",
		tags: ["Teaching", "Vue", "Curriculum"],
		links: [
			{ label: "Teaching site", href: "https://classes.jacobdanderson.net" },
			{ label: "Repository", href: "https://github.com/anderson-webops/classes.jacobdanderson.net" }
		],
		defaultVisible: true
	},
	{
		slug: "instruction-material-library",
		name: "Programming Curriculum Library",
		category: "Teaching & curriculum",
		timeframe: "2025 – Present",
		status: "Active",
		statusTone: "active",
		statusNote: "Course families are maintained as a shared public organization.",
		summary:
			"Source organization for programming and systems courses spanning Python, Java, C, C++, web development, security, algorithms, AI, and game development.",
		tags: ["Curriculum", "Programming", "Open course materials"],
		links: [
			{ label: "GitHub organization", href: "https://github.com/instruction-material" },
			{
				label: "Curriculum repository",
				href: "https://github.com/instruction-material/classes.jacobdanderson.net"
			}
		],
		defaultVisible: true
	},
	{
		slug: "avasan-classroom-network",
		name: "Avasan Classroom Network",
		category: "Teaching & curriculum",
		timeframe: "2026 – Present",
		status: "Live",
		statusTone: "live",
		statusNote: "Public computer-science and math classrooms are live.",
		summary:
			"Simplified grade-school course network with anonymous browsing, a browser Python IDE, classroom games, Graph Sketcher, and a fifteen-course math sequence.",
		tags: ["K-12 education", "Browser IDE", "Graphing"],
		links: [
			{ label: "Teaching home", href: "https://avasan.org" },
			{ label: "Computer science", href: "https://cs.avasan.org" },
			{ label: "Math", href: "https://math.avasan.org" }
		],
		defaultVisible: true
	},
	{
		slug: "audiot",
		name: "AudioT Technical Operations",
		category: "Product concepts",
		timeframe: "2025 – Present",
		status: "Active",
		statusTone: "active",
		statusNote: "Ongoing technical operations and product support.",
		summary:
			"Audio capture, transcription, synchronization, website migration, and field-operations support for a storytelling and recording venture.",
		tags: ["Audio systems", "Operations", "Web migration"],
		links: [{ label: "AudioT", href: "https://audiot.ai" }],
		defaultVisible: true
	},
	{
		slug: "stride",
		name: "Stride Search-and-Rescue Device Concept",
		category: "Product concepts",
		timeframe: "2025 – 2026",
		status: "Prototype",
		statusTone: "prototype",
		statusNote: "Prototype-stage product and operations work.",
		summary:
			"Rental-based backcountry safety concept combining SOS and non-emergency alerts, location reporting, family coordination, and responder support.",
		tags: ["Satellite communication", "Product architecture", "Safety"],
		links: [
			{ label: "Project site", href: "https://stridewithus.co" },
			{
				label: "Beacon firmware",
				href: "https://github.com/Jacoba1100254352/iridium-satellite-comm"
			}
		],
		defaultVisible: true
	}
];

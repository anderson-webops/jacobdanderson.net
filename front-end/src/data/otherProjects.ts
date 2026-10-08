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
		name: "OSCRE Circuit Simulation",
		category: "Research & engineering",
		timeframe: "2024 – 2025",
		status: "Published",
		statusTone: "published",
		statusNote: "",
		summary:
			"I co-authored the ISCAS 2025 paper on OSCRE, an open-source framework for studying radiation effects on circuits, and contributed simulation workflows and documentation.",
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
		statusNote: "",
		summary:
			"A BYU capstone demo for Epiroc that brought temperature and pressure readings from industrial drill hardware into a monitoring interface using Bluetooth Low Energy.",
		tags: ["BLE", "Telemetry", "Embedded systems"],
		links: [],
		defaultVisible: true
	},
	{
		slug: "glucose-monitoring-research",
		name: "Glucose-Monitoring Research",
		category: "Research & engineering",
		timeframe: "2022 – 2024",
		status: "Completed",
		statusTone: "completed",
		statusNote: "Research prototype, not a clinical product.",
		summary:
			"Hardware, calibration, and data-analysis tools for non-invasive glucose-monitoring research at BYU. My work connected sensing hardware with MATLAB and Python processing pipelines.",
		tags: ["Sensors", "MATLAB", "Python"],
		links: [{ label: "Calibration tooling", href: "https://github.com/Jacoba1100254352/Calibration-Programs" }],
		defaultVisible: true
	},
	{
		slug: "graphsketcher-desktop",
		name: "GraphSketcher for Windows and Linux",
		category: "Research & engineering",
		timeframe: "2026 – Present",
		status: "Early preview",
		statusTone: "preview",
		statusNote: "Some features from the original app are still being brought over.",
		summary:
			"Windows and Linux versions of GraphSketcher, an app for drawing and adjusting graphs directly. Rebuilt with a shared C# core and Avalonia interface.",
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
		statusNote: "",
		summary:
			"A Python package for generating audio from musical notes. It brings earlier PySynth engines together, supports MIDI and ABC input, and updates compatibility with Python.",
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
		statusNote: "Coursework, not a production security product.",
		summary:
			"Computer-security coursework implementing Apache modules in C. The modules set HTTP headers and log selected request characteristics in a classroom server environment.",
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
		name: "Computer Architecture Course Companion",
		category: "Research & engineering",
		timeframe: "2026",
		status: "In progress",
		statusTone: "active",
		statusNote: "Draft study material.",
		summary:
			"A study guide developed alongside Georgia Tech advanced computer architecture coursework, organizing technical explanations and course notes for review and reference.",
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
		statusNote: "Educational practice, not legal advice.",
		summary:
			"A patent-claim drafting game that takes learners from an invention disclosure through drafting, examination, and amendment, with feedback on claim structure and design-around risks.",
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
		statusNote: "Playable browser prototype.",
		summary:
			"A competitive card game for learning Civil Procedure. Includes guided play, a teaching mode, doctrine checks, and printable cards for classroom use.",
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
		statusNote: "Synthetic model comparisons, not forecasts of real legislative outcomes.",
		summary:
			"A Java research simulator comparing legislative rules under the same simulated conditions, to study how combinations of institutional choices affect modeled outcomes.",
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
		statusNote: "Comparative research model, not a policy forecast.",
		summary:
			"A Java research model comparing constitutional-review systems. It explores tradeoffs in access, cost, compliance, rights protection, and where decisions can be blocked.",
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
		statusNote: "Research model; results depend on its assumptions and validation.",
		summary:
			"A research simulator examining lobbying, campaign finance, and regulatory capture, including how proposed reforms affect modeled legislative and administrative decisions under different assumptions.",
		tags: ["Java", "Public policy", "Calibration"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/lobby-capture-simulator" }],
		defaultVisible: true
	},
	{
		slug: "ballot-clarity",
		name: "Ballot Clarity",
		category: "Legal & civic tools",
		timeframe: "2026 – Present",
		status: "Early version",
		statusTone: "prototype",
		statusNote: "Fulton County is the first reviewed launch jurisdiction.",
		summary:
			"A nonpartisan site helping residents find representatives and official election resources by address, with local guides that identify the sources behind their information.",
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
		statusNote: "",
		summary:
			"A public-interest site for examining scientific claims and their supporting evidence, distinguishing broad agreement from active debate, weak evidence, and misleading headlines.",
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
		statusNote: "Comparisons apply to the tested strategies and rules.",
		summary:
			"A Java simulator comparing Incan Gold strategies across player counts. Repeated trials, shared random seeds, and confidence intervals help separate performance differences from chance.",
		tags: ["Java", "Monte Carlo simulation", "Game strategy"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/Incan-Gold-Strategy-Tester" }],
		defaultVisible: true
	},
	{
		slug: "zilch-game-family",
		name: "Zilch Dice Games",
		category: "Software & games",
		timeframe: "2018 – Present",
		status: "Playable",
		statusTone: "maintained",
		statusNote: "",
		summary:
			"Java and C++ versions of the Zilch dice game, with a visual interface, configurable rules, optional stealing, and experiments comparing computer-player strategies.",
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
		statusNote: "",
		summary:
			"A native macOS Boggle game built in Swift, with a word-validation system and a desktop interface refined through repeated gameplay and visual checks.",
		tags: ["Swift", "macOS", "Game development"],
		links: [{ label: "Repository", href: "https://github.com/Jacoba1100254352/Boggle" }],
		defaultVisible: true
	},
	{
		slug: "cofoundry",
		name: "CoFoundry",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "Early version",
		statusTone: "prototype",
		statusNote: "Prototype; some workflows use demonstration data.",
		summary:
			"A platform concept for matching founders and collaborators, then helping teams organize a venture through shared workspaces, proposals, agreements, and team decisions.",
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
		statusNote: "",
		summary:
			"A community board for requesting services, borrowing and lending items, and finding local resources. Members can browse nearby requests and reply to one another.",
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
		statusNote: "Limited pilot, not a broadly launched service.",
		summary:
			"A volunteer tutoring platform that helps organizers approve tutors, assign participants, and coordinate lessons, with separate tools for tutors, participants, and administrators.",
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
		name: "Retro Zetro Comics",
		category: "Public web platforms",
		timeframe: "2025 – Present",
		status: "Live",
		statusTone: "live",
		statusNote: "",
		summary:
			"A comics and world-building site for exploring the Retroverse through stories, characters, and artwork, with tools for its owner to publish and manage content.",
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
		statusNote: "Online ordering is not enabled.",
		summary:
			"A Spanish-language agricultural product catalog where visitors can browse items, plan a visit, and ask about availability through WhatsApp before contacting the business.",
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
		statusNote: "",
		summary:
			"A violin-studio website with lesson information and an inquiry form, designed for accessible browsing and straightforward content updates by the studio owner without coding.",
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
		statusNote: "",
		summary:
			"A public-history website presenting information about the Restoration and providing a contact form for visitors.",
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
		statusNote: "",
		summary:
			"This portfolio brings together my professional experience, research, projects, and teaching, with a downloadable résumé and accessibility checks to support clear, reliable browsing.",
		tags: ["Vue", "Vite SSG", "Portfolio"],
		links: [
			{ label: "Home", href: "https://jacobdanderson.net" },
			{ label: "Repository", href: "https://github.com/anderson-webops/jacobdanderson.net" }
		],
		defaultVisible: true
	},
	{
		slug: "webops-template",
		name: "Web Platform Template",
		category: "Public web platforms",
		timeframe: "2024 – Present",
		status: "Maintained",
		statusTone: "maintained",
		statusNote: "",
		summary:
			"A reusable Nuxt and Express starting point for web projects, bringing together development tools, validation scripts, deployment conventions, and security-conscious defaults in one workspace.",
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
		statusNote: "",
		summary:
			"My private teaching site and course platform for programming, STEM, math, and Spanish lessons, bringing together lesson information, scheduling, curriculum, and student projects.",
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
		statusNote: "",
		summary:
			"A shared public library of programming and systems course materials, covering Python, Java, C, C++, web development, security, algorithms, AI, and game development.",
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
		statusNote: "",
		summary:
			"Computer-science and math classrooms for grade-school learners, with public course browsing, a browser-based Python editor, classroom games, and graphing tools to support hands-on practice.",
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
		statusNote: "Technical operations role: 2020 and 2026–present; project dates shown separately.",
		summary:
			"Technical support for an audio-recording venture, including capture devices, transcription, data synchronization, website migration, and field operations that connect recordings with the software workflow.",
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
		statusNote: "Prototype-stage concept, not a deployed emergency service.",
		summary:
			"A rental-based backcountry safety device concept for emergency and non-emergency alerts, location reporting, family coordination, and responder support, developed through product architecture and prototyping.",
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

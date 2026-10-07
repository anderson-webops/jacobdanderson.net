import { defineStore } from "pinia";

export interface ExperienceRecord {
	category: "patent" | "engineering" | "instruction" | "leadership";
	title: string;
	organization: string;
	timeframe: string;
	location: string;
	workFormat?: string;
	progression?: string;
	summary: string;
	highlights: string[];
}

export const useMainStore = defineStore("main", {
	state: () => ({
		userProfile: {
			name: "Jacob Anderson",
			headline: "Patent Technical Specialist, Computer Engineer, and Educator",
			location: "Atlanta Metropolitan Area",
			email: "jacob@jacobdanderson.net",
			lastUpdated: "August 2026",
			summary:
				"I support patent attorneys at Meunier Carlin & Curfman with technical analysis and application preparation under attorney supervision. My background is in computer engineering, embedded systems, and research.",
			profiles: [
				{
					label: "LinkedIn",
					href: "https://www.linkedin.com/in/jacoba1100254352/",
					description: "Current professional roles, education, and activity."
				},
				{
					label: "GitHub",
					href: "https://github.com/Jacoba1100254352",
					description: "Engineering code and public repositories."
				},
				{
					label: "Teaching site",
					href: "https://classes.jacobdanderson.net",
					description: "Scheduling, tuition, and lesson details."
				},
				{
					label: "View résumé",
					href: "/resume",
					description: "Professional experience, education, technical work, and contact details."
				}
			],
			publications: [
				{
					title: "Open-Source Circuit Radiation Effects (OSCRE) Simulation Framework: Design and Applications",
					venue: "ISCAS 2025",
					summary: "ISCAS 2025 paper on the OSCRE radiation-effects simulation framework.",
					href: "https://dblp.org/rec/conf/iscas/LambertANAPGWC25"
				}
			],
			practices: {
				patent: {
					label: "Current role",
					title: "Patent Technical Specialist, MCC",
					summary:
						"Patent application preparation, technical analysis, figures, and research under attorney supervision.",
					details: "Atlanta Metropolitan Area · Aug 2026 – Present"
				},
				engineering: {
					label: "Engineering background",
					title: "Computer engineering & technical systems",
					summary: "Embedded systems, simulation, sensing, software, telemetry, and technical product work.",
					details: "Research, product, and operations experience across academic and independent teams."
				},
				teaching: {
					label: "Teaching work",
					title: "Private programming, STEM & Spanish instruction",
					summary: "One-on-one lessons through Classes with Jacob, informed by four years at Juni Learning.",
					details: "$40 per 50-minute lesson through the teaching site."
				}
			},
			education: [
				{
					program: "M.S. Computer Engineering",
					institution: "Georgia Institute of Technology, Atlanta, GA",
					timeframe: "Aug 2025 – Expected May 2027",
					highlights: [
						"Graduate GPA 3.50 through Spring 2026.",
						"Completed coursework in advanced programming, computer architecture, and hardware security.",
						"Fall 2026 coursework in communications and network security."
					]
				},
				{
					program: "B.S. Computer Engineering, Minor in Computer Science",
					institution: "Brigham Young University, Provo, UT",
					timeframe: "Aug 2020 – Apr 2025",
					highlights: [
						"Cumulative GPA 3.79.",
						"Coursework in embedded systems, digital design, computer networks, software design, and persuasive writing."
					]
				}
			],
			experience: [
				{
					category: "patent",
					title: "Patent Technical Specialist",
					organization: "Meunier Carlin & Curfman LLC",
					timeframe: "Aug 2026 – Present",
					location: "Atlanta Metropolitan Area",
					progression: "Previously Summer Intern, Jun – Aug 2026.",
					summary: "Technical analysis and patent application preparation under attorney supervision.",
					highlights: [
						"Analyze invention disclosures and inventor discussions across electrical, computer, biomedical, and related technologies.",
						"Assist attorneys with claims, technical descriptions, figures, application strategy, and research."
					]
				},
				{
					category: "engineering",
					title: "Programmer & Technical Operations",
					organization: "AudioT",
					timeframe: "May 2020 – Aug 2020; Mar 2026 – Present",
					location: "",
					workFormat: "Remote and field systems",
					summary: "Program and deploy devices for remote audio collection.",
					highlights: [
						"Programmed Raspberry Pi devices in Python and Bash and documented sensor-data collection for prototype iteration.",
						"Configure Debian-based systems, deployment tools, and checks for remote audio collection in the field."
					]
				},
				{
					category: "engineering",
					title: "Co-Founder & CTO",
					organization: "Stride",
					timeframe: "Sep 2025 – Aug 2026",
					location: "Atlanta, GA",
					summary:
						"Led prototype architecture for a rental-based backcountry search-and-rescue device concept.",
					highlights: [
						"Defined the device architecture and directed prototype development.",
						"Explored SOS and non-emergency alerts, location reporting, and responder support intended to shorten time-to-help."
					]
				},
				{
					category: "engineering",
					title: "Undergraduate Researcher",
					organization: "Brigham Young University",
					timeframe: "Sep 2022 – Oct 2024",
					location: "Provo, UT",
					summary:
						"Built sensing-hardware and analysis tooling for non-invasive glucose-monitoring research.",
					highlights: [
						"Built MATLAB and Python analysis pipelines to compare experiments and refine a research prototype.",
						"Integrated sensing hardware and developed signal-processing and calibration workflows for lab testing."
					]
				},
				{
					category: "engineering",
					title: "IMMERSE Summer Researcher",
					organization: "Purdue SCALE x Brigham Young University",
					timeframe: "Summer 2024",
					location: "Provo, UT",
					summary: "Implemented simulation tooling for radiation-effects analysis in analog circuits.",
					highlights: [
						"Co-authored the ISCAS 2025 paper on the OSCRE radiation-effects simulation framework.",
						"Implemented Xschem and Ngspice workflows within the OSCRE simulation framework.",
						"Documented repeatable setup and analysis workflows for collaborators."
					]
				},
				{
					category: "engineering",
					title: "Capstone Engineer – Industrial Drill Sensor Integration",
					organization: "Epiroc Senior Project",
					timeframe: "Jan 2024 – Apr 2024",
					location: "Provo, UT",
					summary: "Built an operator-facing telemetry workflow for an industrial drill monitoring capstone.",
					highlights: [
						"Delivered a working operator-facing monitoring demo for Epiroc sponsor review.",
						"Integrated Bluetooth Low Energy (BLE) updates and I2C sensor communication for temperature and pressure telemetry."
					]
				},
				{
					category: "instruction",
					title: "Private Youth STEM Instructor",
					organization: "Classes with Jacob",
					timeframe: "Sep 2025 – Present",
					location: "Remote",
					summary: "Independent one-on-one instruction in programming, STEM, math, and Spanish.",
					highlights: [
						"Build lessons around each student's goals, prior experience, schoolwork, and independent projects.",
						"Teach durable problem-solving and coding fundamentals through guided, project-based practice."
					]
				},
				{
					category: "instruction",
					title: "Instructor & Instructor Success Trainer",
					organization: "Juni Learning",
					timeframe: "Jun 2021 – Nov 2025",
					location: "Remote",
					summary: "Private computer science and math instruction plus instructor coaching.",
					highlights: [
						"Delivered one-on-one programming, math, and science instruction for students with varied backgrounds and experience levels.",
						"Coached instructors on technical communication, lesson quality, and follow-up with students and families."
					]
				},
				{
					category: "leadership",
					title: "Shift Lead",
					organization: "Crumbl Cookies",
					timeframe: "May 2020 – Jun 2026",
					location: "Alpharetta, GA",
					summary:
						"Part-time baking, customer service, and shift leadership alongside school and technical work.",
					highlights: []
				}
			] as ExperienceRecord[],
			projects: [
				{
					name: "OSCRE Radiation-Effect Simulation Framework",
					shortName: "OSCRE circuit simulation",
					preview:
						"Co-authored the ISCAS 2025 paper on a framework for studying radiation effects in analog circuits.",
					timeframe: "2024 – 2025",
					description:
						"The open-source OSCRE radiation-effects simulation framework models single-event effects in analog circuits.",
					role: "Simulation workflow implementation, technical documentation, and publication support.",
					results: [
						"Co-authored the ISCAS 2025 paper describing the framework and its applications.",
						"Implemented Xschem and Ngspice workflows and documented repeatable setup for collaborators."
					],
					links: [
						{
							label: "Publication",
							href: "https://dblp.org/rec/conf/iscas/LambertANAPGWC25"
						},
						{
							label: "DOI record",
							href: "https://doi.org/10.1109/ISCAS56072.2025.11043386"
						}
					]
				},
				{
					name: "Industrial Drill Monitoring Platform",
					shortName: "Industrial drill monitoring",
					preview: "Delivered a working sensor-telemetry and monitoring demo for Epiroc sponsor review.",
					timeframe: "2024",
					description: "A BYU capstone monitoring platform for Epiroc engineers and drill operators.",
					role: "BLE telemetry integration, sensor communication, and monitoring interface implementation.",
					results: [
						"Delivered a working monitoring demo for Epiroc sponsor review.",
						"Integrated temperature and pressure sensors with Bluetooth Low Energy (BLE) telemetry and an operator-facing interface."
					],
					links: []
				},
				{
					name: "Non-Invasive Glucose Monitoring Research Tooling",
					shortName: "Glucose-monitoring research",
					preview:
						"Built hardware and analysis tools for experiments with a non-invasive glucose-monitoring research prototype.",
					timeframe: "2022 – 2024",
					description: "Prototype sensing and analysis tooling for non-invasive glucose-monitoring research.",
					role: "Sensor integration, signal processing pipelines, and calibration/data analysis.",
					results: [
						"Built MATLAB and Python pipelines to compare experimental runs and refine the prototype.",
						"Integrated sensing hardware and developed calibration and signal-processing workflows for lab experiments."
					],
					links: []
				},
				{
					name: "Stride Search-and-Rescue Device Concept",
					shortName: "Stride device concept",
					preview: "Directed prototype architecture for a backcountry search-and-rescue device concept.",
					timeframe: "2025 – 2026",
					description:
						"A rental-based backcountry search-and-rescue device concept for location reporting and emergency alerts.",
					role: "Co-founder, technical architecture, and prototype direction.",
					results: [
						"As co-founder, defined technical direction and prototype architecture.",
						"Explored SOS alerts, location reporting, and responder support intended to shorten time-to-help."
					],
					links: []
				}
			],
			skills: {
				groups: [
					{ label: "Programming", items: ["Python", "C", "C++", "MATLAB", "Java", "Bash", "Swift"] },
					{ label: "Hardware design", items: ["SystemVerilog", "Verilog", "VHDL"] },
					{
						label: "Web & data",
						items: [
							"TypeScript",
							"JavaScript",
							"HTML/CSS",
							"Vue",
							"Nuxt",
							"Node.js",
							"Express",
							"Postgres",
							"MongoDB"
						]
					},
					{ label: "Systems & research tools", items: ["Linux", "Git", "Raspberry Pi", "Xschem", "Ngspice"] }
				],
				languages: [
					"Python",
					"C",
					"C++",
					"MATLAB",
					"TypeScript",
					"Java",
					"Bash",
					"SystemVerilog",
					"Verilog",
					"VHDL",
					"HTML/CSS",
					"JavaScript",
					"Swift"
				],
				frameworks: [
					"Linux",
					"Git",
					"Raspberry Pi",
					"Xschem",
					"Ngspice",
					"Vue",
					"Nuxt",
					"Node.js",
					"Express",
					"Postgres",
					"MongoDB"
				],
				competencies: [
					"Patent application preparation and technical analysis under attorney supervision",
					"Invention disclosure analysis, technical descriptions, figures, and research",
					"Embedded systems, sensor integration, communication systems, and telemetry",
					"Research tooling, simulation workflows, signal analysis, and technical documentation",
					"Private instruction, instructor training, and curriculum adaptation"
				],
				languagesSpoken: [
					"English",
					"Spanish (professional working)",
					"Portuguese (professional working)",
					"French (elementary)",
					"Russian (elementary)"
				]
			}
		}
	}),
	getters: {
		featuredProfessionalExperience: state =>
			state.userProfile.experience
				.filter(item => item.category === "patent" || item.category === "engineering")
				.slice(0, 3),
		instructionExperience: state => state.userProfile.experience.filter(item => item.category === "instruction"),
		featuredProjects: state => state.userProfile.projects.slice(0, 2)
	}
});

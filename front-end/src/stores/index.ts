import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
	state: () => ({
		userProfile: {
			name: "Jacob Anderson",
			headline: "Patent Technical Specialist, Computer Engineer, and Educator",
			location: "Atlanta Metropolitan Area",
			email: "jacob@jacobdanderson.net",
			phone: "404-626-0025",
			lastUpdated: "August 2026",
			summary:
				"At Meunier Carlin & Curfman, I support patent attorneys with application preparation and technical analysis across electrical, computer, biomedical, and related technologies. My background spans embedded systems, research tooling, product development, software, and instruction while I pursue an M.S. in Computer Engineering at Georgia Tech.",
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
						"Coursework in advanced programming, computer architecture, hardware security, communications, and network security."
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
					summary: "Technical analysis and patent application preparation under attorney supervision.",
					highlights: [
						"Analyze invention disclosures and inventor discussions involving electrical, computer, biomedical, and related technologies.",
						"Assist with claims, technical descriptions, figures, application strategy, and technical and patent-related research.",
						"Continued with the firm as a Patent Technical Specialist after serving as a Summer Intern from June through August 2026."
					]
				},
				{
					category: "engineering",
					title: "Programmer & Technical Operations",
					organization: "AudioT",
					timeframe: "May 2020 – Aug 2020; Mar 2026 – Present",
					location: "Remote and field systems",
					summary: "Edge-computing, remote audio-ingest, and field-readiness work for startup systems.",
					highlights: [
						"Programmed Raspberry Pi devices in Python and Bash and documented sensor-data collection for prototype iteration.",
						"Configured Debian-based infrastructure for remote audio ingest, deployment tooling, and field-readiness validation."
					]
				},
				{
					category: "engineering",
					title: "Co-Founder & CTO",
					organization: "Stride",
					timeframe: "Sep 2025 – Aug 2026",
					location: "Atlanta, GA",
					summary: "Led technical execution for a rental-based backcountry search-and-rescue device concept.",
					highlights: [
						"Owned prototype development and product architecture for a device intended to reduce friction, cost, and time-to-help for backcountry visitors.",
						"Developed concepts for SOS and non-emergency alerts, location reporting, and responder dispatch support."
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
						"Integrated sensing hardware into a non-invasive glucose-monitoring prototype used in multidisciplinary lab testing.",
						"Built MATLAB and Python pipelines for signal processing, calibration, and data analysis.",
						"Produced analysis outputs the lab used to compare runs and refine the prototype between experiments."
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
						"Implemented Xschem and Ngspice workflows within the OSCRE simulation framework.",
						"Documented repeatable setup and analysis workflows for collaborators.",
						"Contributed technical documentation and co-authored the ISCAS 2025 paper describing OSCRE and its applications."
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
						"Integrated BLE updates between drill sensors and the supervisory server.",
						"Implemented I2C sensor communication for temperature and pressure telemetry.",
						"Delivered a working operator-facing monitoring demo for sponsor review."
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
			],
			projects: [
				{
					name: "OSCRE Radiation-Effect Simulation Framework",
					timeframe: "2024 – 2025",
					description:
						"Open-source simulation workflow for modeling single-event effects in analog circuits.",
					role: "Simulation workflow implementation, technical documentation, and publication support.",
					results: [
						"Implemented a repeatable Xschem and Ngspice workflow collaborators could install and reuse across institutions.",
						"Documented setup and analysis steps so single-event-effects studies could start from a shared baseline.",
						"Co-authored the ISCAS 2025 publication describing the framework and its applications."
					],
					links: [
						{
							label: "Publication record",
							href: "https://dblp.org/rec/conf/iscas/LambertANAPGWC25"
						},
						{
							label: "DOI",
							href: "https://doi.org/10.1109/ISCAS56072.2025.11043386"
						}
					]
				},
				{
					name: "Industrial Drill Monitoring Platform",
					timeframe: "2024",
					description:
						"Capstone platform delivering live industrial drill telemetry to Epiroc engineers through an operator-facing interface.",
					role: "BLE telemetry integration, sensor communication, and monitoring interface implementation.",
					results: [
						"Integrated temperature and pressure telemetry from drill hardware into the monitoring stack.",
						"Delivered BLE-fed supervisory views for operator and engineering review during the sponsor demo."
					],
					links: []
				},
				{
					name: "Non-Invasive Glucose Monitoring Research Tooling",
					timeframe: "2022 – 2024",
					description: "Prototype sensing and analysis tooling for non-invasive glucose-monitoring research.",
					role: "Sensor integration, signal processing pipelines, and calibration/data analysis.",
					results: [
						"Integrated sensing hardware into a multidisciplinary lab workflow for non-invasive glucose-monitoring experiments.",
						"Built MATLAB and Python pipelines for calibration, signal processing, and experiment analysis.",
						"Produced repeatable analysis outputs used to compare runs and refine the prototype."
					],
					links: []
				},
				{
					name: "Stride Search-and-Rescue Device Concept",
					timeframe: "2025 – 2026",
					description:
						"Rental-based backcountry device concept for SOS and non-emergency alerts, location reporting, and responder support.",
					role: "Co-founder, technical architecture, and prototype direction.",
					results: [
						"Defined end-to-end technical direction and prototype architecture.",
						"Explored location and alert workflows intended to reduce time-to-help for backcountry visitors."
					],
					links: []
				}
			],
			skills: {
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

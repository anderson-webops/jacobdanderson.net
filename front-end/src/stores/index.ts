import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
	state: () => ({
		userProfile: {
			name: "Jacob Anderson",
			headline: "Computer Engineer, Cofounder, and Educator",
			location: "Alpharetta, GA",
			email: "jacobdanderson@gmail.com",
			phone: "404-626-0025",
			lastUpdated: "April 2026",
			summary:
				"I build embedded systems, research tooling, and technical software. I serve as CTO and cofounder of Stride and am currently pursuing an M.S. in Computer Engineering at Georgia Tech after earning a B.S. in Computer Engineering with a minor in Computer Science from BYU.",
			profiles: [
				{
					label: "GitHub",
					href: "https://github.com/Jacoba1100254352",
					description: "Repositories, code, and release history."
				},
				{
					label: "Teaching site",
					href: "https://classes.jacobdanderson.net",
					description: "Scheduling, tuition, and lesson logistics."
				},
				{
					label: "Request résumé",
					href: "mailto:jacobdanderson@gmail.com?subject=Resume%20request",
					description: "Résumé available by email request."
				}
			],
			publications: [
				{
					title: "Open-Source Circuit Radiation Effects (OSCRE) Simulation Framework: Design and Applications",
					venue: "ISCAS 2025",
					summary: "ISCAS 2025 paper on OSCRE and radiation-effects simulation workflows.",
					href: "https://dblp.org/rec/conf/iscas/LambertANAPGWC25"
				}
			],
			education: [
				{
					program: "M.S. Computer Engineering",
					institution: "Georgia Institute of Technology, Atlanta, GA",
					timeframe: "Aug 2025 – Present",
					highlights: [
						"GPA 4.0",
						"Graduate focus on broad, systems-level computer engineering across hardware, software, and analysis."
					]
				},
				{
					program: "B.S. Computer Engineering, Minor in Computer Science",
					institution: "Brigham Young University, Provo, UT",
					timeframe: "Aug 2020 – Apr 2025",
					highlights: [
						"GPA 3.79",
						"Coursework in embedded systems, digital systems, BLE networking, software design, and web programming."
					]
				}
			],
			experience: [
				{
					category: "instruction",
					title: "Private Instructor & Instructor Success Trainer",
					organization: "Juni Learning",
					timeframe: "May 2021 – Present",
					location: "Remote",
					summary: "Private instruction and instructor training across programming, STEM, and Spanish.",
					highlights: [
						"Teach individualized lessons for students ranging from grade school through adulthood.",
						"Coach instructors on lesson delivery, student communication, and curriculum use.",
						"Develop curriculum materials and feedback practices used across the teaching program."
					]
				},
				{
					category: "engineering",
					title: "Undergraduate Researcher",
					organization: "Brigham Young University",
					timeframe: "Sep 2022 – Oct 2024",
					location: "Provo, UT",
					summary:
						"Research support for non-invasive glucose monitoring, with emphasis on sensing hardware and analysis tooling.",
					highlights: [
						"Integrated sensing hardware for a non-invasive glucose monitoring prototype in a multidisciplinary lab setting.",
						"Built MATLAB and Python pipelines for signal processing, calibration, and data analysis.",
						"Supported iterative device refinement across electrical, computer, and biomedical collaborators."
					]
				},
				{
					category: "engineering",
					title: "IMMERSE Summer Researcher",
					organization: "Purdue SCALE x Brigham Young University",
					timeframe: "Summer 2024",
					location: "Provo, UT",
					summary:
						"Research tooling and simulation workflow development for radiation effects in analog circuits.",
					highlights: [
						"Led development of the Open-Source Circuit Radiation Effects (OSCRE) simulation framework.",
						"Created installer scripts and tooling workflows for Xschem and Ngspice to streamline SEE analysis.",
						"Co-authored the ISCAS 2025 paper describing OSCRE and its applications."
					]
				},
				{
					category: "engineering",
					title: "Capstone Engineer – Industrial Drill Sensor Integration",
					organization: "Epiroc Senior Project",
					timeframe: "Jan 2024 – Apr 2024",
					location: "Provo, UT",
					summary:
						"Industrial telemetry capstone focused on operator visibility, BLE transport, and sensor integration.",
					highlights: [
						"Designed an operator-facing drill monitoring interface with BLE updates to a supervisory server.",
						"Implemented I2C sensor communication for temperature and pressure telemetry.",
						"Delivered a working monitoring flow that connected field telemetry to engineering review."
					]
				},
				{
					category: "engineering",
					title: "Programmer & Assistant",
					organization: "AudioT",
					timeframe: "May 2020 – Aug 2020",
					location: "Atlanta, GA",
					summary:
						"Prototype support work spanning Raspberry Pi automation, experimentation, and data collection.",
					highlights: [
						"Developed Python and Bash automation for Raspberry Pi prototypes.",
						"Supported product experimentation and data collection for an early-stage startup environment."
					]
				}
			],
			projects: [
				{
					name: "OSCRE Radiation-Effect Simulation Framework",
					timeframe: "2024 – 2025",
					description:
						"Open-source simulation workflow for modeling single-event effects in analog circuits.",
					role: "Architecture, tooling workflow design, documentation, and publication support.",
					results: [
						"Built a repeatable Xschem and Ngspice workflow that collaborators could share across institutions.",
						"Documented installer and analysis steps for single-event-effects studies in analog circuits.",
						"Supported the ISCAS 2025 publication describing the framework and its applications."
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
						"Delivered BLE updates to a supervisory interface for operator and engineering review."
					],
					links: []
				},
				{
					name: "Non-Invasive Glucose Monitoring Research Tooling",
					timeframe: "2022 – 2024",
					description: "Prototype sensing and analysis tooling for non-invasive glucose-monitoring research.",
					role: "Sensor integration, signal processing pipelines, and calibration/data analysis.",
					results: [
						"Integrated sensing hardware in a multidisciplinary lab workflow spanning electrical, computer, and biomedical collaborators.",
						"Built MATLAB and Python pipelines for calibration, signal processing, and experiment analysis.",
						"Supported iterative prototype refinement with repeatable analysis outputs."
					],
					links: []
				}
			],
			skills: {
				languages: [
					"C",
					"C++",
					"Java",
					"Python",
					"TypeScript",
					"HTML/CSS",
					"JavaScript",
					"SystemVerilog",
					"VHDL",
					"MATLAB",
					"Swift"
				],
				frameworks: ["Vue", "Vitesse", "React", "SwiftUI", "NumPy", "Pandas", "Matplotlib"],
				competencies: [
					"Embedded systems & microcontroller programming",
					"Sensor integration (I2C, BLE, industrial telemetry)",
					"Research tooling, simulation workflows, and data analysis",
					"Technical communication, teaching, and curriculum design"
				],
				languagesSpoken: ["English", "Spanish (fluent)", "Portuguese (conversational)"]
			}
		}
	}),
	getters: {
		featuredEngineeringExperience: state =>
			state.userProfile.experience.filter(item => item.category === "engineering").slice(0, 3),
		instructionExperience: state => state.userProfile.experience.filter(item => item.category === "instruction"),
		featuredProjects: state => state.userProfile.projects.slice(0, 2)
	}
});

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
				"I build embedded systems and research tooling, and I teach programming, STEM, and Spanish through private instruction and instructor training. I serve as CTO and cofounder of Stride and am pursuing an M.S. in Computer Engineering at Georgia Tech after completing a B.S. in Computer Engineering with a minor in Computer Science at BYU.",
			profiles: [
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
					description: "Printable résumé with experience, education, and contact details."
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
				engineering: {
					label: "Engineering work",
					title: "CTO & Cofounder, Stride",
					summary: "Embedded systems, research tooling, telemetry, and technical product work.",
					details: "Open to engineering engagements and research collaborations."
				},
				teaching: {
					label: "Teaching work",
					title: "Private instruction & instructor training",
					summary: "Programming, STEM, and Spanish through one-on-one lessons and instructor support.",
					details: "$40 per 50-minute lesson through the teaching site."
				}
			},
			education: [
				{
					program: "M.S. Computer Engineering",
					institution: "Georgia Institute of Technology, Atlanta, GA",
					timeframe: "Aug 2025 – Present",
					highlights: ["GPA 4.0", "Graduate study across hardware, software, and analysis."]
				},
				{
					program: "B.S. Computer Engineering, Minor in Computer Science",
					institution: "Brigham Young University, Provo, UT",
					timeframe: "Aug 2020 – Apr 2025",
					highlights: ["GPA 3.79", "Coursework in embedded systems, BLE networking, and software design."]
				}
			],
			experience: [
				{
					category: "instruction",
					title: "Private Instructor & Instructor Success Trainer",
					organization: "Juni Learning",
					timeframe: "May 2021 – Present",
					location: "Remote",
					summary: "Private lessons and instructor training across programming, STEM, and Spanish.",
					highlights: [
						"Run one-on-one lessons for students from grade school through adulthood in programming, STEM, and Spanish.",
						"Coach instructors on lesson delivery, student communication, and curriculum execution.",
						"Develop training materials and feedback practices used in instructor support and lesson review."
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
					summary: "Built simulation tooling for radiation-effects analysis in analog circuits.",
					highlights: [
						"Led development of the Open-Source Circuit Radiation Effects (OSCRE) simulation framework.",
						"Created installer scripts and setup workflows that made Xschem and Ngspice analysis reproducible on new lab machines.",
						"Co-authored the ISCAS 2025 paper describing OSCRE and its applications."
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
						"Built a repeatable Xschem and Ngspice workflow collaborators could install and reuse across institutions.",
						"Documented installer and analysis steps so single-event-effects studies could start from a shared baseline.",
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
					"Private instruction, instructor training, and curriculum design"
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

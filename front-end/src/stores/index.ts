import { defineStore } from "pinia";


export const useMainStore = defineStore("main", {
  state: () => ({
    userProfile: {
      name: "Jacob Anderson",
      headline: "Embedded systems engineer & educator",
      location: "Alpharetta, GA · Remote-friendly",
      email: "jacobdanderson@gmail.com",
      phone: "404-626-0025",
      lastUpdated: "September 2025",
      summary:
        "I design reliable embedded systems, integrate sensor networks, and teach the next generation of developers. I'm beginning the M.S. in Computer Engineering program at Georgia Tech after earning my B.S. from BYU, where I focused on firmware, hardware design, and human-centered engineering projects.",
      education: [
        {
          program: "M.S. Computer Engineering",
          institution: "Georgia Institute of Technology, Atlanta, GA",
          timeframe: "Aug 2025 – Present",
          highlights: [
            "Graduate focus on secure and resilient embedded systems (GPA TBD)"
          ]
        },
        {
          program:
            "B.S. Computer Engineering, Minor in Computer Science",
          institution: "Brigham Young University, Provo, UT",
          timeframe: "Aug 2020 – Apr 2025",
          highlights: [
            "GPA 3.79",
            "Coursework: Embedded Systems, Advanced Digital Systems, BLE Networking, Software Design, Web Programming"
          ]
        }
      ],
      experience: [
        {
          title: "Private Instructor & Instructor Success Trainer",
          organization: "Juni Learning",
          timeframe: "May 2021 – Present",
          location: "Remote",
          highlights: [
            "Teach individualized programming, STEM, and Spanish lessons for students ages 7–18.",
            "Coach new instructors, evaluate curriculum delivery, and maintain quality standards."
          ]
        },
        {
          title: "Undergraduate Researcher",
          organization: "Brigham Young University",
          timeframe: "Sep 2022 – Oct 2024",
          location: "Provo, UT",
          highlights: [
            "Integrated sensing hardware for a non-invasive glucose monitoring device with Dr. Chiang and Dr. Davis.",
            "Built MATLAB/Python pipelines for signal processing, calibration, and data analysis.",
            "Collaborated across electrical, computer, and biomedical disciplines to refine device performance."
          ]
        },
        {
          title: "IMMERSE Summer Researcher",
          organization: "Purdue SCALE x Brigham Young University",
          timeframe: "Summer 2024",
          location: "Provo, UT",
          highlights: [
            "Led development of the Open-Source Circuit Radiation Effects (OSCRE) simulation framework.",
            "Created installer scripts and tooling workflows for Xschem and Ngspice to streamline SEE analysis.",
            "Co-authored the initial technical paper describing OSCRE and its applications."
          ]
        },
        {
          title: "Capstone Engineer – Industrial Drill Sensor Integration",
          organization: "Epiroc Senior Project",
          timeframe: "Jan 2024 – Apr 2024",
          location: "Provo, UT",
          highlights: [
            "Designed a real-time drill monitoring interface with BLE updates to a supervisory server.",
            "Implemented I2C sensor communication for temperature and pressure telemetry."
          ]
        },
        {
          title: "Programmer & Assistant",
          organization: "AudioT",
          timeframe: "May 2020 – Aug 2020",
          location: "Atlanta, GA",
          highlights: [
            "Developed Python and Bash automation for Raspberry Pi prototypes.",
            "Supported product experimentation and data collection for the early-stage startup."
          ]
        }
      ],
      projects: [
        {
          name: "OSCRE Radiation-Effect Simulation Framework",
          timeframe: "2024",
          description:
            "Open-source workflow for modeling single-event effects in analog circuits.",
          highlights: [
            "Directed architecture decisions and documentation for cross-institution collaboration.",
            "Packaged installer scripts that reduce setup time for researchers and students."
          ]
        },
        {
          name: "Industrial Drill Monitoring Platform",
          timeframe: "2024",
          description:
            "Capstone system delivering live industrial drill telemetry to Epiroc engineers.",
          highlights: [
            "Created responsive operator dashboards and BLE data pipelines for environmental sensing."
          ]
        },
        {
          name: "Website Management Portfolio",
          timeframe: "Ongoing",
          description:
            "Maintain personal and client websites using Vue, Vitesse, and modern tooling.",
          highlights: [
            "Ship UX enhancements, ensure responsive layouts, and monitor performance regressions."
          ]
        },
        {
          name: "Zilch Game & Swift Productivity App",
          timeframe: "Ongoing",
          description:
            "Exploratory side projects refining gameplay systems in Java and productivity features in Swift.",
          highlights: [
            "Practice object-oriented architecture, iterate on UI polish, and incorporate user feedback."
          ]
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
        frameworks: [
          "Vue",
          "Vitesse",
          "React",
          "SwiftUI",
          "NumPy",
          "Pandas",
          "Matplotlib"
        ],
        competencies: [
          "Embedded systems & microcontroller programming",
          "Sensor integration (I2C, BLE, industrial telemetry)",
          "Signal processing & data analysis",
          "Technical instruction & curriculum design"
        ],
        languagesSpoken: [
          "English",
          "Spanish (fluent)",
          "Portuguese (conversational)"
        ]
      },
      achievements: [
        "Eagle Scout, Boy Scouts of America",
        "Phi Eta Sigma Honor Society"
      ],
      activities: [
        "Study Abroad at Georgia Tech Lorraine in Metz, France (2015 & 2016)",
        "FIRST LEGO League robotics team member (2011 – 2014)",
        "Volunteer at the Shakespeare Tavern of Atlanta"
      ]
    }
  }),
  getters: {
    featuredExperience: state => state.userProfile.experience.slice(0, 3),
    featuredProjects: state => state.userProfile.projects.slice(0, 2)
  }
});

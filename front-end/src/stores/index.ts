import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    userProfile: {
      name: "Jacob Anderson",
      tagline: "Computer Engineer & Educator",
      location: "Alpharetta, Georgia",
      email: "jacobdanderson@gmail.com",
      phone: "404-626-0025",
      lastUpdated: "September 2025",
      about:
        "I'm a computer engineer who loves building resilient systems and mentoring the next generation of makers. My work spans embedded sensing, radiation-effects simulation, and full-stack web development. I translate research into practical tools while keeping user experience and maintainability at the forefront.",
      education: [
        {
          degree: "M.S. Computer Engineering (in progress)",
          institution: "Georgia Institute of Technology, Atlanta, GA",
          description: "Aug 2025 – Present"
        },
        {
          degree: "B.S. Computer Engineering, Minor in Computer Science",
          institution: "Brigham Young University, Provo, UT",
          description: "Aug 2020 – Apr 2025 · GPA 3.79"
        }
      ],
      experience: [
        {
          role: "Private Instructor & Instructor Success Trainer",
          organization: "Juni Learning",
          period: "May 2021 – Present",
          location: "Remote",
          highlights: [
            "Teach individualized programming, math, and STEM lessons for students ages 7–18 across Python, Java, web development, and electronics.",
            "Design custom curricula that adapt to different learning styles and keep students motivated with real-world projects.",
            "Onboard and coach new instructors as an IST, standardizing best practices that keep quality and communication consistent."
          ]
        },
        {
          role: "Researcher – Wearable Glucose Monitoring",
          organization: "Brigham Young University",
          period: "Sep 2022 – Oct 2024",
          location: "Provo, UT",
          highlights: [
            "Integrated sensing hardware, firmware, and data analysis pipelines for a non-invasive glucose monitoring prototype.",
            "Implemented MATLAB and Python signal processing workflows that improved calibration accuracy and device stability.",
            "Collaborated with Dr. Chiang, Dr. Davis, and a multidisciplinary team to translate research findings into actionable design changes."
          ]
        },
        {
          role: "IMMERSE Summer Researcher",
          organization: "Purdue SCALE & Brigham Young University",
          period: "Summer 2024",
          location: "Provo, UT",
          highlights: [
            "Led development of the Open-Source Circuit Radiation Effects (OSCRE) framework for modeling single-event effects.",
            "Built installation tooling and documentation for Xschem and Ngspice integrations, lowering the barrier for new researchers.",
            "Co-authored the initial technical manuscript describing OSCRE's architecture and research applications."
          ]
        },
        {
          role: "Capstone Lead – Industrial Drill Sensor Integration",
          organization: "Epiroc · BYU EC EN 476",
          period: "Jan 2024 – Apr 2024",
          location: "Provo, UT",
          highlights: [
            "Designed a real-time drill status dashboard backed by I²C sensors and a BLE telemetry pipeline.",
            "Implemented the embedded communication stack and user interface that surfaced temperature and pressure trends to operators.",
            "Coordinated cross-functional testing with Epiroc stakeholders to validate system performance in realistic conditions."
          ]
        },
        {
          role: "Programmer & Web Designer",
          organization: "AudioT & Independent Clients",
          period: "May 2020 – Jun 2021",
          location: "Remote",
          highlights: [
            "Deployed Vue and Vitesse-based sites for academic and startup partners with responsive design and fast load times.",
            "Built Python and Bash automations on Raspberry Pi to streamline early product experiments.",
            "Managed updates, accessibility improvements, and hosting reliability for production sites."
          ]
        },
        {
          role: "Full-Time Service Volunteer District Leader",
          organization: "The Church of Jesus Christ of Latter-day Saints",
          period: "Jul 2018 – Apr 2020",
          location: "Ecuador",
          highlights: [
            "Led a district of 12 volunteers, coordinating training, mentorship, and record keeping in Spanish.",
            "Organized community outreach schedules that balanced humanitarian projects with individual development.",
            "Built resilience and communication skills while working 10+ hour days in rapidly changing environments."
          ]
        }
      ],
      projects: [
        {
          name: "OSCRE Radiation Effects Simulator",
          period: "2024",
          summary: "Open-source workflow that models single-event effects for analog and mixed-signal circuits.",
          highlights: [
            "Integrated Ngspice and Xschem for reproducible SEE simulations.",
            "Packaged installer scripts and documentation that sped up onboarding for new SCALE researchers.",
            "Documented the framework in a technical paper submitted to an IEEE conference."
          ]
        },
        {
          name: "Industrial Drill Monitoring",
          period: "2024",
          summary:
            "Capstone system that streams temperature and pressure telemetry from industrial drills to operators in real time.",
          highlights: [
            "Implemented microcontroller firmware with I²C sensors and BLE communications.",
            "Designed the operator-facing UI with intuitive alerts for abnormal readings.",
            "Coordinated deployment testing with Epiroc engineers."
          ]
        },
        {
          name: "Website Management Portfolio",
          period: "Ongoing",
          summary: "Maintenance and enhancement of personal and client sites built with Vue, Vitesse, and modern tooling.",
          highlights: [
            "Own end-to-end deployments, accessibility reviews, and performance optimizations.",
            "Ship new features such as dynamic content sections and analytics dashboards.",
            "Ensure responsive layouts and consistent design systems across four active sites."
          ]
        },
        {
          name: "Zilch Game Development",
          period: "Ongoing",
          summary: "Cross-platform dice game built first in C++ and now iterated in Java.",
          highlights: [
            "Refactored the architecture with object-oriented patterns for clarity and maintainability.",
            "Continuously ship updates that fine-tune scoring logic and add UX polish.",
            "Use the project as a sandbox for exploring new testing and CI workflows."
          ]
        },
        {
          name: "Swift Productivity App",
          period: "In Progress",
          summary: "Self-directed iOS project focused on habit tracking and lightweight planning.",
          highlights: [
            "Learning SwiftUI best practices for building accessible, adaptive interfaces.",
            "Experimenting with local notifications and data persistence strategies.",
            "Iterating on user feedback gathered from early testers."
          ]
        }
      ],
      skills: {
        programming: ["C", "C++", "Java", "Python", "TypeScript", "HTML", "CSS", "JavaScript", "Swift", "MATLAB", "RISC-V Assembly"],
        tools: ["Vue", "Vitesse", "React", "SwiftUI", "NumPy", "Pandas", "Matplotlib", "Ngspice", "Xschem"],
        hardware: ["Embedded systems design", "BLE integrations", "Sensor interfacing", "SystemVerilog", "VHDL"],
        languages: ["English", "Spanish (fluent)", "Portuguese (reading & writing proficiency)"]
      },
      achievements: [
        "Eagle Scout · Boy Scouts of America",
        "Phi Eta Sigma Honor Society Member"
      ],
      teaching: {
        blurb: "I teach project-based programming, STEM, and Spanish lessons that help students see the connection between what they learn and what they can build.",
        rate: "$40 per 60-minute lesson",
        offerings: [
          "Coding pathways tailored to Python, Java, web development, and embedded systems goals.",
          "Hands-on STEM explorations covering circuits, sensors, and data storytelling.",
          "Conversational and academic Spanish practice aligned with classroom or AP objectives."
        ],
        link: "https://classes.jacobdanderson.net"
      }
    }
  }),

  getters: {
    projectNames: (state) => state.userProfile.projects.map((project) => project.name)
  }
});

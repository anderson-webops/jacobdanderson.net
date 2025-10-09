import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    userProfile: {
      name: "Jacob Anderson",
      about:
        "I'm an aspiring computer engineer who loves building human-centered technology. From designing radiation-effect simulations to integrating industrial sensors and teaching future coders, I focus on bridging hardware, software, and people.",
      education: [
        {
          degree: "M.S. Computer Engineering (in progress)",
          institution: "Georgia Institute of Technology, Atlanta, GA",
          timeframe: "Aug 2025 – Present",
          highlights: [
            "Graduate focus on resilient embedded systems and secure hardware design."
          ]
        },
        {
          degree: "B.S. Computer Engineering, Minor in Computer Science",
          institution: "Brigham Young University, Provo, UT",
          timeframe: "Aug 2020 – Apr 2025",
          highlights: [
            "GPA 3.79",
            "Capstone on industrial drill sensor integration with BLE and I²C communication.",
            "Coursework in embedded systems, advanced digital design, networking, and web development."
          ]
        }
      ],
      experience: [
        {
          title: "Private Instructor & Instructor Success Trainer",
          organization: "Juni Learning",
          timeframe: "May 2021 – Present",
          summary:
            "Coach students ages 7–18 through customized programming, STEM, and math lessons while onboarding and mentoring new instructors.",
          highlights: [
            "Developed individualized project roadmaps to support diverse learning styles.",
            "Led quality reviews and coaching sessions for new instructor cohorts."
          ]
        },
        {
          title: "Undergraduate Researcher – Non-invasive Glucose Monitoring",
          organization: "Brigham Young University",
          timeframe: "Sep 2022 – Oct 2024",
          summary:
            "Engineered signal-processing pipelines and system integrations for wearable glucose sensing under Dr. Chiang and Dr. Davis.",
          highlights: [
            "Implemented MATLAB/Python algorithms to improve calibration accuracy.",
            "Collaborated with a multidisciplinary team to optimize device performance."
          ]
        },
        {
          title: "IMMERSE Summer Researcher",
          organization: "Purdue SCALE @ BYU",
          timeframe: "Summer 2024",
          summary:
            "Led integration of the Open-Source Circuit Radiation Effects (OSCRE) simulation framework for radiation-hardened design research.",
          highlights: [
            "Built installation scripts and tooling for Xschem and Ngspice deployment.",
            "Co-authored the initial technical paper outlining OSCRE architecture."
          ]
        },
        {
          title: "Capstone Engineer – Industrial Drill Sensor Integration",
          organization: "Epiroc / BYU Senior Project",
          timeframe: "Jan 2024 – Apr 2024",
          summary:
            "Delivered a real-time monitoring interface that merges BLE, I²C sensors, and rugged hardware for industrial drilling fleets.",
          highlights: [
            "Developed the operator display and telemetry pipeline for temperature and pressure data.",
            "Established BLE data synchronization between drill systems and server infrastructure."
          ]
        },
        {
          title: "Programmer & Assistant",
          organization: "AudioT",
          timeframe: "May 2020 – Aug 2020",
          summary:
            "Prototyped Raspberry Pi-based audio solutions for an early-stage startup.",
          highlights: [
            "Automated data collection scripts in Python and Bash.",
            "Contributed to proof-of-concept demos showcased to prospective customers."
          ]
        }
      ],
      projects: [
        {
          name: "OSCRE Radiation Effects Simulator",
          timeframe: "2024",
          description:
            "Open-source framework that streamlines radiation fault-injection experiments with scripted Ngspice/Xschem flows."
        },
        {
          name: "Industrial Drill Monitoring Interface",
          timeframe: "2024",
          description:
            "Cross-platform UI and communication layer for BLE-connected drill diagnostics used in my senior capstone."
        },
        {
          name: "Zilch Game Engine",
          timeframe: "Ongoing",
          description:
            "Iterative Java refactor of a C++ dice game featuring extensible scoring rules and modern design patterns."
        },
        {
          name: "Portfolio Site Management",
          timeframe: "Ongoing",
          description:
            "Maintain personal and client sites using Vue and Vitesse, focusing on performance, accessibility, and continuous delivery."
        }
      ],
      contact: {
        email: "jacobdanderson@gmail.com",
        phone: "404-626-0025",
        location: "Alpharetta, GA"
      },
      teaching: {
        headline: "Personalized lessons for young creators",
        rate: "$40 per lesson",
        summary:
          "I help kids and teens build confidence in programming, STEM, and Spanish through project-driven sessions tailored to their interests.",
        topics: [
          "Creative coding with Python, Java, and web technologies",
          "STEM foundations with hands-on experiments",
          "Conversational and academic Spanish practice"
        ],
        ctaLink: "https://classes.jacobdanderson.net"
      },
      achievements: [
        "Eagle Scout",
        "Phi Eta Sigma Honor Society"
      ],
      languages: [
        "English (Native)",
        "Spanish (Fluent)",
        "Portuguese (Conversational)"
      ]
    }
  }),

  getters: {
    projectNames: (state) =>
      state.userProfile.projects.map((project) => project.name)
  }
});

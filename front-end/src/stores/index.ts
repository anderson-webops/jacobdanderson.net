import { defineStore } from "pinia";

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  timeframe: string;
  highlights: string[];
}

export interface ProjectItem {
  name: string;
  timeframe: string;
  description: string;
  tech?: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  timeframe: string;
  details: string;
  highlights?: string[];
}

export interface Skills {
  programmingLanguages: string[];
  frameworksAndTools: string[];
  competencies: string[];
  spokenLanguages: string[];
}

export interface UserProfile {
  name: string;
  location: string;
  email: string;
  phone: string;
  tagline: string;
  about: string;
  heroHighlights: string[];
  education: EducationItem[];
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  skills: Skills;
  achievements: string[];
  teaching: {
    rate: number;
    summary: string;
    focusAreas: string[];
    link: string;
  };
}

export const useMainStore = defineStore("main", {
  state: () => ({
    userProfile: {
      name: "Jacob Anderson",
      location: "Alpharetta, Georgia",
      email: "jacobdanderson@gmail.com",
      phone: "404-626-0025",
      tagline:
        "Computer engineer focused on resilient embedded systems, data-driven research, and impactful learning experiences.",
      about:
        "I am a computer engineer and educator who enjoys building embedded systems that solve real-world problems and mentoring students as they master new skills.",
      heroHighlights: [
        "M.S. Computer Engineering student at Georgia Tech (August 2025 – Present)",
        "B.S. Computer Engineering, Minor in Computer Science, Brigham Young University (GPA 3.79)",
        "Experience across embedded systems, radiation-effects research, and STEM instruction"
      ],
      education: [
        {
          degree: "M.S. Computer Engineering (in progress)",
          institution: "Georgia Institute of Technology",
          timeframe: "Aug 2025 – Present",
          details: "Graduate studies exploring advanced computer engineering topics and resilient system design.",
          highlights: ["Continuing research interests in embedded sensing and radiation effects."]
        },
        {
          degree: "B.S. Computer Engineering, Minor in Computer Science",
          institution: "Brigham Young University",
          timeframe: "Aug 2020 – Apr 2025",
          details: "Graduated with a 3.79 GPA; coursework in embedded systems, digital design, software construction, and networking.",
          highlights: [
            "Senior Capstone: Designed the interface and communication subsystem for Epiroc's industrial drill monitoring platform.",
            "Research assistant focusing on non-invasive glucose monitoring and radiation-effects simulation frameworks."
          ]
        }
      ],
      experiences: [
        {
          role: "Private Instructor & Instructor Success Trainer",
          company: "Juni Learning",
          location: "Remote",
          timeframe: "May 2021 – Present",
          highlights: [
            "Teach one-on-one programming, STEM, and Spanish lessons for students ages 7–18.",
            "Adapt sessions to a wide range of learning styles and goals.",
            "Mentor new instructors and review curriculum delivery as an Instructor Success Trainer."
          ]
        },
        {
          role: "Undergraduate Research Assistant",
          company: "Brigham Young University",
          location: "Provo, UT",
          timeframe: "Sep 2022 – Oct 2024",
          highlights: [
            "Co-developed non-invasive glucose monitoring prototypes with a multidisciplinary team.",
            "Created MATLAB and Python signal-processing workflows to calibrate sensors and analyze clinical data.",
            "Contributed to the Purdue SCALE OSCRE framework to improve single-event effect simulations and co-authored the initial technical paper."
          ]
        },
        {
          role: "IMMERSE Summer Researcher",
          company: "Purdue SCALE & Brigham Young University",
          location: "Provo, UT",
          timeframe: "Summer 2024",
          highlights: [
            "Led integration of the open-source OSCRE radiation-effects simulation framework.",
            "Automated toolchain setup for Xschem and Ngspice to accelerate SEE analysis.",
            "Documented workflows and collaborated across institutions to guide future contributors."
          ]
        },
        {
          role: "Capstone Engineer – Industrial Drill Sensor Integration",
          company: "Epiroc / Brigham Young University",
          location: "Provo, UT",
          timeframe: "Jan 2024 – Apr 2024",
          highlights: [
            "Designed the embedded interface for real-time temperature and pressure monitoring.",
            "Implemented I2C sensor communication and BLE data streaming to the supervisory server.",
            "Delivered a production-ready operator display for drill status insights."
          ]
        },
        {
          role: "Programmer & Web Designer",
          company: "AudioT & Freelance",
          location: "Remote",
          timeframe: "May 2020 – Jun 2021",
          highlights: [
            "Developed web experiences with HTML, CSS, JavaScript, and Vue for academic and startup partners.",
            "Programmed Raspberry Pi prototypes with Python and Bash to support AudioT's product experiments.",
            "Managed deployments and iterative feature updates with an emphasis on usability."
          ]
        },
        {
          role: "Full-Time Service Volunteer",
          company: "Ecuador Mission",
          location: "Ecuador",
          timeframe: "Jul 2018 – Apr 2020",
          highlights: [
            "Coordinated training and assignments for a district of 12 volunteers.",
            "Maintained operational records while serving communities 10+ hours daily.",
            "Developed leadership, resilience, and bilingual communication skills."
          ]
        }
      ],
      projects: [
        {
          name: "Industrial Drill Monitoring Platform",
          timeframe: "2024",
          description:
            "Capstone system that streams drill temperature and pressure data to operators in real time using BLE and custom embedded firmware.",
          tech: ["C", "I2C", "BLE", "Embedded UI"]
        },
        {
          name: "Open-Source Circuit Radiation Effects (OSCRE)",
          timeframe: "2024",
          description:
            "Collaborative Purdue SCALE framework integrating Xschem and Ngspice tooling to simulate single-event effects in radiation environments.",
          tech: ["Python", "Bash", "Ngspice", "Xschem"]
        },
        {
          name: "Zilch Game Engine",
          timeframe: "Ongoing",
          description:
            "Personal project evolving a dice game from C++ prototypes to a Java-based architecture that applies object-oriented patterns for extensibility.",
          tech: ["Java", "C++", "Game Design"]
        },
        {
          name: "Web Portfolio Management",
          timeframe: "Ongoing",
          description:
            "Maintain personal and client-facing sites built with Vue and Vitesse, focusing on responsive UI design and performance.",
          tech: ["Vue", "Vitesse", "TypeScript"]
        }
      ],
      skills: {
        programmingLanguages: [
          "C",
          "C++",
          "Java",
          "Python",
          "TypeScript",
          "HTML & CSS",
          "JavaScript",
          "SystemVerilog",
          "VHDL",
          "Swift",
          "MATLAB",
          "RISC-V Assembly"
        ],
        frameworksAndTools: [
          "Vue",
          "Vitesse",
          "React",
          "SwiftUI",
          "NumPy",
          "Pandas",
          "Matplotlib"
        ],
        competencies: [
          "Embedded systems design",
          "Signal processing & data analysis",
          "Radiation-effects simulation",
          "Wireless & sensor integration",
          "Technical instruction and mentorship"
        ],
        spokenLanguages: [
          "English",
          "Spanish (fluent)",
          "Portuguese (conversational)"
        ]
      },
      achievements: [
        "Eagle Scout, Boy Scouts of America",
        "Phi Eta Sigma Honor Society member"
      ],
      teaching: {
        rate: 40,
        summary:
          "I work with kids and teens to build confidence in programming, STEM fundamentals, and conversational Spanish through personalized lessons.",
        focusAreas: ["Programming", "STEM enrichment", "Spanish"],
        link: "https://classes.jacobdanderson.net"
      }
    } as UserProfile
  }),

  actions: {},

  getters: {
    projectNames: (state) => state.userProfile.projects.map((project) => project.name)
  }
});

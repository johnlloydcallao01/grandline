export interface AboutValueItem {
  icon: string;
  title: string;
  description: string;
}

export interface AboutStatItem {
  value: string;
  label: string;
}

export const aboutHeroTitle = {
  first: "About",
  second: "Us",
};

export const aboutHeroDescription =
  "We're on a mission to make expert maritime training accessible to aspiring professionals, helping them build skills and confidence to advance their careers through innovative learning experiences.";

export const aboutPageTitle = "About Us";

export const aboutPageDescription =
  "Learn more about Grandline Maritime Training, our mission, our values, and the people behind the platform.";

export const aboutBackgroundTitle = "Background";

export const aboutBackgroundParagraphs = [
  "Grandline Maritime Training and Development Center Inc. was created to make maritime learning efficient, professional, and accessible. Our intuitive online platform lets learners track their progress, study on their own schedule, and gain confidence in their skills without feeling overwhelmed.",
  "With expert-led courses designed to shape the next generation of maritime professionals, we equip aspiring seafarers with the knowledge and practical skills needed to excel in their careers.",
];

export const aboutBackgroundImage = {
  src: "https://images.pexels.com/photos/1181352/pexels-photo-1181352.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
  alt: "Team collaboration",
  statValue: "50+",
  statLabel: "Expert-Led Courses",
};

export const aboutMission = {
  title: "Mission",
  icon: "fas fa-bullseye",
  iconColorClassName: "text-[#201a7c]",
  iconBackgroundClassName: "bg-[#201a7c]/10",
  description:
    "To provide aspiring maritime professionals with comprehensive, high-quality, and accessible training that blends expert-led instruction, practical skills development, and innovative learning technology, empowering learners to navigate their careers with confidence, competence, and professionalism.",
};

export const aboutVision = {
  title: "Vision",
  icon: "fas fa-eye",
  iconColorClassName: "text-[#ab3b43]",
  iconBackgroundClassName: "bg-[#ab3b43]/10",
  description:
    "To become a globally recognized maritime training center that shapes the next generation of skilled and confident maritime professionals, fostering a culture of excellence, continuous learning, and innovation in the maritime industry.",
};

export const aboutValuesHeading = "Our Values";

export const aboutValuesDescription =
  "These core values guide everything we do and shape the culture of our organization.";

export const aboutValues: AboutValueItem[] = [
  {
    icon: "fas fa-lightbulb",
    title: "Innovation",
    description:
      "We advance maritime training by integrating modern technology with hands-on seafaring expertise, ensuring learners gain practical and up-to-date skills.",
  },
  {
    icon: "fas fa-users",
    title: "Accessibility",
    description:
      "We make maritime education attainable for aspiring seafarers everywhere, providing flexible learning that fits diverse schedules and locations.",
  },
  {
    icon: "fas fa-star",
    title: "Excellence",
    description:
      "We uphold the highest standards in maritime instruction, course quality, and student support, preparing professionals to excel at sea and in their careers.",
  },
  {
    icon: "fas fa-handshake",
    title: "Community",
    description:
      "We foster a collaborative maritime learning environment, connecting learners and instructors to share knowledge, experience, and guidance throughout their professional journey.",
  },
];

export const aboutTeamHeading = "Meet Our Team";

export const aboutTeamDescription =
  "Our diverse team of educators, technologists, and industry experts is passionate about transforming education.";

export const aboutImpactHeading = "Our Impact";

export const aboutImpactSubheading =
  "Empowering the Next Generation of Maritime Professionals";

export const aboutImpactDescription =
  "Set sail toward success with our comprehensive learning platform, designed to equip you with the skills and confidence to excel in your maritime career.";

export const aboutImpactStats: AboutStatItem[] = [
  {
    value: "50+",
    label: "Expert-Led Courses",
  },
  {
    value: "100%",
    label: "Legally Compliant",
  },
  {
    value: "100%",
    label: "Unified Learning Platform",
  },
];

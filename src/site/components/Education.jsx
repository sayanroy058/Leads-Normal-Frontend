import Navbar from "./Navbar";
import ScrollToHash from "../ScrollToHash.jsx";
import EducationHero from "./EducationHero";
import EducationLeadProblems from "./EducationLeadProblems.jsx";
import EducationAIRadar from "./EducationAIRadar.jsx";
import EducationStudentJourney from "./EducationStudentJourney";
import EducationConversationHub from "./EducationConversationHub";
import EducationAIScoring from "./EducationAIScoring.jsx";
import EducationAIAnalytics from "./EducationAIAnalytics.jsx";
import EducationCTA from "./EducationCTA.jsx";
import Footer from "./Footer";

export default function Education() {
  return (
    <>
      {/* =========================
          GLOBAL NAVBAR + SCROLL
      ========================= */}
      <ScrollToHash />
      <Navbar />

      {/* =========================
          EDUCATION HERO
      ========================= */}
      <EducationHero />
      <EducationLeadProblems />
      <EducationAIRadar />
      <EducationStudentJourney />
      <EducationConversationHub />
     <EducationAIScoring />
      <EducationAIAnalytics />
      <EducationCTA />
      {/* =========================
          FOOTER
      ========================= */}
      <Footer />
    </>
  );
}
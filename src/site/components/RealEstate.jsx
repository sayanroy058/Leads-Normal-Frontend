import Navbar from "./Navbar";
import ScrollToHash from "../ScrollToHash.jsx";
import RealEstateHero from "./RealEstatehero.jsx";
import RealEstateIntelligence from "./RealEstateIntelligence.jsx";
import RealEstateQualification from "./RealEstateQualification.jsx";
import RealEstateConversion from "./RealEstateConversion.jsx";
import PersonalizedFollowUp from "./PersonalizedFollowUp";
import LeadJourney from "./LeadJourney";
import AILeadIntelligence from "./AILeadIntelligence";
import RealEstateTeams from "./RealEstateTeams";
import RealEstateCTA from "./RealEstateCTA";
import Footer from "./Footer";
export default function RealEstate() {
  return (
    <main className="real-estate-page">

      <ScrollToHash />
      <Navbar />

      <RealEstateHero />

      <RealEstateIntelligence />
      <RealEstateQualification />
     <RealEstateConversion />
     <PersonalizedFollowUp />
     <LeadJourney/>
     <AILeadIntelligence />
     <RealEstateTeams />
     <RealEstateCTA />
     <Footer />


    </main>
  );
}
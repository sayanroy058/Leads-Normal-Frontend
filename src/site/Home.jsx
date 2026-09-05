import Navbar from "./components/Navbar.jsx";
import ScrollToHash from "./ScrollToHash.jsx";
import Hero from "./components/Hero.jsx";
import Feature from "./components/Features.jsx";
import ProductShowcase from "./components/ProductShowcase.jsx";
import BeforeAfter from "./components/BeforeAfter.jsx";
import HowItWork from "./components/HowItWorks.jsx";
import BuiltForTeams from "./components/BuiltForTeams.jsx";
import TrustedByLeaders from "./components/TrustedByLeaders.jsx";
import Blogs from "./components/Blogs.jsx";
import CTA from "./components/CTA.jsx";
import Footer from "./components/Footer.jsx";

function Home() {
  return (
    <>
      <ScrollToHash />
      <Navbar />
      <Hero />
      <Feature />
      <ProductShowcase />
      <BeforeAfter />
      <HowItWork />
      <BuiltForTeams />
      <TrustedByLeaders />
      <Blogs />
      <CTA />
      <Footer />
    </>
  );
}

export default Home;
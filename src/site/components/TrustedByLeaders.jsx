import { useEffect, useState } from "react";
import "./TrustedByLeaders.css";



import captureImage from "../assets/features/captures.png";
import qualifyImage from "../assets/features/qualifys.png";
import prioritizeImage from "../assets/features/Prioritize.png";
import engageImage from "../assets/features/engages.png";
import followupImage from "../assets/features/Followup.png";
import convertImage from "../assets/features/coverts.png";



const CARDS = [
  {
   
    titleDark: "Every Opportunity",
    titleBlue: "Starts Here",
    subheading:
      "Bring every lead, inquiry, and customer interaction from every channel into one intelligent workspace.",
    
    bottomMessage:
      "Collect every inquiry from every channel in one place.",
    image: captureImage,
  },

  {
    
    titleDark: "Know Who",
    titleBlue: "Matters Most",
    subheading:
      "Use intelligent insights to understand which leads are genuinely interested and most likely to become customers.",
   
    bottomMessage:
      "Focus your team's time on opportunities with real buying intent.",
    image: qualifyImage,
  },

  {
   
    titleDark: "Focus Where",
    titleBlue: "It Counts",
    subheading:
      "Automatically surface your most valuable opportunities so your team always knows exactly where to focus first.",
    
    bottomMessage:
      "Your most valuable opportunities automatically rise to the top.",
    image: prioritizeImage,
  },

  {
    
    titleDark: "Make Every Conversation",
    titleBlue: "Count",
    subheading:
      "Create personalized and meaningful conversations that keep every prospect connected throughout their journey.",
    
    bottomMessage:
      "Deliver relevant conversations at exactly the right moment.",
    image: engageImage,
  },

  {
    
    titleDark: "Never Let",
    titleBlue: "Momentum Fade",
    subheading:
      "Automate timely follow-ups that keep conversations moving forward without losing the human connection.",
    
    bottomMessage:
      "Stay connected with every lead without missing an opportunity.",
    image: followupImage,
  },

  {
   
    titleDark: "Turn Intent",
    titleBlue: "Into Impact",
    subheading:
      "Turn qualified conversations into measurable revenue by helping your team move the right opportunities forward.",
    
    bottomMessage:
      "Turn strong conversations into predictable business growth.",
    image: convertImage,
  },
];



function TrustedByLeaders() {
  const [activeCard, setActiveCard] = useState(0);
  const [direction, setDirection] = useState("next");

  const nextCard = () => {
    setDirection("next");

    setActiveCard((previousCard) =>
      previousCard === CARDS.length - 1
        ? 0
        : previousCard + 1
    );
  };

  const previousCard = () => {
    setDirection("prev");

    setActiveCard((previousCard) =>
      previousCard === 0
        ? CARDS.length - 1
        : previousCard - 1
    );
  };

  const goToCard = (index) => {
    setDirection(index > activeCard ? "next" : "prev");
    setActiveCard(index);
  };

  

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setDirection("next");

      setActiveCard((previousCard) =>
        previousCard === CARDS.length - 1
          ? 0
          : previousCard + 1
      );
    }, 3000);

    return () => {
      clearInterval(sliderInterval);
    };
  }, []);

  const card = CARDS[activeCard];

  return (
    <section className="leaders-section">
      <div className="leaders-container">

        

        <div className="leaders-heading">
          <span className="leaders-eyebrow">
            BUILT FOR MODERN SALES TEAMS
          </span>

          <h2>
            Everything you need to
            <span> turn leads into growth.</span>
          </h2>

          <p>
            GradLead connects your entire lead journey —
            from the first interaction to the final conversion.
          </p>
        </div>

         

        <div className="leaders-slider">

          {/* PREVIOUS BUTTON */}

          <button
            type="button"
            className="slider-button slider-prev"
            onClick={previousCard}
            aria-label="Previous feature"
          >
            ←
          </button>


          <article
            key={card.number}
            className={`featured-leader-card ${direction}`}
          >

            

            <div className="featured-content">

              <div className="feature-top-row">

                <span className="featured-number">
                  {card.number}
                </span>

                <span className="featured-tag">
                  GRADLEAD
                </span>

              </div>

              

              <h3 className="feature-main-heading">
                <span className="heading-dark">
                  {card.titleDark}{" "}
                </span>

                <span className="heading-blue">
                  {card.titleBlue}
                </span>
              </h3>

            

              <p className="feature-subheading">
                {card.subheading}
              </p>

             

              <p className="feature-description">
                {card.text}
              </p>

              

            </div>

            

            <div className="featured-visual">

              <div className="visual-glow" />

              <img
                src={card.image}
                alt={`${card.titleDark} ${card.titleBlue} feature visual`}
                className="card-visual-image"
              />

            </div>

          </article>


          <button
            type="button"
            className="slider-button slider-next"
            onClick={nextCard}
            aria-label="Next feature"
          >
            →
          </button>

        </div>

        

        <div
          key={`message-${card.number}`}
          className="card-bottom-message"
        >
          <span className="message-line" />

          <p>
            {card.bottomMessage}
          </p>

          <span className="message-line message-line-right" />
        </div>

      

        <div className="slider-dots">

          {CARDS.map((item, index) => (
            <button
              type="button"
              key={item.number}
              className={
                activeCard === index
                  ? "slider-dot active"
                  : "slider-dot"
              }
              onClick={() => goToCard(index)}
              aria-label={`Show feature ${item.number}`}
            />
          ))}

        </div>

      </div>
    </section>
  );
}

export default TrustedByLeaders;
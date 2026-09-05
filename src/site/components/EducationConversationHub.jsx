import "./EducationConversationHub.css";

const CONVERSATIONS = [
  {
    type: "STUDENT",
    message: "I'm interested in the MBA program.",
    time: "09:42",
    position: "conversation-one",
  },
  {
    type: "AI",
    message: "Great! I can help you explore the right MBA pathway.",
    time: "09:42",
    position: "conversation-two",
  },
  {
    type: "STUDENT",
    message: "Can I apply for the next intake?",
    time: "09:43",
    position: "conversation-three",
  },
];

function EducationConversationHub() {
  return (
    <section
      className="education-conversation-section"
      id="education-conversation-hub"
    >
      <div className="education-conversation-container">

        {/* LEFT CONTENT */}
        <div className="education-conversation-content">

          <div className="education-conversation-eyebrow">
            <span className="conversation-dot" />
            AI CONVERSATION HUB
          </div>

          <h2>
            Turn Every Student
            <br />
            Conversation Into
            <br />
            <span>Momentum.</span>
          </h2>

          <p className="education-conversation-description">
            GradLead understands every student conversation, identifies
            intent and helps your team respond with the right message
            at the right moment.
          </p>

          <div className="education-conversation-points">

            <div className="conversation-point">
              <span>✓</span>
              <div>
                <strong>Understand intent</strong>
                <p>Know what every student actually needs.</p>
              </div>
            </div>

            <div className="conversation-point">
              <span>✓</span>
              <div>
                <strong>Personalize every interaction</strong>
                <p>Turn context into meaningful conversations.</p>
              </div>
            </div>

            <div className="conversation-point">
              <span>✓</span>
              <div>
                <strong>Respond faster</strong>
                <p>Keep high-intent students moving forward.</p>
              </div>
            </div>

          </div>

        </div>


        {/* RIGHT VISUAL */}
        <div className="education-conversation-visual">

          <div className="conversation-ambient-glow" />

          
          <div className="conversation-ring conversation-ring-one" />
          <div className="conversation-ring conversation-ring-two" />
          <div className="conversation-ring conversation-ring-three" />

         
          <div className="conversation-signal signal-a">
            <span>●</span>
            Student
          </div>

          <div className="conversation-signal signal-b">
            <span>✦</span>
            AI
          </div>

          <div className="conversation-signal signal-c">
            <span>✓</span>
            Intent
          </div>


          
          <div className="conversation-ai-core">

            <div className="conversation-core-glow" />

            <div className="conversation-core-inner">

              <span className="conversation-core-star">
                ✦
              </span>

              <strong>AI</strong>

              <small>
                CONVERSATION
              </small>

            </div>

          </div>


          
          <div className="conversation-connection connection-a" />
          <div className="conversation-connection connection-b" />
          <div className="conversation-connection connection-c" />


          <div className="conversation-card conversation-card-one">

            <div className="conversation-card-top">

              <div className="conversation-avatar student-avatar">
                S
              </div>

              <div>
                <span>STUDENT</span>
                <small>09:42</small>
              </div>

              <i />
            </div>

            <p>
              I'm interested in the MBA program.
            </p>

          </div>


          
          <div className="conversation-card conversation-card-two">

            <div className="conversation-card-top">

              <div className="conversation-avatar ai-avatar">
                ✦
              </div>

              <div>
                <span>GRADLEAD AI</span>
                <small>09:42</small>
              </div>

              <i />
            </div>

            <p>
              Great! I can help you explore the right MBA pathway.
            </p>

          </div>


          {/* CHAT CARD 3 */}
          <div className="conversation-card conversation-card-three">

            <div className="conversation-card-top">

              <div className="conversation-avatar student-avatar">
                S
              </div>

              <div>
                <span>STUDENT</span>
                <small>09:43</small>
              </div>

              <i />
            </div>

            <p>
              Can I apply for the next intake?
            </p>

          </div>


          {/* PROCESSING */}
          <div className="conversation-processing">

            <span className="processing-pulse" />

            <span>
              AI understanding conversation
            </span>

            <div className="conversation-processing-bars">
              <i />
              <i />
              <i />
              <i />
            </div>

          </div>


          {/* INTENT RESULT */}
          <div className="conversation-intent">

            <div className="intent-icon">
              ✦
            </div>

            <div className="intent-content">

              <span>
                INTENT DETECTED
              </span>

              <strong>
                High Enrollment Potential
              </strong>

            </div>

            <b>
              94%
            </b>

          </div>

        </div>

      </div>
    </section>
  );
}

export default EducationConversationHub;
import React, { useRef } from "react";
import { COMMUNITIES } from "./eventsData";

function EventCommunityStrip({ activeCommunity, setActiveCommunity }) {
  const scrollRef = useRef(null);

  const scrollComm = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <div className="ev-community-section">
      <button
        className="ev-comm-scroll-btn ev-comm-scroll-btn--left"
        onClick={() => scrollComm(-1)}
        aria-label="Scroll left"
      >
        <i className="fa-solid fa-chevron-left" />
      </button>

      <div className="ev-community-strip" ref={scrollRef}>
        {COMMUNITIES.map((c) => (
          <button
            key={c.id}
            className={`ev-comm-card ${activeCommunity === c.id ? "ev-comm-card--active" : ""}`}
            onClick={() => setActiveCommunity(c.id)}
          >
            <div className="ev-comm-icon-wrap">
              <i className={`fa-solid ${c.icon}`} />
            </div>
            <span className="ev-comm-label">{c.label}</span>
          </button>
        ))}
      </div>

      <button
        className="ev-comm-scroll-btn ev-comm-scroll-btn--right"
        onClick={() => scrollComm(1)}
        aria-label="Scroll right"
      >
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );
}

export default EventCommunityStrip;

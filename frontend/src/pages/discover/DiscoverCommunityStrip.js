import React, { useRef } from "react";
import { COMMUNITIES } from "./discoverData";

function DiscoverCommunityStrip({ activeCommunity, setActiveCommunity }) {
  const commScrollRef = useRef(null);

  const scrollComm = (dir) => {
    commScrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <div className="disc-community-section">
      <button
        className="disc-comm-scroll-btn"
        onClick={() => scrollComm(-1)}
        aria-label="Scroll left"
      >
        <i className="fa-solid fa-chevron-left" />
      </button>

      <div className="disc-community-strip" ref={commScrollRef}>
        {COMMUNITIES.map((c) => (
          <button
            key={c.id}
            className={`disc-comm-card ${activeCommunity === c.id ? "disc-comm-card--active" : ""}`}
            style={{ "--comm-color": c.color }}
            onClick={() => setActiveCommunity(c.id)}
          >
            <div className="disc-comm-icon-wrap">
              <i className={`fa-solid ${c.icon}`} />
            </div>
            <span className="disc-comm-label">{c.label}</span>
          </button>
        ))}
      </div>

      <button
        className="disc-comm-scroll-btn"
        onClick={() => scrollComm(1)}
        aria-label="Scroll right"
      >
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );
}

export default DiscoverCommunityStrip;

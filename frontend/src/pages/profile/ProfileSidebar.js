import React from 'react';

function ProfileSidebar({ navItems, activeTab, setActiveTab }) {
  return (
    <aside className="prof-sidebar">
      {/* Profile Header Badge */}
      <div className="prof-sidebar-brand">
        <h3 className="prof-sidebar-title">Academic Profile</h3>
        <span className="prof-sidebar-badge">
          <i className="fa-solid fa-circle-check" /> Verified Student
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="prof-sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              className={`prof-nav-btn ${isActive ? "prof-nav-btn--active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <div className="prof-nav-btn-left">
                <i className={`${item.icon} prof-nav-icon`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="prof-nav-count">{item.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="prof-sidebar-footer">
        <a href="#help" className="prof-sidebar-help" onClick={(e) => e.preventDefault()}>
          <i className="fa-regular fa-circle-question" />
          <span>Help Center</span>
        </a>

        <button className="prof-complete-btn" onClick={() => setActiveTab("personalDetails")}>
          <i className="fa-solid fa-sparkles" /> Complete Profile
        </button>
      </div>
    </aside>
  );
}

export default ProfileSidebar;

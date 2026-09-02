export default function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="org-empty-state" role="status">
      {Icon && (
        <div className="org-empty-state-icon" aria-hidden="true">
          <Icon size={22} />
        </div>
      )}
      <h3 className="org-empty-state-title">{title}</h3>
      {desc && <p className="org-empty-state-desc">{desc}</p>}
      {action}
    </div>
  );
}

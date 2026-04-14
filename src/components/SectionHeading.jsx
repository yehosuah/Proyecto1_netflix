export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="section-heading">
      <div className="section-copy">
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <span className="section-heading__accent" aria-hidden="true" />
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

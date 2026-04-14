import { Bookmark, BookmarkCheck, Sparkles } from "lucide-react";

function formatProgress(progress) {
  return `${Math.round(progress * 100)}% visto`;
}

export default function PosterCard({
  title,
  onOpen,
  onFavoriteToggle,
  compact = false,
}) {
  const buttonLabel = `${title.title}. ${title.language}. ${title.duration}.`;

  return (
    <article className={`poster-card ${compact ? "poster-card--compact" : ""}`}>
      <button
        type="button"
        className="poster-button"
        onClick={() => onOpen(title.id)}
        data-voice={buttonLabel}
      >
        <div
          className="poster-art"
          style={{ backgroundImage: title.image }}
          aria-hidden="true"
        >
          <div className="poster-overlay">
            <span>{title.year}</span>
            <span>{title.mediaType}</span>
          </div>
          <div className="poster-title-lockup">
            <strong>{title.title}</strong>
            <small>{title.category}</small>
          </div>
        </div>
        <div className="poster-copy">
          <div className="poster-meta-row">
            <span className="poster-chip">{title.language}</span>
            <span className="poster-chip">{title.subtitles}</span>
          </div>
          <div className="poster-heading">
            <h3>{title.title}</h3>
            {title.progress > 0 ? (
              <span className="poster-flag">Continuar</span>
            ) : (
              <span className="poster-flag poster-flag--soft">Nuevo</span>
            )}
          </div>
          <div className="poster-reason">
            <Sparkles size={15} strokeWidth={2.1} />
            <span>{title.reason}</span>
          </div>
          <p>{title.synopsis}</p>
          {title.progress > 0 ? (
            <div className="progress-wrap" aria-label={formatProgress(title.progress)}>
              <div
                className="progress-bar"
                style={{ width: `${Math.max(title.progress * 100, 6)}%` }}
              />
            </div>
          ) : null}
        </div>
      </button>
      <div className="poster-actions">
        <button
          type="button"
          className={`inline-action ${title.isFavorite ? "inline-action--active" : ""}`}
          onClick={() => onFavoriteToggle(title.id)}
          data-voice={
            title.isFavorite
              ? `Quitar ${title.title} de favoritos`
              : `Agregar ${title.title} a favoritos`
          }
        >
          {title.isFavorite ? (
            <BookmarkCheck size={16} strokeWidth={2.1} />
          ) : (
            <Bookmark size={16} strokeWidth={2.1} />
          )}
          {title.isFavorite ? "Quitar favorito" : "Guardar favorito"}
        </button>
      </div>
    </article>
  );
}

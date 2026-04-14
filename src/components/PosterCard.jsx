import { Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import {
  formatProgress,
  getListActionLabel,
  getListVoiceLabel,
  getMediaTypeLabel,
} from "../lib/copy";

export default function PosterCard({
  title,
  onOpen,
  onFavoriteToggle,
  compact = false,
}) {
  const buttonLabel = `${title.title}. ${getMediaTypeLabel(title.mediaType)}. ${title.language}. ${title.duration}.`;

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
          aria-hidden="true"
        >
          <img className="poster-image" src={title.image} alt="" loading="lazy" />
          <div className="poster-overlay">
            <span>{title.year}</span>
            <span>{getMediaTypeLabel(title.mediaType)}</span>
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
              <span className="poster-flag">En progreso</span>
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
          data-voice={getListVoiceLabel(title.title, title.isFavorite)}
        >
          {title.isFavorite ? (
            <BookmarkCheck size={16} strokeWidth={2.1} />
          ) : (
            <Bookmark size={16} strokeWidth={2.1} />
          )}
          {getListActionLabel(title.isFavorite)}
        </button>
      </div>
    </article>
  );
}

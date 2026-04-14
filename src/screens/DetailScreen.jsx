import { Heart, Play } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import PosterCard from "../components/PosterCard";
import SectionHeading from "../components/SectionHeading";
import { useAppModel } from "../lib/app-model";

export default function DetailScreen() {
  const { id } = useParams();
  const app = useAppModel();
  const navigate = useNavigate();
  const title = app.getTitleById(id);

  if (!title) {
    return <Navigate to="/" replace />;
  }

  const relatedTitles = app
    .getTitlesForCollection(title.collections[0] ?? "familia", "todos")
    .filter((item) => item.id !== title.id)
    .slice(0, 3);

  function handlePlay() {
    app.openTitle(title.id);
    navigate(`/reproducir/${title.id}`);
  }

  return (
    <>
      <section className="detail-hero">
        <div className="detail-art" style={{ backgroundImage: title.image }}>
          <div className="detail-art-overlay">
            <span>{title.mediaType}</span>
            <span>{title.year}</span>
            <span>{title.category}</span>
          </div>
        </div>

        <div className="detail-copy">
          <p className="section-eyebrow">Pantalla de detalle</p>
          <h1>{title.title}</h1>
          <p className="detail-lead">{title.synopsis}</p>
          <div className="tag-row">
            <span>{title.language}</span>
            <span>{title.duration}</span>
            <span>{title.subtitles}</span>
          </div>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={handlePlay}
              data-voice={`Reproducir ${title.title}`}
            >
              <Play size={18} strokeWidth={2.4} />
              Reproducir
            </button>
            <button
              type="button"
              className={`secondary-button ${title.isFavorite ? "secondary-button--active" : ""}`}
              onClick={() => app.toggleFavorite(title.id)}
              data-voice={
                title.isFavorite
                  ? `Quitar ${title.title} de favoritos`
                  : `Agregar ${title.title} a favoritos`
              }
            >
              <Heart size={18} strokeWidth={2.2} />
              {title.isFavorite ? "Quitar favorito" : "Agregar a favoritos"}
            </button>
          </div>
          <div className="detail-grid">
            <div className="detail-block">
              <h3>Por qué aparece aquí</h3>
              <p>{title.reason}</p>
            </div>
            <div className="detail-block">
              <h3>Información rápida</h3>
              <ul>
                <li>Género: {title.genre}</li>
                <li>Idioma: {title.language}</li>
                <li>Subtítulos: {title.subtitles}</li>
                <li>Estado: {title.progress > 0 ? "Ya empezaste a verlo" : "Aún no iniciado"}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Seguir explorando"
          title="Opciones parecidas"
          description="Relacionadas por tema o por la misma colección simplificada."
        />
        <div className="poster-grid">
          {relatedTitles.map((item) => (
            <PosterCard
              key={item.id}
              title={item}
              onOpen={(nextId) => {
                app.openTitle(nextId);
                navigate(`/detalle/${nextId}`);
              }}
              onFavoriteToggle={app.toggleFavorite}
              compact
            />
          ))}
        </div>
      </section>
    </>
  );
}

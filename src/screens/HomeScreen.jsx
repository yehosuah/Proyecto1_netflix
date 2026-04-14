import { startTransition, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clapperboard,
  Heart,
  Languages,
  Search,
  TimerReset,
  Tv,
  Users,
  Video,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PosterCard from "../components/PosterCard";
import SectionHeading from "../components/SectionHeading";
import { GUIDED_CHOICES, QUICK_ACTIONS } from "../data/catalog";
import { formatProgress } from "../lib/copy";
import { useAppModel } from "../lib/app-model";

const QUICK_TILE_ICONS = {
  continuar: Video,
  favoritos: Heart,
  peliculas: Clapperboard,
  series: Tv,
  documentales: TimerReset,
  buscar: Search,
};

const GUIDE_ICONS = {
  espanol: Languages,
  corto: TimerReset,
  real: Clapperboard,
  acompanado: Users,
};

function QuickTile({ item, onClick }) {
  const Icon = QUICK_TILE_ICONS[item.id] ?? Search;

  return (
    <button
      type="button"
      className="quick-tile"
      onClick={() => onClick(item.path)}
      data-voice={`${item.label}. ${item.description}`}
    >
      <div className="tile-header">
        <span className="tile-icon" aria-hidden="true">
          <Icon size={18} strokeWidth={2.2} />
        </span>
        <ArrowRight size={16} strokeWidth={2.2} className="tile-arrow" aria-hidden="true" />
      </div>
      <span>{item.label}</span>
      <small>{item.description}</small>
    </button>
  );
}

function EmptyFavorites() {
  const app = useAppModel();

  return (
    <div className="empty-state">
      <img src={app.logoImage} alt="" aria-hidden="true" />
      <div>
        <h3>Tu lista está vacía</h3>
        <p>Guarda una película o serie para volver rápido después.</p>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const app = useAppModel();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const heroTitle = app.continueWatching[0] ?? app.recommended[0];
  const focusTarget = searchParams.get("focus");
  const [activeGuide, setActiveGuide] = useState("espanol");
  const guidedRailMap = useMemo(
    () => ({
      espanol: app.spanishPicks,
      corto: app.shortSessionPicks,
      real: app.realStoriesPicks,
      acompanado: app.familyPicks,
    }),
    [app.familyPicks, app.realStoriesPicks, app.shortSessionPicks, app.spanishPicks],
  );
  const activeChoice =
    GUIDED_CHOICES.find((choice) => choice.id === activeGuide) ?? GUIDED_CHOICES[0];
  const activeGuideTitles = guidedRailMap[activeChoice.id] ?? [];

  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    const target = document.getElementById(focusTarget);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusTarget]);

  function openPath(path) {
    navigate(path);
  }

  function openTitle(id) {
    app.openTitle(id);
    navigate(`/detalle/${id}`);
  }

  function openPlayer() {
    if (!heroTitle) {
      navigate("/buscar");
      return;
    }

    app.openTitle(heroTitle.id);
    navigate(`/reproducir/${heroTitle.id}`);
  }

  return (
    <>
      <section
        className="hero-panel"
        style={{
          backgroundImage: heroTitle ? `url(${heroTitle.image})` : undefined,
        }}
      >
        <div className="hero-copy">
          <p className="section-eyebrow">Inicio</p>
          <h2>Elige algo para ver sin perder tiempo.</h2>
          <p>Rutas claras, texto grande y recomendaciones fáciles de entender.</p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={openPlayer}
              data-voice="Seguir viendo"
            >
              Seguir viendo
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/buscar")}
              data-voice="Abrir búsqueda"
            >
              <Search size={18} strokeWidth={2.3} />
              Buscar
            </button>
          </div>
        </div>
        <div className="hero-highlight">
          <span className="section-eyebrow">Recomendado ahora</span>
          {heroTitle ? (
            <>
              <h3>{heroTitle.title}</h3>
              <p>{heroTitle.reason}</p>
              <div className="hero-meta">
                <span>{heroTitle.language}</span>
                <span>{heroTitle.duration}</span>
                <span>{heroTitle.subtitles}</span>
              </div>
              {app.lastOpenedTitle ? (
                <div className="hero-status">
                  <strong>Último avance</strong>
                  <p>
                    {app.lastOpenedTitle.title}
                    {app.lastOpenedTitle.progress > 0
                      ? ` · ${formatProgress(app.lastOpenedTitle.progress)}`
                      : " · listo para empezar"}
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <p>Busca una opción para empezar.</p>
          )}
        </div>
      </section>

      <section className="panel-surface">
        <SectionHeading
          eyebrow="Accesos directos"
          title="Lo principal, al frente"
          description="Entradas rápidas a las acciones que más se usan."
        />
        <div className="quick-grid">
          {QUICK_ACTIONS.map((item) => (
            <QuickTile key={item.id} item={item} onClick={openPath} />
          ))}
        </div>
      </section>

      <section className="panel-surface">
        <SectionHeading
          eyebrow="Decisión guiada"
          title="Cómo quieres ver hoy"
          description="Elige una ruta y te mostramos opciones acordes."
        />
        <div className="guide-grid">
          {GUIDED_CHOICES.map((choice) => (
            (() => {
              const Icon = GUIDE_ICONS[choice.id] ?? Search;

              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`guide-tile ${choice.id === activeGuide ? "is-active" : ""}`}
                  onClick={() =>
                    startTransition(() => {
                      setActiveGuide(choice.id);
                    })
                  }
                  data-voice={`${choice.label}. ${choice.description}`}
                >
                  <div className="tile-header">
                    <span className="tile-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <ArrowRight
                      size={16}
                      strokeWidth={2.2}
                      className="tile-arrow"
                      aria-hidden="true"
                    />
                  </div>
                  <span>{choice.label}</span>
                  <small>{choice.description}</small>
                </button>
              );
            })()
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow={activeChoice.eyebrow}
          title={activeChoice.title}
          description="Selección breve y fácil de comparar."
        />
        <div className="poster-grid">
          {activeGuideTitles.map((title) => (
            <PosterCard
              key={title.id}
              title={title}
              onOpen={openTitle}
              onFavoriteToggle={app.toggleFavorite}
              compact
            />
          ))}
        </div>
      </section>

      <section id="continuar" className="content-section">
        <SectionHeading
          eyebrow="Seguir viendo"
          title="Retoma donde te quedaste"
          description="Tus avances se guardan en este navegador."
        />
        <div className="poster-grid">
          {app.continueWatching.map((title) => (
            <PosterCard
              key={title.id}
              title={title}
              onOpen={openTitle}
              onFavoriteToggle={app.toggleFavorite}
              compact
            />
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Recomendados"
          title="Opciones para empezar fácil"
          description="Una selección clara para decidir sin dar muchas vueltas."
        />
        <div className="poster-grid">
          {app.recommended.slice(0, 6).map((title) => (
            <PosterCard
              key={title.id}
              title={title}
              onOpen={openTitle}
              onFavoriteToggle={app.toggleFavorite}
            />
          ))}
        </div>
      </section>

      {app.basedOnFavorites.length ? (
        <section className="content-section">
          <SectionHeading
            eyebrow="Basado en tu lista"
            title="Más opciones parecidas"
            description="Usa lo que ya guardaste para reducir la búsqueda."
          />
          <div className="poster-grid">
            {app.basedOnFavorites.map((title) => (
              <PosterCard
                key={title.id}
                title={title}
                onOpen={openTitle}
                onFavoriteToggle={app.toggleFavorite}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="content-section" id="favoritos">
        <SectionHeading
          eyebrow="Mi lista"
          title="Tus guardados"
          description="Todo lo que guardes aparece aquí."
        />
        {app.favoriteTitles.length ? (
          <div className="poster-grid">
            {app.favoriteTitles.map((title) => (
              <PosterCard
                key={title.id}
                title={title}
                onOpen={openTitle}
                onFavoriteToggle={app.toggleFavorite}
                compact
              />
            ))}
          </div>
        ) : (
          <EmptyFavorites />
        )}
      </section>
    </>
  );
}

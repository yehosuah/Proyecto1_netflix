import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PosterCard from "../components/PosterCard";
import SectionHeading from "../components/SectionHeading";
import { SUGGESTED_SEARCHES } from "../data/catalog";
import { useAppModel } from "../lib/app-model";

const FILTERS = [
  { id: "todos", label: "Todo" },
  { id: "espanol", label: "En español" },
  { id: "historias-reales", label: "Historias reales" },
  { id: "documentales", label: "Documentales" },
  { id: "favoritos", label: "Favoritos" },
];

function matchesFilter(title, filter) {
  if (filter === "todos") {
    return true;
  }

  if (filter === "favoritos") {
    return title.isFavorite;
  }

  return title.collections.includes(filter);
}

function matchesQuery(title, query) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();

  return [
    title.title,
    title.category,
    title.genre,
    title.language,
    title.synopsis,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

export default function SearchScreen() {
  const app = useAppModel();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const inputRef = useRef(null);
  const deferredQuery = useDeferredValue(query.trim());
  const visibleTitles = app.titles.filter(
    (title) => matchesFilter(title, activeFilter) && matchesQuery(title, deferredQuery),
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;
      const tagName = activeElement?.tagName?.toLowerCase();
      const isTypingElement =
        tagName === "input" ||
        tagName === "textarea" ||
        activeElement?.getAttribute("contenteditable") === "true";

      if (event.key === "/" && !isTypingElement) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }

      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function openTitle(id) {
    if (query.trim()) {
      startTransition(() => {
        app.saveSearch(query.trim());
      });
    }

    app.openTitle(id);
    navigate(`/detalle/${id}`);
  }

  function runRecentSearch(value) {
    setQuery(value);
    app.saveSearch(value);
    inputRef.current?.focus();
  }

  function handleQuerySubmit() {
    if (!query.trim()) {
      return;
    }

    app.saveSearch(query);
  }

  return (
    <>
      <section className="search-panel">
        <SectionHeading
          eyebrow="Búsqueda asistida"
          title="Escribe un nombre, idioma o categoría"
          description="También puedes tocar una búsqueda reciente o usar filtros rápidos."
        />
        <label className="search-field" data-voice="Campo de búsqueda">
          <Search size={22} strokeWidth={2.2} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleQuerySubmit();
              }
            }}
            placeholder="Ejemplo: español, comedia, Roma"
            aria-label="Buscar contenido"
          />
          {query ? (
            <button
              type="button"
              className="icon-button"
              onClick={() => setQuery("")}
              data-voice="Limpiar búsqueda"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          ) : null}
        </label>
        <div className="history-wrap">
          <span className="section-eyebrow">Búsqueda rápida</span>
          <div className="history-list">
            {SUGGESTED_SEARCHES.map((item) => (
              <button
                key={item}
                type="button"
                className="history-pill"
                onClick={() => runRecentSearch(item)}
                data-voice={`Buscar ${item}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="option-bar" role="tablist" aria-label="Filtros rápidos">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`option-pill ${activeFilter === filter.id ? "is-active" : ""}`}
              onClick={() => {
                startTransition(() => {
                  setActiveFilter(filter.id);
                });
              }}
              data-voice={filter.label}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="history-wrap">
          <span className="section-eyebrow">Búsquedas recientes</span>
          <div className="history-list">
            {app.searchHistory.length ? (
              app.searchHistory.map((item) => (
                <button
                  key={`${item.query}-${item.timestamp}`}
                  type="button"
                  className="history-pill"
                  onClick={() => runRecentSearch(item.query)}
                  data-voice={`Buscar ${item.query}`}
                >
                  {item.query}
                </button>
              ))
            ) : (
              <span className="history-empty">Aún no has buscado nada.</span>
            )}
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Resultados visibles"
          title={`${visibleTitles.length} coincidencias`}
          description="El resultado se filtra en tiempo real sin bloquear la escritura."
          action={
            query ? (
              <button
                type="button"
                className="ghost-button"
                onClick={handleQuerySubmit}
                data-voice={`Guardar búsqueda ${query}`}
              >
                Guardar búsqueda
              </button>
            ) : null
          }
        />
        {visibleTitles.length ? (
          <div className="poster-grid">
            {visibleTitles.map((title) => (
              <PosterCard
                key={title.id}
                title={title}
                onOpen={openTitle}
                onFavoriteToggle={app.toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--text">
            <div>
              <h3>No hay coincidencias</h3>
              <p>Prueba otro término, otro idioma o un filtro distinto.</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setQuery("español");
                setActiveFilter("espanol");
              }}
              data-voice="Probar búsqueda en español"
            >
              Probar en español
            </button>
          </div>
        )}
      </section>
    </>
  );
}

import { useNavigate, useSearchParams } from "react-router-dom";
import PosterCard from "../components/PosterCard";
import SectionHeading from "../components/SectionHeading";
import { COLLECTIONS, SCOPE_OPTIONS } from "../data/catalog";
import { useAppModel } from "../lib/app-model";

function OptionBar({ items, activeId, onChange, label }) {
  return (
    <div className="option-bar" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`option-pill ${activeId === item.id ? "is-active" : ""}`}
          onClick={() => onChange(item.id)}
          data-voice={`${item.label}. ${item.description ?? ""}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function CategoriesScreen() {
  const app = useAppModel();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeScope = searchParams.get("scope") ?? "todos";
  const scopeDefaultCollectionMap = {
    documental: "documentales",
    pelicula: "espanol",
    serie: "comedias",
  };
  const activeCollection =
    searchParams.get("collection") ??
    scopeDefaultCollectionMap[activeScope] ??
    COLLECTIONS[0].id;
  const selectedCollection =
    COLLECTIONS.find((collection) => collection.id === activeCollection) ??
    COLLECTIONS[0];
  const filteredTitles = app.getTitlesForCollection(activeCollection, activeScope);

  function updateParam(key, value) {
    const nextParams = new URLSearchParams(searchParams);

    if (value === "todos" && key === "scope") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams);
  }

  function openTitle(id) {
    app.openTitle(id);
    navigate(`/detalle/${id}`);
  }

  return (
    <>
      <section className="panel-surface">
        <SectionHeading
          eyebrow="Categorías en lenguaje simple"
          title={selectedCollection.label}
          description={selectedCollection.description}
        />
        <OptionBar
          items={COLLECTIONS}
          activeId={activeCollection}
          onChange={(value) => updateParam("collection", value)}
          label="Colecciones"
        />
        <OptionBar
          items={SCOPE_OPTIONS}
          activeId={activeScope}
          onChange={(value) => updateParam("scope", value)}
          label="Tipo de contenido"
        />
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Resultados"
          title={`${filteredTitles.length} opciones visibles`}
          description="Todas muestran idioma, duración y subtítulos antes de entrar."
        />
        {filteredTitles.length ? (
          <div className="poster-grid">
            {filteredTitles.map((title) => (
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
              <h3>No encontramos títulos con ese filtro</h3>
              <p>Prueba otra combinación de categoría o tipo de contenido.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CircleHelp,
  Clock3,
  House,
  Play,
  Search,
  Settings2,
  Shapes,
} from "lucide-react";
import { HELP_TIPS } from "../data/catalog";
import { useAppModel } from "../lib/app-model";
import { useVoiceGuidance } from "../hooks/useVoiceGuidance";

const ROUTE_META = [
  {
    match: (path) => path === "/",
    title: "Inicio simplificado",
    description: "Tus caminos principales con menos ruido y más control.",
  },
  {
    match: (path) => path.startsWith("/categorias"),
    title: "Categorías claras",
    description: "Explora géneros, idioma y selecciones fáciles de reconocer.",
  },
  {
    match: (path) => path.startsWith("/buscar"),
    title: "Búsqueda asistida",
    description: "Encuentra por nombre, idioma o género sin pasos extra.",
  },
  {
    match: (path) => path.startsWith("/configuracion"),
    title: "Configuración senior",
    description: "Ajusta texto, movimiento, subtítulos y lectura por voz.",
  },
  {
    match: (path) => path.startsWith("/detalle"),
    title: "Detalle del contenido",
    description: "Título grande, contexto claro y acciones principales al frente.",
  },
  {
    match: (path) => path.startsWith("/reproducir"),
    title: "Reproducción guiada",
    description: "Control simple de pausa, audio y subtítulos.",
  },
];

const NAV_ITEMS = [
  { to: "/", label: "Inicio", icon: House },
  { to: "/categorias", label: "Categorías", icon: Shapes },
  { to: "/buscar", label: "Buscar", icon: Search },
  { to: "/configuracion", label: "Configuración", icon: Settings2 },
];

function NavigationItems({ mobile = false }) {
  return NAV_ITEMS.map(({ to, label, icon: Icon }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `${mobile ? "bottom-link" : "nav-link"} ${isActive ? "is-active" : ""}`
      }
      data-voice={label}
    >
      <Icon size={20} strokeWidth={2.2} />
      <span>{label}</span>
    </NavLink>
  ));
}

function HelpPanel({ onClose }) {
  return (
    <div className="help-panel" role="dialog" aria-modal="true" aria-label="Ayuda rápida">
      <div className="help-card">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">Ayuda</p>
            <h2>Cómo moverte sin perderte</h2>
            <p>Atajos simples basados en objetivos reales del proyecto.</p>
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={onClose}
            data-voice="Cerrar ayuda"
          >
            Cerrar
          </button>
        </div>
        <ul className="help-list">
          {HELP_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AppShell() {
  const app = useAppModel();
  const location = useLocation();
  const navigate = useNavigate();
  const routeMeta =
    ROUTE_META.find((item) => item.match(location.pathname)) ?? ROUTE_META[0];
  const [helpOpen, setHelpOpen] = app.helpState;

  useVoiceGuidance({
    enabled: app.settings.voiceGuidance,
    routeMessage: `${routeMeta.title}. ${routeMeta.description}`,
  });

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>
      <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <img src={app.logoImage} alt="Netflix Senior Mode" />
          <div className="brand-copy">
            <p className="section-eyebrow">Modo senior activo</p>
            <h1>Netflix Senior Mode</h1>
            <p>Menos estímulo. Más lectura. Más control sobre cada paso.</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <NavigationItems />
        </nav>

        <div className="support-panel">
          {app.lastOpenedTitle ? (
            <button
              type="button"
              className="resume-card"
              onClick={() => navigate(`/detalle/${app.lastOpenedTitle.id}`)}
              data-voice={`Volver a ${app.lastOpenedTitle.title}`}
            >
              <div>
                <p className="section-eyebrow">Último título abierto</p>
                <strong>{app.lastOpenedTitle.title}</strong>
                <span>
                  {app.lastOpenedTitle.progress > 0
                    ? `${Math.round(app.lastOpenedTitle.progress * 100)}% visto`
                    : "Aún no iniciado"}
                </span>
              </div>
              <span className="resume-icon" aria-hidden="true">
                <Play size={16} strokeWidth={2.4} />
              </span>
            </button>
          ) : null}
          <p className="section-eyebrow">Accesibilidad visible</p>
          <strong>Subtítulos automáticos</strong>
          <span>{app.settings.autoSubtitles ? "Activados" : "Desactivados"}</span>
          <strong>Lectura por voz</strong>
          <span>{app.settings.voiceGuidance ? "Activa" : "Silenciosa"}</span>
          <strong>Atajo</strong>
          <span>
            <Clock3 size={14} strokeWidth={2.2} /> Presiona <kbd>/</kbd> para buscar
          </span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-copy">
            {location.pathname !== "/" ? (
              <button
                type="button"
                className="back-button"
                onClick={handleBack}
                data-voice="Regresar"
              >
                <ArrowLeft size={18} strokeWidth={2.4} />
                <span>Regresar</span>
              </button>
            ) : null}
            <div>
              <p className="section-eyebrow">{routeMeta.title}</p>
              <h2>{routeMeta.description}</h2>
            </div>
          </div>
          <button
            type="button"
            className="help-button"
            onClick={() => setHelpOpen(true)}
            data-voice="Abrir ayuda"
          >
            <CircleHelp size={18} strokeWidth={2.2} />
            <span>Ayuda</span>
          </button>
        </header>

        <main className="screen" id="main-content">
          <Outlet />
        </main>

        <nav className="bottom-nav" aria-label="Navegación móvil">
          <NavigationItems mobile />
        </nav>
      </div>

      {helpOpen ? <HelpPanel onClose={() => setHelpOpen(false)} /> : null}
      </div>
    </>
  );
}

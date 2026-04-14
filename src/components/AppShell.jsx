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
import { formatProgress } from "../lib/copy";
import { useAppModel } from "../lib/app-model";
import { useVoiceGuidance } from "../hooks/useVoiceGuidance";

const ROUTE_META = [
  {
    match: (path) => path === "/",
    title: "Inicio",
    description: "Tus opciones principales, sin ruido.",
  },
  {
    match: (path) => path.startsWith("/categorias"),
    title: "Categorías",
    description: "Explora por tema, idioma o tipo.",
  },
  {
    match: (path) => path.startsWith("/buscar"),
    title: "Buscar",
    description: "Encuentra por título, idioma o género.",
  },
  {
    match: (path) => path.startsWith("/configuracion"),
    title: "Configuración",
    description: "Ajusta texto, movimiento, subtítulos y voz.",
  },
  {
    match: (path) => path.startsWith("/detalle"),
    title: "Detalle",
    description: "Resumen claro y acciones principales al frente.",
  },
  {
    match: (path) => path.startsWith("/reproducir"),
    title: "Reproducción",
    description: "Controles simples para pausar, audio y subtítulos.",
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
            <h2>Cómo usar la app</h2>
            <p>Atajos y acciones útiles para encontrar algo rápido.</p>
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
          <div className="sidebar-logo-anchor">
            <img
              className="sidebar-logo-anchor__img"
              src={app.logoImage}
              alt="Netflix Senior Mode"
            />
          </div>
          <div className="brand-card">
            <div className="brand-copy">
              <p className="section-eyebrow">Modo senior activo</p>
              <h1>Netflix Senior Mode</h1>
              <p>Menos ruido. Más claridad. Más control.</p>
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
                  <p className="section-eyebrow">Último título</p>
                  <strong>{app.lastOpenedTitle.title}</strong>
                  <span>
                    {app.lastOpenedTitle.progress > 0
                      ? formatProgress(app.lastOpenedTitle.progress)
                      : "Listo para empezar"}
                  </span>
                </div>
                <span className="resume-icon" aria-hidden="true">
                  <Play size={16} strokeWidth={2.4} />
                </span>
              </button>
            ) : null}
            <p className="section-eyebrow">Accesibilidad</p>
            <strong>Subtítulos automáticos</strong>
            <span>{app.settings.autoSubtitles ? "Activados" : "Desactivados"}</span>
            <strong>Lectura por voz</strong>
            <span>{app.settings.voiceGuidance ? "Activa" : "Desactivada"}</span>
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

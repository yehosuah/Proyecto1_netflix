import SectionHeading from "../components/SectionHeading";
import { useAppModel } from "../lib/app-model";

const TEXT_OPTIONS = [
  { id: "normal", label: "Normal", description: "Tamaño base" },
  { id: "grande", label: "Grande", description: "Lectura más cómoda" },
  { id: "extra", label: "Extra grande", description: "Máxima prioridad a legibilidad" },
];

const MOTION_OPTIONS = [
  { id: "suave", label: "Suave", description: "Transiciones cortas" },
  { id: "calmado", label: "Calmado", description: "Movimiento muy reducido" },
  { id: "minimo", label: "Mínimo", description: "Casi sin animación" },
];

function OptionGroup({ title, description, items, value, onChange }) {
  return (
    <section className="settings-group">
      <SectionHeading title={title} description={description} />
      <div className="option-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`settings-option ${value === item.id ? "is-active" : ""}`}
            onClick={() => onChange(item.id)}
            data-voice={`${item.label}. ${item.description}`}
          >
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ToggleRow({ title, description, checked, onChange, voiceLabel }) {
  return (
    <button
      type="button"
      className={`toggle-row ${checked ? "is-active" : ""}`}
      onClick={onChange}
      data-voice={voiceLabel}
    >
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <span className="toggle-pill" aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

export default function SettingsScreen() {
  const app = useAppModel();

  function previewVoice() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      "Netflix Senior Mode. Tu navegación está clara, calmada y lista para usar.",
    );
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <>
      <section className="panel-surface">
        <SectionHeading
          eyebrow="Configuración senior"
          title="Ajustes visibles y directos"
          description="Todo lo importante está aquí: tamaño, movimiento, subtítulos y guía por voz."
        />
      </section>

      <OptionGroup
        title="Tamaño de texto"
        description="Cambia la escala general de lectura en toda la interfaz."
        items={TEXT_OPTIONS}
        value={app.settings.textScale}
        onChange={(value) => app.updateSettings({ textScale: value })}
      />

      <OptionGroup
        title="Nivel de animación"
        description="Reduce movimiento para una experiencia más tranquila."
        items={MOTION_OPTIONS}
        value={app.settings.motionLevel}
        onChange={(value) => app.updateSettings({ motionLevel: value })}
      />

      <section className="settings-group">
        <SectionHeading
          title="Ayudas activables"
          description="Pensadas para lectura, orientación y control sin depender de otra persona."
        />
        <div className="toggle-grid">
          <ToggleRow
            title="Subtítulos automáticos"
            description="Activa subtítulos al entrar a reproducción."
            checked={app.settings.autoSubtitles}
            onChange={() =>
              app.updateSettings({ autoSubtitles: !app.settings.autoSubtitles })
            }
            voiceLabel={
              app.settings.autoSubtitles
                ? "Desactivar subtítulos automáticos"
                : "Activar subtítulos automáticos"
            }
          />
          <ToggleRow
            title="Lectura por voz"
            description="Lee encabezados y botones cuando navegas con teclado."
            checked={app.settings.voiceGuidance}
            onChange={() =>
              app.updateSettings({ voiceGuidance: !app.settings.voiceGuidance })
            }
            voiceLabel={
              app.settings.voiceGuidance
                ? "Desactivar lectura por voz"
                : "Activar lectura por voz"
            }
          />
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={previewVoice}
          data-voice="Probar lectura por voz"
        >
          Probar lectura por voz
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={app.clearSearchHistory}
          data-voice="Borrar historial de búsqueda"
        >
          Borrar historial de búsqueda
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={app.resetExperience}
          data-voice="Restablecer experiencia"
        >
          Restablecer experiencia
        </button>
      </section>
    </>
  );
}

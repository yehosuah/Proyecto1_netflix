import { useEffect, useMemo, useRef, useState } from "react";
import { Captions, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import SectionHeading from "../components/SectionHeading";
import { useAppModel } from "../lib/app-model";

function formatClock(totalSeconds) {
  const safeValue = Math.max(0, Math.floor(totalSeconds));
  const minutes = String(Math.floor(safeValue / 60)).padStart(2, "0");
  const seconds = String(safeValue % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function PlayerScreen() {
  const { id } = useParams();
  const app = useAppModel();
  const title = app.getTitleById(id);
  const savedPlayback = app.getPlaybackById(id);
  const totalSeconds = (title?.runtimeMinutes ?? 30) * 60;
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.min(savedPlayback.lastPosition ?? totalSeconds * (title?.progress ?? 0), totalSeconds),
  );
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(
    savedPlayback.subtitlesEnabled ?? app.settings.autoSubtitles,
  );
  const [audioOn, setAudioOn] = useState(savedPlayback.audioOn ?? true);
  const lastSavedRef = useRef(elapsedSeconds);
  const currentValuesRef = useRef({
    elapsedSeconds,
    subtitlesEnabled,
    audioOn,
  });

  const progress = Math.min(elapsedSeconds / totalSeconds, 0.999);
  const currentCaption = useMemo(() => {
    if (!title?.captions?.length) {
      return "";
    }

    return title.captions[Math.floor(elapsedSeconds / 6) % title.captions.length];
  }, [elapsedSeconds, title]);

  useEffect(() => {
    currentValuesRef.current = {
      elapsedSeconds,
      subtitlesEnabled,
      audioOn,
    };
  }, [audioOn, elapsedSeconds, subtitlesEnabled]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((currentValue) => Math.min(currentValue + 1, totalSeconds));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, totalSeconds]);

  useEffect(() => {
    if (!title) {
      return undefined;
    }

    return () => {
      const currentValue = currentValuesRef.current;
      app.updatePlayback(title.id, {
        progress: Math.min(currentValue.elapsedSeconds / totalSeconds, 0.999),
        lastPosition: currentValue.elapsedSeconds,
        subtitlesEnabled: currentValue.subtitlesEnabled,
        audioOn: currentValue.audioOn,
      });
    };
  }, [app, title, totalSeconds]);

  useEffect(() => {
    if (Math.abs(elapsedSeconds - lastSavedRef.current) < 15 || !title) {
      return;
    }

    lastSavedRef.current = elapsedSeconds;
    app.updatePlayback(title.id, {
      progress,
      lastPosition: elapsedSeconds,
      subtitlesEnabled,
      audioOn,
    });
  }, [app, audioOn, elapsedSeconds, progress, subtitlesEnabled, title]);

  if (!title) {
    return <Navigate to="/" replace />;
  }

  function persistPlayback(nextPatch = {}) {
    const nextElapsed = nextPatch.elapsedSeconds ?? elapsedSeconds;
    const nextSubtitles = nextPatch.subtitlesEnabled ?? subtitlesEnabled;
    const nextAudio = nextPatch.audioOn ?? audioOn;

    lastSavedRef.current = nextElapsed;
    app.updatePlayback(title.id, {
      progress: Math.min(nextElapsed / totalSeconds, 0.999),
      lastPosition: nextElapsed,
      subtitlesEnabled: nextSubtitles,
      audioOn: nextAudio,
    });
  }

  return (
    <>
      <section className="player-screen">
        <div
          className="player-stage"
          style={{ backgroundImage: `url(${title.image})` }}
        >
          <div className="player-mask">
            <SectionHeading
              eyebrow="Reproducción"
              title={title.title}
              description={`${title.language} · ${title.duration} · ${title.subtitles}`}
            />
            <p className="player-description">{title.synopsis}</p>
            <div className="player-progress">
              <div className="progress-wrap progress-wrap--large" aria-hidden="true">
                <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
              </div>
              <div className="player-time">
                <span>{formatClock(elapsedSeconds)}</span>
                <span>{formatClock(totalSeconds)}</span>
              </div>
            </div>
            <div className="player-controls">
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setIsPlaying((value) => {
                    const nextValue = !value;

                    if (!nextValue) {
                      persistPlayback();
                    }

                    return nextValue;
                  })
                }
                data-voice={isPlaying ? "Pausar reproducción" : "Reanudar reproducción"}
              >
                {isPlaying ? <Pause size={18} strokeWidth={2.4} /> : <Play size={18} strokeWidth={2.4} />}
                {isPlaying ? "Pausar" : "Reanudar"}
              </button>
              <button
                type="button"
                className={`secondary-button ${audioOn ? "" : "secondary-button--active"}`}
                onClick={() => {
                  const nextAudio = !audioOn;
                  setAudioOn(nextAudio);
                  persistPlayback({ audioOn: nextAudio });
                }}
                data-voice={audioOn ? "Silenciar audio" : "Activar audio"}
              >
                {audioOn ? (
                  <Volume2 size={18} strokeWidth={2.2} />
                ) : (
                  <VolumeX size={18} strokeWidth={2.2} />
                )}
                {audioOn ? "Silenciar" : "Activar audio"}
              </button>
              <button
                type="button"
                className={`secondary-button ${subtitlesEnabled ? "secondary-button--active" : ""}`}
                onClick={() => {
                  const nextSubtitles = !subtitlesEnabled;
                  setSubtitlesEnabled(nextSubtitles);
                  persistPlayback({ subtitlesEnabled: nextSubtitles });
                }}
                data-voice={
                  subtitlesEnabled ? "Desactivar subtítulos" : "Activar subtítulos"
                }
              >
                <Captions size={18} strokeWidth={2.2} />
                {subtitlesEnabled ? "Desactivar subtítulos" : "Activar subtítulos"}
              </button>
            </div>
            {subtitlesEnabled ? (
              <div className="caption-band" aria-live="polite">
                {currentCaption}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

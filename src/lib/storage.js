const STORAGE_KEY = "netflix-senior-mode:v1";

export const DEFAULT_SETTINGS = {
  textScale: "grande",
  motionLevel: "calmado",
  autoSubtitles: true,
  voiceGuidance: false,
};

export function createDefaultState() {
  return {
    version: 1,
    favorites: [],
    searchHistory: [],
    recentTitleId: "roma",
    playback: {
      roma: {
        progress: 0.34,
        lastPosition: 2754,
        subtitlesEnabled: true,
        audioOn: true,
        updatedAt: Date.now() - 1000 * 60 * 60 * 12,
      },
      "our-planet": {
        progress: 0.58,
        lastPosition: 1670,
        subtitlesEnabled: true,
        audioOn: true,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24,
      },
      "grace-frankie": {
        progress: 0.16,
        lastPosition: 310,
        subtitlesEnabled: true,
        audioOn: true,
        updatedAt: Date.now() - 1000 * 60 * 60 * 36,
      },
    },
    settings: DEFAULT_SETTINGS,
  };
}

export function readStoredState() {
  const defaultState = createDefaultState();

  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return defaultState;
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      ...defaultState,
      ...parsedValue,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsedValue.settings ?? {}),
      },
      favorites: Array.isArray(parsedValue.favorites)
        ? parsedValue.favorites
        : defaultState.favorites,
      searchHistory: Array.isArray(parsedValue.searchHistory)
        ? parsedValue.searchHistory.slice(0, 6)
        : defaultState.searchHistory,
      playback:
        parsedValue.playback && typeof parsedValue.playback === "object"
          ? parsedValue.playback
          : defaultState.playback,
    };
  } catch (error) {
    console.warn("No se pudo leer el estado guardado.", error);
    return defaultState;
  }
}

export function writeStoredState(state) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("No se pudo guardar el estado.", error);
  }
}

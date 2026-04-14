import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import logoImage from "../logo.jpeg";
import AppShell from "./components/AppShell";
import { CATALOG_TITLES } from "./data/catalog";
import { AppModelProvider } from "./lib/app-model";
import { createDefaultState, readStoredState, writeStoredState } from "./lib/storage";
import CategoriesScreen from "./screens/CategoriesScreen";
import DetailScreen from "./screens/DetailScreen";
import HomeScreen from "./screens/HomeScreen";
import PlayerScreen from "./screens/PlayerScreen";
import SearchScreen from "./screens/SearchScreen";
import SettingsScreen from "./screens/SettingsScreen";

const FONT_SCALE_MAP = {
  normal: "1",
  grande: "1.1",
  extra: "1.22",
};

function hydrateTitle(baseTitle, storedState) {
  const playback = storedState.playback[baseTitle.id] ?? {};

  return {
    ...baseTitle,
    isFavorite: storedState.favorites.includes(baseTitle.id),
    progress: playback.progress ?? 0,
    subtitlesEnabled:
      playback.subtitlesEnabled ?? storedState.settings.autoSubtitles,
  };
}

function byRecentPlayback(a, b, playback) {
  const left = playback[a.id]?.updatedAt ?? 0;
  const right = playback[b.id]?.updatedAt ?? 0;
  return right - left;
}

function matchesScope(title, scope) {
  return scope === "todos" ? true : title.mediaType === scope;
}

function getFallbackRecommendedTitles(titles) {
  return titles.filter((title) => title.collections.includes("familia")).slice(0, 6);
}

function getTitlesByCollection(titles, collectionId) {
  return titles.filter((title) => title.collections.includes(collectionId));
}

export default function App() {
  const [storedState, setStoredState] = useState(() => readStoredState());
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    writeStoredState(storedState);
  }, [storedState]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--font-scale",
      FONT_SCALE_MAP[storedState.settings.textScale] ?? FONT_SCALE_MAP.grande,
    );
    root.dataset.motion = storedState.settings.motionLevel;
  }, [storedState.settings.motionLevel, storedState.settings.textScale]);

  const titles = CATALOG_TITLES.map((title) => hydrateTitle(title, storedState));
  const continueWatching = titles
    .filter((title) => title.progress > 0 && title.progress < 0.98)
    .sort((left, right) => byRecentPlayback(left, right, storedState.playback))
    .slice(0, 4);
  const favoriteTitles = titles.filter((title) => title.isFavorite);
  const recommendedBase = titles
    .filter(
      (title) =>
        title.collections.includes("espanol") ||
        title.collections.includes("historias-reales"),
    )
    .slice(0, 6);
  const recommended = recommendedBase.length
    ? recommendedBase
    : getFallbackRecommendedTitles(titles);
  const spanishPicks = getTitlesByCollection(titles, "espanol").slice(0, 6);
  const shortSessionPicks = titles
    .filter((title) => title.runtimeMinutes <= 45)
    .slice(0, 6);
  const realStoriesPicks = getTitlesByCollection(titles, "historias-reales").slice(0, 6);
  const familyPicks = getTitlesByCollection(titles, "familia").slice(0, 6);
  const documentaryPicks = getTitlesByCollection(titles, "documentales").slice(0, 6);
  const favoriteCollections = new Set(favoriteTitles.flatMap((title) => title.collections));
  const basedOnFavorites = titles
    .filter(
      (title) =>
        !title.isFavorite &&
        title.collections.some((collection) => favoriteCollections.has(collection)),
    )
    .slice(0, 6);
  const lastOpenedTitle =
    titles.find((title) => title.id === storedState.recentTitleId) ??
    continueWatching[0] ??
    recommended[0] ??
    null;

  function getTitleById(id) {
    return titles.find((title) => title.id === id) ?? null;
  }

  function getPlaybackById(id) {
    return storedState.playback[id] ?? {};
  }

  function getTitlesForCollection(collectionId, scope = "todos") {
    return titles.filter(
      (title) => title.collections.includes(collectionId) && matchesScope(title, scope),
    );
  }

  function updateStoredState(updater) {
    setStoredState((currentValue) => updater(currentValue));
  }

  const appModel = {
    logoImage,
    titles,
    continueWatching,
    favoriteTitles,
    recommended,
    spanishPicks,
    shortSessionPicks,
    realStoriesPicks,
    familyPicks,
    documentaryPicks,
    basedOnFavorites,
    lastOpenedTitle,
    searchHistory: storedState.searchHistory,
    settings: storedState.settings,
    helpState: [helpOpen, setHelpOpen],
    getTitleById,
    getPlaybackById,
    getTitlesForCollection,
    openTitle(id) {
      updateStoredState((currentValue) => ({
        ...currentValue,
        recentTitleId: id,
      }));
    },
    toggleFavorite(id) {
      updateStoredState((currentValue) => {
        const nextFavorites = currentValue.favorites.includes(id)
          ? currentValue.favorites.filter((favoriteId) => favoriteId !== id)
          : [...currentValue.favorites, id];

        return {
          ...currentValue,
          favorites: nextFavorites,
          recentTitleId: id,
        };
      });
    },
    saveSearch(query) {
      const normalizedQuery = query.trim();

      if (!normalizedQuery) {
        return;
      }

      updateStoredState((currentValue) => ({
        ...currentValue,
        searchHistory: [
          { query: normalizedQuery, timestamp: Date.now() },
          ...currentValue.searchHistory.filter(
            (item) => item.query.toLowerCase() !== normalizedQuery.toLowerCase(),
          ),
        ].slice(0, 6),
      }));
    },
    clearSearchHistory() {
      updateStoredState((currentValue) => ({
        ...currentValue,
        searchHistory: [],
      }));
    },
    updateSettings(patch) {
      updateStoredState((currentValue) => ({
        ...currentValue,
        settings: {
          ...currentValue.settings,
          ...patch,
        },
      }));
    },
    updatePlayback(id, patch) {
      updateStoredState((currentValue) => {
        const previousPlayback = currentValue.playback[id] ?? {};

        return {
          ...currentValue,
          recentTitleId: id,
          playback: {
            ...currentValue.playback,
            [id]: {
              ...previousPlayback,
              ...patch,
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    resetExperience() {
      setStoredState(createDefaultState());
      setHelpOpen(false);
    },
  };

  return (
    <AppModelProvider value={appModel}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<HomeScreen />} />
            <Route path="categorias" element={<CategoriesScreen />} />
            <Route path="buscar" element={<SearchScreen />} />
            <Route path="configuracion" element={<SettingsScreen />} />
            <Route path="detalle/:id" element={<DetailScreen />} />
            <Route path="reproducir/:id" element={<PlayerScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppModelProvider>
  );
}

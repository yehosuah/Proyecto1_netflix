export const LIST_LABEL = "Mi lista";

const MEDIA_TYPE_LABELS = {
  pelicula: "Película",
  serie: "Serie",
  documental: "Documental",
};

export function formatCount(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatProgress(progress) {
  return `${Math.round(progress * 100)}% visto`;
}

export function getListActionLabel(isSaved) {
  return isSaved ? `Quitar de ${LIST_LABEL}` : `Guardar en ${LIST_LABEL}`;
}

export function getListVoiceLabel(title, isSaved) {
  return isSaved
    ? `Quitar ${title} de ${LIST_LABEL}`
    : `Guardar ${title} en ${LIST_LABEL}`;
}

export function getMediaTypeLabel(mediaType) {
  return MEDIA_TYPE_LABELS[mediaType] ?? mediaType;
}

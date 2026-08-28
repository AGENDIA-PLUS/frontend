/**
 * Formatea una duración en minutos como texto legible ("6 h", "1 h 30 min",
 * "45 min") — evita mostrar totales de minutos crudos (ej. "360 min") que
 * obligan a hacer la conversión mental, especialmente molesto para
 * servicios largos como sesiones de tatuaje de varias horas.
 */
export function formatDurationMin(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

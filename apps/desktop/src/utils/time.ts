import { formatDistanceToNow, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: zhCN });
  } catch {
    return "";
  }
}

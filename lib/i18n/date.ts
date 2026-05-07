import { es, ptBR } from "date-fns/locale";

export function getDateLocale(language: string = "es-PY") {
  return language.startsWith("pt") ? ptBR : es;
}

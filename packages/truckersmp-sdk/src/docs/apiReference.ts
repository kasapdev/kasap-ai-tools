export interface ApiReferenceEntry {
  id: string;
  method: "GET";
  path: string;
  summary: string;
  notes?: string;
}

/** Compact reference for the TruckersMP endpoints this SDK wraps. Source of
 * truth for both the static context embedded in askApiDocs()'s system prompt
 * and the chunks indexed into RAG via indexApiDocs(). Base URL:
 * https://api.truckersmp.com/v2 - full spec: https://docs.truckersmp.com/web-api/ */
export const API_REFERENCE: ApiReferenceEntry[] = [
  {
    id: "servers",
    method: "GET",
    path: "/servers",
    summary: "Tüm TruckersMP sunucularını ve anlık durumlarını (online mı, oyuncu/kuyruk sayısı) listeler.",
  },
  {
    id: "player",
    method: "GET",
    path: "/player/{id}",
    summary: "SteamID64 veya TruckersMP ID ile oyuncu bilgisi getirir (VTC üyeliği, ban durumu, başarımlar dahil).",
    notes:
      "Bulunamayan bir ID'de HTTP 200 döner ama gövdede error:true olur - SDK bunu otomatik " +
      "TruckersMpNotFoundError olarak fırlatır, ham gövdeyi veri gibi döndürmez.",
  },
  {
    id: "bans",
    method: "GET",
    path: "/bans/{id}",
    summary: "Bir oyuncunun en fazla 5 en son banını getirir.",
  },
  {
    id: "vtc",
    method: "GET",
    path: "/vtc/{id}",
    summary: "Bir Virtual Trucking Company (VTC) hakkında detaylı bilgi getirir (üye sayısı, doğrulanmış mı, vb.).",
  },
  {
    id: "game_time",
    method: "GET",
    path: "/game_time",
    summary: "Oyun içi anlık saati (dakika cinsinden) döner.",
  },
  {
    id: "version",
    method: "GET",
    path: "/version",
    summary: "ETS2/ATS için güncel TruckersMP istemci sürümünü ve desteklenen oyun sürümünü döner.",
    notes: "Diğer endpoint'lerin aksine yanıt bir `response` sarmalayıcısı içinde gelmez, alanlar doğrudan köktedir.",
  },
  {
    id: "events",
    method: "GET",
    path: "/events",
    summary: "Öne çıkan (featured), bugünkü, şu an gerçekleşen ve yaklaşan etkinlikleri listeler.",
  },
  {
    id: "event_detail",
    method: "GET",
    path: "/events/{id}",
    summary: "Belirli bir etkinliğin tüm detaylarını (güzergah, katılım sayıları, VTC) getirir.",
  },
];

export function formatApiReferenceAsText(): string {
  return API_REFERENCE.map(
    (entry) => `- ${entry.method} ${entry.path} - ${entry.summary}${entry.notes ? ` Not: ${entry.notes}` : ""}`,
  ).join("\n");
}

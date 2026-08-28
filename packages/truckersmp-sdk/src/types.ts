export interface TruckersMpServer {
  id: number;
  game: "ETS2" | "ATS";
  ip: string;
  port: number;
  name: string;
  shortname: string;
  online: boolean;
  players: number;
  queue: number;
  maxplayers: number;
  mapid: number;
  displayorder: number;
  speedlimiter: 0 | 1;
  collisions: boolean;
  carsforplayers: boolean;
  policecarsforplayers: boolean;
  afkenabled: boolean;
  event: boolean;
  specialEvent: boolean;
  promods: boolean;
  syncdelay: number;
}

export interface TruckersMpPatreonInfo {
  isPatron: boolean;
  active: boolean;
  color?: string;
  tierId?: number;
  currentPledge?: string;
  lifetimePledge?: string;
  nextPledge?: string;
  hidden?: boolean;
}

export interface TruckersMpPermissions {
  isStaff: boolean;
  isManagement: boolean;
  isGameAdmin: boolean;
  showDetailedOnWebMaps: boolean;
}

export interface TruckersMpPlayerVtc {
  id: number;
  name: string;
  tag: string;
  inVTC: boolean;
  memberID: number;
}

export interface TruckersMpAchievement {
  id: number;
  title: string;
  description: string;
  image_url: string;
  achieved_at: string;
}

export interface TruckersMpAward {
  id: number;
  name: string;
  image_url: string;
  awarded_at: string;
}

export interface TruckersMpPlayer {
  id: number;
  name: string;
  avatar: string;
  smallAvatar: string;
  joinDate: string;
  /** SteamID64 as returned by the API - kept as `number` to match the wire
   * shape, but prefer the `steamID` string field for anything that needs to
   * round-trip exactly (SteamID64 values exceed Number.MAX_SAFE_INTEGER). */
  steamID64: number;
  steamID: string;
  discordSnowflake: string | null;
  displayVTCHistory: boolean;
  groupName: string;
  groupColor: string;
  groupID: number;
  banned: boolean;
  bannedUntil: string | null;
  bansCount: number | null;
  displayBans: boolean;
  patreon: TruckersMpPatreonInfo;
  permissions: TruckersMpPermissions;
  vtc: TruckersMpPlayerVtc;
  vtcHistory: unknown[] | null;
  achievements: TruckersMpAchievement[] | null;
  awards: TruckersMpAward[] | null;
}

export interface TruckersMpBan {
  expiration: string;
  timeAdded: string;
  active: boolean;
  reason: string;
  adminName: string;
  adminID: number;
}

export interface TruckersMpVtcSocials {
  twitter?: string;
  facebook?: string;
  twitch?: string;
  discord?: string;
  youtube?: string;
}

export interface TruckersMpVtc {
  id: number;
  name: string;
  owner_id: number;
  owner_username: string;
  slogan: string;
  tag: string;
  logo: string;
  cover: string;
  information: string;
  rules: string;
  requirements: string;
  website?: string;
  socials?: TruckersMpVtcSocials;
  games: { ats: boolean; ets: boolean };
  dlcs?: Record<string, string>;
  members_count: number;
  recruitment: "Open" | "Close";
  language: string;
  verified: boolean;
  validated: boolean;
  created: string;
}

export interface TruckersMpVersion {
  name: string;
  numeric: string;
  stage: string;
  ets2mp_checksum: { dll: string; adb: string };
  atsmp_checksum: { dll: string; adb: string };
  time: string;
  supported_game_version: string;
  supported_ats_game_version: string;
}

export interface TruckersMpEventServerRef {
  id: number;
  name: string;
}

export interface TruckersMpEventLocation {
  location: string;
  city: string;
}

export interface TruckersMpEventTypeRef {
  key: "convoy" | "truck_show" | "truck_show_and_convoy";
  name: string;
}

export interface TruckersMpEventVtcRef {
  id: number;
  name: string;
}

export interface TruckersMpEventUserRef {
  id: number;
  username: string;
}

export interface TruckersMpEventIndex {
  id: number;
  name: string;
  slug: string;
  game: string;
  server: TruckersMpEventServerRef;
  start_at: string;
  banner: string;
  featured: string;
}

export interface TruckersMpEventsIndexResponse {
  featured: TruckersMpEventIndex[];
  today: TruckersMpEventIndex[];
  now: TruckersMpEventIndex[];
  upcoming: TruckersMpEventIndex[];
}

export interface TruckersMpEventAttendances {
  confirmed: number;
  unsure: number;
  vtcs: number;
  confirmed_users: unknown[];
  confirmed_vtcs: unknown[];
  unsure_users: unknown[];
}

export interface TruckersMpEvent {
  id: number;
  event_type: TruckersMpEventTypeRef;
  name: string;
  slug: string;
  game: string;
  server: TruckersMpEventServerRef;
  language: string;
  departure: TruckersMpEventLocation;
  arrive: TruckersMpEventLocation;
  meetup_at?: string;
  start_at: string;
  banner: string;
  map?: string;
  description: string;
  rule?: string;
  voice_link?: string;
  external_link?: string;
  featured: string;
  vtc?: TruckersMpEventVtcRef;
  user: TruckersMpEventUserRef;
  attendances: TruckersMpEventAttendances;
  dlcs: Record<string, string>;
  url: string;
  created_at: string;
  updated_at: string;
}

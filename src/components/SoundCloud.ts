/** https://developers.soundcloud.com/docs/api/html5-widget */

export type Widget = {
  bind<Value extends EventValue>(
    event: Value,
    callback: EventCallback<Value>,
  ): void;
  unbind(event: EventValue): void;
  load(url: string, options?: LoadOptions): void;

  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(ms: number): void;
  setVolume(volume: number): void;
  next(): void;
  prev(): void;
  skip(index: number): void;

  getVolume(callback: (volume: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
  getPosition(callback: (position: number) => void): void;
  getSounds(callback: (sounds: Sound[]) => void): void;
  getCurrentSound(callback: (sound: Sound) => void): void;
  getCurrentSoundIndex(callback: (index: number) => void): void;
  isPaused(callback: (paused: boolean) => void): void;
};

type LoadOptions = {
  callback?(): void;
  [param: string]: unknown;
};

export type AudioEvents = {
  LOAD_PROGRESS: "loadProgress";
  PLAY_PROGRESS: "playProgress";
  PLAY: "play";
  PAUSE: "pause";
  FINISH: "finish";
  SEEK: "seek";
};
export type AudioEventKey = keyof AudioEvents;
export type AudioEventValue = AudioEvents[AudioEventKey];
export type AudioEventCallback = (data: AudioData) => void;
export type AudioData = {
  relativePosition: number;
  loadProgress: number;
  currentPosition: number;
};

export type UIEvents = {
  READY: "ready";
  CLICK_DOWNLOAD: "downloadClicked";
  CLICK_BUY: "buyClicked";
  OPEN_SHARE_PANEL: "sharePanelOpened";
  ERROR: "error";
};

export type UIEventKey = keyof UIEvents;
export type UIEventValue = UIEvents[UIEventKey];
export type UIEventCallback = () => void;

export type EventKey = AudioEventKey | UIEventKey;
export type EventValue = AudioEventValue | UIEventValue;
export type Events = AudioEvents & UIEvents;
export type EventCallback<Value extends EventValue> =
  Value extends AudioEventValue ? AudioEventCallback : UIEventCallback;

export type Sound = {
  artwork_url?: string;
  caption?: null;
  commentable?: boolean;
  comment_count?: number;
  created_at?: Date;
  description?: string;
  downloadable?: boolean;
  download_count?: number;
  duration?: number;
  full_duration?: number;
  embeddable_by?: string;
  genre?: string;
  has_downloads_left?: boolean;
  id?: number;
  kind?: string;
  label_name?: null;
  last_modified?: Date;
  license?: string;
  likes_count?: number;
  permalink?: string;
  permalink_url?: string;
  playback_count?: number;
  public?: boolean;
  publisher_metadata?: PublisherMetadata;
  purchase_title?: null;
  purchase_url?: null;
  release_date?: null;
  reposts_count?: number;
  secret_token?: null;
  sharing?: string;
  state?: string;
  streamable?: boolean;
  tag_list?: string;
  title?: string;
  uri?: string;
  urn?: string;
  user_id?: number;
  visuals?: null;
  waveform_url?: string;
  display_date?: Date;
  media?: Media;
  station_urn?: string;
  station_permalink?: string;
  track_authorization?: string;
  monetization_model?: string;
  policy?: string;
  user?: User;
  playable?: boolean;
  _resource_id?: number;
  _resource_type?: string;
};

export type Media = {
  transcodings?: Transcoding[];
};

export type Transcoding = {
  url?: string;
  preset?: string;
  duration?: number;
  snipped?: boolean;
  format?: Format;
  quality?: string;
  is_legacy_transcoding?: boolean;
};

export type Format = {
  protocol?: string;
  mime_type?: string;
};

export type PublisherMetadata = {
  id?: number;
  urn?: string;
  artist?: string;
  album_title?: string;
  contains_music?: boolean;
};

export type User = {
  avatar_url?: string;
  first_name?: string;
  followers_count?: number;
  full_name?: string;
  id?: number;
  kind?: string;
  last_modified?: Date;
  last_name?: string;
  permalink?: string;
  permalink_url?: string;
  uri?: string;
  urn?: string;
  username?: string;
  verified?: boolean;
  city?: string;
  country_code?: string;
  badges?: Badges;
  station_urn?: string;
  station_permalink?: string;
};

export type Badges = {
  pro?: boolean;
  creator_mid_tier?: boolean;
  pro_unlimited?: boolean;
  verified?: boolean;
};

declare global {
  interface Window {
    SC?: {
      Widget: {
        (element: string | HTMLIFrameElement): Widget;
        Events: Events;
      };
    };
  }
}

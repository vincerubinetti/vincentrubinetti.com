import type {
  SoundcloudAudioData,
  SoundcloudEvents,
  SoundcloudTrack,
  SoundcloudWidget,
} from "soundcloud.ts";

export type AudioData = SoundcloudAudioData;
export type Widget = SoundcloudWidget;
export type Sound = SoundcloudTrack;
export type Events = SoundcloudEvents;

export type Track = Partial<
  SoundcloudTrack & {
    waveform: {
      raw: { x: number; y: number }[];
      smoothed: { x: number; y: number }[];
    };
    tags: string[];
    colors: number[][];
  }
>;

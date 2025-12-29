import type { FunctionalComponent } from "vue";
import Apple from "@/images/logos/apple.svg?component";
import Bandcamp from "@/images/logos/bandcamp.svg?component";
import SoundCloud from "@/images/logos/soundcloud.svg?component";
import Spotify from "@/images/logos/spotify.svg?component";
import Steam from "@/images/logos/steam.svg?component";
import YouTube from "@/images/logos/youtube.svg?component";

/** get color based on icon */
export const getColor = (icon: FunctionalComponent) => {
  switch (icon) {
    case Bandcamp:
      return "hover:text-teal-500";
    case Apple:
      return "hover:text-rose-500";
    case Spotify:
      return "hover:text-green-500";
    case SoundCloud:
      return "hover:text-orange-500";
    case YouTube:
      return "hover:text-red-500";
    case Steam:
      return "hover:text-sky-500";
    default:
      return "";
  }
};

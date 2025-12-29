/** get color based on icon */
export const getColor = (icon: string) => {
  switch (icon) {
    case "Bandcamp":
      return "hover:text-teal-500";
    case "Apple":
      return "hover:text-rose-500";
    case "Spotify":
      return "hover:text-green-500";
    case "SoundCloud":
      return "hover:text-orange-500";
    case "YouTube":
      return "hover:text-red-500";
    case "Steam":
      return "hover:text-sky-500";
    default:
      return "";
  }
};

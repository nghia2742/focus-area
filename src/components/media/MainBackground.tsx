import Image from "next/image";

/** Full-bleed artwork used as the default background (setup + quiet sessions). */
export function MainBackground() {
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      <Image
        src="/setup/main_bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="object-cover"
      />
      <div className="scrim absolute inset-0" />
      <div className="noise absolute inset-0 opacity-[0.05] mix-blend-overlay" />
    </div>
  );
}

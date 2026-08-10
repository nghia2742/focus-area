/** Full-bleed artwork used as the default background (setup + quiet sessions). */
export function MainBackground() {
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed decorative background */}
      <img
        src="/setup/main_bg.png"
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
      />
      <div className="scrim absolute inset-0" />
      <div className="noise absolute inset-0 opacity-[0.05] mix-blend-overlay" />
    </div>
  );
}

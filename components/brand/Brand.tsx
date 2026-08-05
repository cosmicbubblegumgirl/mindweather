import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export function Brand({ compact = false, href = "/", light = true }: { compact?: boolean; href?: string; light?: boolean }) {
  return (
    <Link href={href} className={clsx("brand", compact && "brand--compact", !light && "brand--ink")} aria-label="MindWeather home">
      <Image src="/mindweather-mark.svg" alt="" width={48} height={48} priority />
      {!compact && (
        <span className="brand__type">
          <strong>MINDWEATHER</strong>
          <small>Study for the brain you have today</small>
        </span>
      )}
    </Link>
  );
}

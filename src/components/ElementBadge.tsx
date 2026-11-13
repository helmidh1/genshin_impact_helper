"use client";

import { useState } from "react";
import {
  Droplets,
  Flame,
  Leaf,
  Mountain,
  Snowflake,
  Wind,
  Zap,
} from "lucide-react";
import { ELEMENT_THEMES } from "@/lib/elements";
import type { ElementType } from "@/types/genshin";

export function ElementIcon({
  element,
  className = "w-3.5 h-3.5",
}: {
  element: ElementType;
  className?: string;
}) {
  switch (element) {
    case "Pyro":
      return <Flame className={className} />;
    case "Hydro":
      return <Droplets className={className} />;
    case "Electro":
      return <Zap className={className} />;
    case "Cryo":
      return <Snowflake className={className} />;
    case "Dendro":
      return <Leaf className={className} />;
    case "Anemo":
      return <Wind className={className} />;
    case "Geo":
      return <Mountain className={className} />;
  }
}

export function ElementBadge({
  element,
  compact = false,
}: {
  element: ElementType;
  compact?: boolean;
}) {
  const theme = ELEMENT_THEMES[element];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-mono uppercase tracking-wider font-semibold ${theme.bgClass} ${theme.borderClass} ${theme.textClass} ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
      }`}
    >
      <ElementIcon element={element} className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {element}
    </span>
  );
}

export function CharacterAvatar({
  name,
  element,
  iconUrl,
  size = "md",
}: {
  name: string;
  element: ElementType;
  iconUrl?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const theme = ELEMENT_THEMES[element];
  const sizeClass =
    size === "lg"
      ? "w-16 h-16 rounded-lg"
      : size === "sm"
        ? "w-10 h-10 rounded-md"
        : "w-12 h-12 rounded-md";

  return (
    <div
      className={`relative ${sizeClass} bg-[#0a0e18] border ${theme.borderClass} flex items-center justify-center overflow-hidden shrink-0`}
    >
      {iconUrl && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={iconUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className={theme.textClass}>
          <ElementIcon
            element={element}
            className={size === "lg" ? "w-8 h-8" : size === "sm" ? "w-5 h-5" : "w-6 h-6"}
          />
        </span>
      )}
    </div>
  );
}

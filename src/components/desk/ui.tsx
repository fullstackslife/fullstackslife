import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { moneyLine, stationById, type StationId } from "@/lib/stack/catalog";

export function Btn({
  children,
  onClick,
  kind = "solid",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "solid" | "ghost" | "quiet";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const look =
    kind === "solid"
      ? "bg-brass text-ink hover:bg-paper"
      : kind === "ghost"
        ? "border border-line bg-transparent text-paper hover:border-brass"
        : "text-mute hover:text-paper";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-40 ${look}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-mute">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-line bg-ink px-3 text-paper outline-none placeholder:text-mute"
      />
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-mute">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-md border border-line bg-ink px-3 py-3 text-paper outline-none placeholder:text-mute"
      />
    </label>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-md border border-line bg-panel p-4 ${className}`}>{children}</section>;
}

export function StationHead({ id }: { id: StationId }) {
  const station = stationById(id);
  return (
    <header className="mb-6">
      <p className="text-sm tabular-nums text-brass">{station.index}</p>
      <h1 className="font-display text-4xl leading-none text-paper">{station.name}</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-paper">{station.line}</p>
      {station.ask > 0 ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-mute">{moneyLine(station)}</p> : null}
    </header>
  );
}

export function Go({ station, children }: { station: StationId; children: ReactNode }) {
  return (
    <Link to="/" search={{ station }} className="text-brass">
      {children}
    </Link>
  );
}

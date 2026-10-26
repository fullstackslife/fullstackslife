import { useState } from "react";
import { JOBS, PLANS, type PlanId, type StationId } from "@/lib/stack/catalog";
import { useDesk } from "@/lib/stack/store";

const STEPS = 3;

export function Setup() {
  const completeSetup = useDesk((s) => s.completeSetup);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [jobs, setJobs] = useState<StationId[]>(JOBS.map((station) => station.id));
  const [plan, setPlan] = useState<PlanId>("desk");

  return (
    <div className="flex min-h-dvh flex-col bg-ink px-5 py-8 text-paper">
      <p className="text-sm tabular-nums text-brass">
        {step + 1} of {STEPS}
      </p>
      {step === 0 ? (
        <>
          <h1 className="mt-4 font-display text-4xl leading-none">Name the workspace</h1>
          <p className="mt-3 text-sm text-mute">This is the account. Nothing is filled in for you.</p>
          <input
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            placeholder="Workspace"
            className="mt-8 h-12 rounded-md border border-line bg-transparent px-3 text-lg text-paper outline-none placeholder:text-mute"
          />
        </>
      ) : null}
      {step === 1 ? (
        <>
          <h1 className="mt-4 font-display text-4xl leading-none">Turn on the jobs</h1>
          <p className="mt-3 text-sm text-mute">Only these show up after setup.</p>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {JOBS.map((station) => {
              const on = jobs.includes(station.id);
              return (
                <li key={station.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setJobs((current) =>
                        on ? current.filter((id) => id !== station.id) : [...current, station.id],
                      )
                    }
                    className="flex min-h-14 w-full items-center justify-between gap-3 text-left"
                  >
                    <span>
                      <span className="block text-paper">{station.name}</span>
                      <span className="block text-sm text-mute">{station.line}</span>
                    </span>
                    <span className={on ? "text-brass" : "text-mute"}>{on ? "On" : "Off"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <h1 className="mt-4 font-display text-4xl leading-none">Pick a plan</h1>
          <p className="mt-3 text-sm text-mute">Billed monthly. You can start on either.</p>
          <div className="mt-8 grid gap-3">
            {PLANS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlan(item.id)}
                className={`rounded-lg border p-4 text-left ${
                  plan === item.id ? "border-brass bg-paper text-ink" : "border-line text-paper"
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-2xl">{item.name}</span>
                  <span className="tabular-nums">${item.price}/mo</span>
                </span>
                <span className={`mt-2 block text-sm ${plan === item.id ? "text-ink/70" : "text-mute"}`}>
                  {item.line} {item.seats} seats.
                </span>
              </button>
            ))}
          </div>
        </>
      ) : null}
      <div className="mt-auto flex gap-3 pt-8">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="min-h-12 rounded-md border border-line px-4 text-sm"
          >
            Back
          </button>
        ) : null}
        <button
          type="button"
          disabled={step === 0 ? name.trim().length === 0 : step === 1 ? jobs.length === 0 : false}
          onClick={() => {
            if (step < 2) {
              setStep((current) => current + 1);
              return;
            }
            const chosen = PLANS.find((item) => item.id === plan) ?? PLANS[0];
            completeSetup({ name: name.trim(), jobs, plan: chosen.id });
          }}
          className="min-h-12 flex-1 rounded-md bg-brass text-sm font-medium text-ink disabled:opacity-40"
        >
          {step === 2 ? "Start" : "Continue"}
        </button>
      </div>
    </div>
  );
}

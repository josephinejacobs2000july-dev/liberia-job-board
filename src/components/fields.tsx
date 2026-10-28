import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="req">required</span>}
      </label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

/** A hidden box that people never see; spam bots fill it in, and those submissions are ignored. */
export function SpamTrap() {
  return (
    <div className="trap" aria-hidden="true">
      <label htmlFor="website">Leave this empty</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function Options({ values, blank }: { values: string[]; blank?: string }) {
  return (
    <>
      {blank !== undefined && <option value="">{blank}</option>}
      {values.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </>
  );
}

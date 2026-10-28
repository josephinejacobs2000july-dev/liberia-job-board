"use client";

// A form wired to a server action, with a "Saving…" state and an error or success message.
// It submits with startTransition instead of <form action>, because React resets typed-in
// fields after every form action, which would wipe the form when there is a mistake to fix.
import { startTransition, useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import type { ActionState } from "@/lib/forms";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  tone,
  small,
  confirmLabel,
  className,
  hideOnSuccess,
}: {
  action: Action;
  children?: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  tone?: "ghost" | "neutral" | "danger";
  small?: boolean;
  /** When set, the first tap arms the button and shows this text; the second tap submits. */
  confirmLabel?: string;
  className?: string;
  /** Replace the form with the success message (used after sending an application). */
  hideOnSuccess?: boolean;
}) {
  const [state, run, pending] = useActionState<ActionState, FormData>(action, undefined);
  const [armed, setArmed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  if (hideOnSuccess && state?.message && !state.error) {
    return (
      <p className="ok" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      className={className ?? "form"}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        if (confirmLabel && !armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        const data = new FormData(e.currentTarget);
        startTransition(() => run(data));
      }}
    >
      {children}
      {state?.error && (
        <p className="err" role="alert">
          {state.error}
        </p>
      )}
      {state?.message && !state.error && (
        <p className="ok" role="status">
          {state.message}
        </p>
      )}
      <div className="actions">
        <button
          type="submit"
          disabled={pending}
          className={["btn", tone, small ? "sm" : ""].filter(Boolean).join(" ")}
        >
          {pending ? pendingLabel : armed && confirmLabel ? confirmLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

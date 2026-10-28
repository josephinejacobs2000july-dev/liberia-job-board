"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="empty">
      <strong>Something went wrong</strong>
      <p>The job board could not load this page. Check your internet connection and try again.</p>
      <button type="button" className="btn" onClick={reset}>
        Try again
      </button>
    </div>
  );
}

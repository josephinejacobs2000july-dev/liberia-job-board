import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty">
      <strong>Page not found</strong>
      <p>This vacancy may have been removed, or the link is wrong.</p>
      <Link href="/" className="btn">
        See all open jobs
      </Link>
    </div>
  );
}

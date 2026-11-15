import Link from "next/link";
import { headers } from "next/headers";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Page Not Found | Set Life Casting",
};

export default async function NotFound() {
  // Render per request instead of prebuilding one 404 page. A prebuilt 404 is
  // rendered for the placeholder path "/_not-found", so the layout's
  // breadcrumbs (which read the pathname) came out as "Home > _not Found" on
  // the server and as the real URL in the browser: a hydration error on every
  // unknown URL. Reading the request makes the server render the real path.
  await headers();

  return (
    <div className="min-h-[70vh] bg-linear-to-br from-purple-100 via-pink-50 to-blue-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-linear-to-br from-white to-purple-50/30 rounded-2xl p-8 md:p-10 border-2 border-accent shadow-[0_0_30px_rgba(95,101,196,0.15)]">
        <h1
          className="text-3xl md:text-4xl font-bold text-secondary mb-3"
          style={{ fontFamily: "var(--font-galindo)" }}
        >
          Page Not Found
        </h1>
        <p
          className="text-base text-secondary-light mb-8"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          We couldn&apos;t find the page you were looking for. It may have moved, or the link may be out of date.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
          <Link href="/casting">
            <Button variant="outline">Current Castings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

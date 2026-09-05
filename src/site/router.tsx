// Compatibility shim that lets the gradelead marketing-site components
// (written for react-router-dom) run inside the TanStack Router app.
// It maps Link / useLocation / useParams to their TanStack equivalents and
// routes the "Get Started" CTA to the app's sign-in page (/auth).
import {
  Link as TanStackLink,
  useLocation,
  useParams as useTanStackParams,
  useNavigate,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

export { useLocation, useNavigate };

// react-router's useParams() takes no arguments and returns the params of the
// nearest matched route. TanStack v1's hook requires an options object, so we
// wrap it with `strict: false` to read the nearest match's params.
export function useParams() {
  return useTanStackParams({ strict: false });
}

// <Link> from react-router-dom accepts `to`, `className`, children, onClick, etc.
// TanStack's Link accepts `to` too, so most usages just work. We special-case the
// CTA: react-router's /get-started page is the app's /auth sign-in page here, and
// hash links like "/#blogs" need to be split into `to` + `hash` for TanStack.
export function Link({
  to,
  hash,
  className,
  children,
  onClick,
  ...rest
}: {
  to: string;
  hash?: string;
  className?: string;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: unknown;
}) {
  // Split "/path#section" into path + hash for TanStack.
  let path = to;
  let anchor = hash;
  const hashIdx = path.indexOf("#");
  if (hashIdx !== -1) {
    anchor = path.slice(hashIdx + 1);
    path = path.slice(0, hashIdx) || "/";
  }

  // "Get Started" CTA on the marketing site points at the app's sign-in page.
  const target = path === "/get-started" ? "/auth" : path;

  return (
    <TanStackLink
      to={target}
      hash={anchor}
      className={className}
      onClick={onClick}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </TanStackLink>
  );
}

import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 2.5a2.5 2.5 0 0 0-5 0V6h5V2.5z" />
      <path d="M12 18H8a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4" />
      <path d="M12 18h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4" />
      <path d="M18 10h-2.5" />
      <path d="M8.5 10H6" />
      <path d="M12 10v8" />
      <path d="M14.5 21a2.5 2.5 0 0 0 5 0V18h-5v3z" />
      <path d="M9.5 21a2.5 2.5 0 0 1-5 0V18h5v3z" />
    </svg>
  );
}

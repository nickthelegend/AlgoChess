import type { SVGProps } from "react"

export function ChessIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m14 5-5 8h7l-5 8" />
      <path d="M10 3 8 5h7l-2-2Z" />
      <path d="M14 3h-4v1h4V3Z" />
      <path d="M13 9h-2v1h2V9Z" />
    </svg>
  )
}

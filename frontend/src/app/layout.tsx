import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoSched — AI-Powered Task Scheduler",
  description:
    "An autonomous personal productivity agent that analyzes tasks, reasons about urgency and effort, and generates optimal daily schedules using AI.",
  keywords: [
    "task scheduler",
    "AI planner",
    "productivity",
    "autonomous agent",
    "time management",
  ],
  authors: [{ name: "Yuvraj" }],
  openGraph: {
    title: "AutoSched — AI-Powered Task Scheduler",
    description:
      "Autonomous productivity agent that plans your day intelligently.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}

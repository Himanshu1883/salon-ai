import type { Metadata } from "next";
import { DownloadPageContent } from "@/components/landing-v2/marketing/download/download-page";

export const metadata: Metadata = {
  title: "Download App | Go Tix",
  description:
    "Install Go Tix on iPhone, Android, or desktop. Add to home screen for a native app experience — billing, appointments, and clients on the go.",
  openGraph: {
    title: "Download Go Tix App",
    description:
      "Install Go Tix on your phone — salon billing, appointments, and clients in your pocket.",
    url: "https://www.gotix.io/download",
  },
};

export default function DownloadPage() {
  return <DownloadPageContent />;
}

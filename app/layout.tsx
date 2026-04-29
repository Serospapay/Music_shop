import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Октава | Музичний магазин",
    template: "%s | Октава",
  },
  description:
    "Каталог музичних інструментів і студійного обладнання: гітари, клавішні, ударні, мікрофони та аксесуари. Ціни в гривнях, оформлення замовлення на сайті.",
  openGraph: {
    title: "Октава | Музичний магазин",
    description:
      "Каталог музичних інструментів і студійного обладнання з цінами в гривнях та оформленням замовлення онлайн.",
    type: "website",
    locale: "uk_UA",
    url: "/",
    siteName: "Октава",
    images: [
      {
        url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80",
        width: 1600,
        height: 900,
        alt: "Октава — музичні інструменти та обладнання",
      },
    ],
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="uk">
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} min-h-screen font-sans text-zinc-100 antialiased`}
      >
        <div className="relative z-[1] flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster
          richColors
          theme="dark"
          position="top-center"
          toastOptions={{
            className:
              "border border-brand-500/25 bg-surface-900/95 text-zinc-100 shadow-[0_14px_36px_rgba(0,0,0,0.45)] backdrop-blur",
            classNames: {
              title: "text-sm font-semibold",
              description: "text-xs text-zinc-300",
            },
          }}
        />
      </body>
    </html>
  );
}

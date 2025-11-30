import { Fira_Code as FontMono, Inter as FontSans, Jomhuria as FontJomhuria, Judson as FontJudson } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fontJomhuria = FontJomhuria({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-jomhuria",
});

export const fontJudson = FontJudson({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-judson",
});
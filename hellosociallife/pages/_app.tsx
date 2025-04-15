import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
  <div className= "bg-blue-900">
     <Component {...pageProps} />
  </div>
 

);
}

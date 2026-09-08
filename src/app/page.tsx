import { ThemeProvider } from "@/components/marketintel/ThemeContext";
import BackdropFX from "@/components/marketintel/BackdropFX";
import Navbar from "@/components/marketintel/Navbar";
import Hero from "@/components/marketintel/Hero";
import Indices from "@/components/marketintel/Indices";
import MarketWrap from "@/components/marketintel/MarketWrap";
import IntelFeed from "@/components/marketintel/IntelFeed";
import IpoTracker from "@/components/marketintel/IpoTracker";
import Flows from "@/components/marketintel/Flows";
import Topics from "@/components/marketintel/Topics";
import Pipeline from "@/components/marketintel/Pipeline";
import Newsletter from "@/components/marketintel/Newsletter";
import Footer from "@/components/marketintel/Footer";
import Cursor from "@/components/marketintel/Cursor";

export default function Home() {
  return (
    <ThemeProvider>
      <div className="relative flex min-h-screen flex-col text-foreground transition-colors duration-500">
        <BackdropFX />
        <Cursor />
        <Navbar />
        <main className="flex-1">
          <Hero />
          <Indices />
          <MarketWrap />
          <IntelFeed />
          <IpoTracker />
          <Flows />
          <Topics />
          <Pipeline />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

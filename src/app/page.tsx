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

/** Site-wide cinematic backdrop — drifting aurora glows, dot grid, film grain. */
function BackdropFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora aurora-gold" />
      <div className="aurora aurora-violet" />
      <div className="aurora aurora-emerald" />
      <div className="dot-grid absolute inset-0 opacity-[0.22] [mask-image:radial-gradient(ellipse_at_50%_0%,black_5%,transparent_55%)]" />
      <div className="noise-layer absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#05070d]/80 to-transparent" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
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
  );
}

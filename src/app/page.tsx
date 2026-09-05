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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#05070d] text-foreground">
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

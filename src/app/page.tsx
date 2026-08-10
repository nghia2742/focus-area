import { SiteHeader } from "@/components/layout/SiteHeader";
import { HomeView } from "@/components/home/HomeView";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <HomeView />
      </main>
    </div>
  );
}

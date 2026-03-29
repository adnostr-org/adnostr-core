import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";
import { GlobalAdsLayout } from "./pages/GlobalAds/GlobalAdsLayout";
import { GlobalAdsDashboard } from "./pages/GlobalAds/GlobalAdsDashboard";
import { GoogleAdsConsole } from "./pages/GlobalAds/platforms/GoogleAdsConsole";
import { MetaAdsConsole } from "./pages/GlobalAds/platforms/MetaAdsConsole";
import { AmazonAdsConsole } from "./pages/GlobalAds/platforms/AmazonAdsConsole";
import { OpenAdsConsole } from "./pages/GlobalAds/platforms/OpenAdsConsole";
import { DemoDataConsole } from "./pages/GlobalAds/platforms/DemoDataConsole";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        
        {/* Global Ads Console Routes */}
        <Route path="/global-ads" element={<GlobalAdsLayout />}>
          <Route index element={<GlobalAdsDashboard />} />
          <Route path="google" element={<GoogleAdsConsole />} />
          <Route path="meta" element={<MetaAdsConsole />} />
          <Route path="amazon" element={<AmazonAdsConsole />} />
          <Route path="openads" element={<OpenAdsConsole />} />
          <Route path="demo" element={<DemoDataConsole />} />
        </Route>
        
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
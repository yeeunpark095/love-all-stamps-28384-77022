import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Map from "./pages/Map";
import Stamps from "./pages/Stamps";
import Exhibitions from "./pages/Exhibitions";
import Performances from "./pages/Performances";
import MyStamps from "./pages/MyStamps";
import Admin from "./pages/Admin";
import LuckyDrawPresent from "./pages/LuckyDrawPresent";
import Festival from "./pages/Festival";
import BoothMap from "./pages/BoothMap";
import StampBoard from "./pages/StampBoard";
import MapCalibrator from "./pages/admin/MapCalibrator";
import Progress from "./pages/admin/Progress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/festival" element={<Festival />} />
          <Route path="/map" element={<Map />} />
          <Route path="/booth-map" element={<BoothMap />} />
          <Route path="/stamp-board" element={<StampBoard />} />
          <Route path="/stamps" element={<Stamps />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/performances" element={<Performances />} />
          <Route path="/my-stamps" element={<MyStamps />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/progress" element={<Progress />} />
          <Route path="/admin/map-calibrator" element={<MapCalibrator />} />
          <Route path="/admin/lucky-draw/present" element={<LuckyDrawPresent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

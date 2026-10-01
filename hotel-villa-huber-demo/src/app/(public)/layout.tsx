import { SiteHeader } from "@/components/layout/SiteHeader";
import { MeasurementControls } from "@/features/measurement/MeasurementControls";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="tartalom" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <MeasurementControls gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""} pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ""} />
    </>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAds } from "@/lib/ads";
import { AdsManager } from "./AdsManager";

export const metadata = { title: "Ads — Admin Portal" };

export default async function AdminAdsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") redirect("/admin");
  return <AdsManager initial={await getAds()} />;
}

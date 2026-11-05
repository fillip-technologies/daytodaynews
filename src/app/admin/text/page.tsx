import { getSiteTextOverrides } from "@/lib/settings";
import { TextManager } from "./TextManager";

export const metadata = {
  title: "Site Text — Admin Portal",
};

export default async function AdminTextPage() {
  return <TextManager overrides={await getSiteTextOverrides()} />;
}

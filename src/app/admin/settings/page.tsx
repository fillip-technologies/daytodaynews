import { redirect } from "next/navigation";

// Site Configuration held the hero stories, which are now part of Admin → Homepage.
export default function AdminSettingsPage() {
  redirect("/admin/homepage");
}

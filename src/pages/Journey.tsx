import { Compass } from "lucide-react";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";

export default function Journey() {
  return (
    <PlaceholderExperience
      icon={Compass}
      title="Your Journey is still forming."
      message="This is where the continuity of your actions will become visible over time. It isn't ready yet — nothing here is missing, it just hasn't arrived."
    />
  );
}

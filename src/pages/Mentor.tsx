import { MessageSquare } from "lucide-react";
import { PlaceholderExperience } from "@/components/shared/PlaceholderExperience";

export default function Mentor() {
  return (
    <PlaceholderExperience
      icon={MessageSquare}
      title="Your Mentor isn't here yet."
      message="Its role will be to help you understand what your progress means — never to decide it for you. This is on its way."
    />
  );
}

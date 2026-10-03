import type { LucideProps } from "lucide-react";
import { CHALLENGE_ICONS, type ChallengeIconName } from "@/content/icons";

export function ChallengeIcon({ name, ...props }: { name: ChallengeIconName } & LucideProps) {
  const Icon = CHALLENGE_ICONS[name];
  return <Icon {...props} />;
}

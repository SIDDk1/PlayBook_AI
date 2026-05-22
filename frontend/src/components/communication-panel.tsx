import { MailPlus } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CommunicationPanel({
  message,
  heading = "Client Communication",
  description = "AI-generated communication draft",
}: {
  message?: string;
  heading?: string;
  description?: string;
}) {
  return (
    <Card className="bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailPlus className="size-4 text-primary" />
          {heading}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4 text-sm leading-7 text-foreground/85">
          {message?.trim()
            ? message
            : "Once a scenario is analyzed, the advisor-facing client message will appear here in strict JSON-derived form."}
        </div>
      </CardContent>
    </Card>
  );
}

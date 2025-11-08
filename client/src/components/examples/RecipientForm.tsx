import RecipientForm from "../RecipientForm";
import { Card } from "@/components/ui/card";

export default function RecipientFormExample() {
  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <RecipientForm
        onSubmit={(data) => console.log("Form submitted:", data)}
        onCancel={() => console.log("Form cancelled")}
      />
    </Card>
  );
}

import { useState } from "react";
import Header from "../Header";

export default function HeaderExample() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div>
      <Header
        upcomingEventsCount={3}
        onToggleTheme={() => setIsDark(!isDark)}
        isDark={isDark}
      />
      <div className="p-8 text-center text-muted-foreground">
        <p>Scroll to see the sticky header effect</p>
      </div>
    </div>
  );
}

import DashboardHero from "../DashboardHero";

export default function DashboardHeroExample() {
  return (
    <DashboardHero
      userName="Maria"
      stats={{
        totalRecipients: 12,
        upcomingEvents: 3,
        giftsPurchased: 28,
      }}
      onCreateRecipient={() => console.log("Create recipient clicked")}
      onExploreSuggestions={() => console.log("Explore suggestions clicked")}
    />
  );
}

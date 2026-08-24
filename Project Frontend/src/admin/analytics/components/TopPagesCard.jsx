import { BarListCard } from "./TopActionsCard";

const PAGES = [
  { label: "/", sessions: 40 },
  { label: "/products/smartphone-x", sessions: 30 },
  { label: "/products/laptop-pro", sessions: 20 },
  { label: "/products/wireless-earbuds", sessions: 15 },
  { label: "/cart", sessions: 12 },
  { label: "/checkout", sessions: 8 },
  { label: "/account/orders", sessions: 6 },
  { label: "/products/smartwatch", sessions: 5 },
  { label: "/support", sessions: 2 },
  { label: "/blog/latest-tech-trends", sessions: 10 },
  { label: "/promotions/summer-sale", sessions: 9 },
  { label: "/about-us", sessions: 7 },
];

export default function TopPagesCard() {
  return <BarListCard title="Top pages by traffic" filterLabel="All pages" rows={PAGES} />;
}

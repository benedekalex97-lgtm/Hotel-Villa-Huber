import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export default function NotFound() {
  return (
    <main id="tartalom" className="hvh-container" style={{ minHeight: "70vh", display: "grid", placeContent: "center", gap: "1.5rem", textAlign: "center", justifyItems: "center" }}>
      <Wordmark width={180} />
      <h1 style={{ fontSize: "var(--hvh-fs-h2)" }}>Ez az oldal nem található.</h1>
      <p className="hvh-lead">A keresett cím nem létezik vagy nem nyilvános.</p>
      <Link className="hvh-btn" href="/">
        Vissza a kezdőlapra
      </Link>
    </main>
  );
}

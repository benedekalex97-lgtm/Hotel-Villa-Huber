import { getMedia } from "@/content/media";
import { MediaImage } from "@/components/media/MediaImage";
import type { Offer } from "./model";
import { SampleBadge } from "./DemoNotice";
import styles from "./BookingFlow.module.css";

interface OfferListProps {
  offers: readonly Offer[];
  selectedId: string | null;
  onSelect: (offerId: string) => void;
}

/** Elhelyezési ajánlatok fotóval. Minden tétel mintaadat-jelvényt kap, ha `demo`. Árat nem mutatunk. */
export function OfferList({ offers, selectedId, onSelect }: OfferListProps) {
  return (
    <ul className={styles.offers}>
      {offers.map((offer) => {
        const selected = offer.id === selectedId;
        return (
          <li key={offer.id} className={styles.offer} data-selected={selected ? "true" : undefined}>
            <MediaImage
              asset={getMedia(offer.mediaId)}
              ratio="landscape"
              sizes="(min-width: 1024px) 260px, (min-width: 640px) 240px, calc(100vw - 4rem)"
              className={styles.offerImage}
            />
            <div className={styles.offerBody}>
              <div className={styles.offerHead}>
                <h3>{offer.title}</h3>
                {offer.demo ? <SampleBadge /> : null}
              </div>
              <p>{offer.description}</p>
              <p className={styles.offerMeta}>
                {offer.demo ? "Minta: " : ""}legfeljebb {offer.maxGuests} vendég szobánként
                {offer.priceNote ? ` · ${offer.priceNote}` : ""}
              </p>
              <div className={styles.offerAction}>
                <button
                  type="button"
                  className={selected ? "hvh-btn" : "hvh-btn hvh-btn--secondary"}
                  onClick={() => onSelect(offer.id)}
                  aria-label={`${selected ? "Folytatás ezzel" : "Kiválasztás"}: ${offer.title}`}
                >
                  {selected ? "Kiválasztva — folytatás" : "Kiválasztom"}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

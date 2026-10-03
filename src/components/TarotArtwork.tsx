import { cardImage, getCard, CATEGORY_CARDS, type CardId } from '../lib/cards'
import type { CATEGORY_CONFIG } from '../lib/tarot-data'

export function TarotArtwork({ cardId }: { cardId: CardId }) {
  const card = getCard(cardId)
  return <figure className="tarot-artwork">
    <img src={cardImage(cardId)} alt={`${card.ko} 카드 일러스트`} width={640} height={960} />
    <figcaption className="card-number" aria-label={`메이저 아르카나 ${card.number}`}>{card.number}</figcaption>
  </figure>
}

export function TarotPoster({ cat, selected, onClick }: { cat: typeof CATEGORY_CONFIG[number]; selected: boolean; onClick: () => void }) {
  return <button type="button" className={`tarot-poster ${selected ? 'selected' : ''}`} aria-label={cat.name} aria-pressed={selected} onClick={onClick}>
    <div className="poster-image"><img src={cardImage(CATEGORY_CARDS[cat.name])} alt="" width={640} height={960} loading="eager" /><span className="poster-tag">{cat.tag}</span>{selected && <span className="poster-check" aria-hidden="true">✓</span>}</div>
    <div className="poster-title"><h2 className="font-serif-kr">{cat.name}</h2><p>{cat.mood}</p></div>
  </button>
}

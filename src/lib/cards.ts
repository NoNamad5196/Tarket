import type { Category, TarotResult } from './tarot-data.ts'

export const CARDS = [
  { id: 'fool', number: '0', name: 'The Fool', ko: '바보', keywords: '시작과 용기', meaning: '완벽한 준비보다 작은 첫걸음에서 가능성을 발견해보세요.' },
  { id: 'magician', number: 'I', name: 'The Magician', ko: '마법사', keywords: '능력과 실현', meaning: '이미 가진 도구와 경험을 연결하면 생각이 구체적인 모습이 될 수 있어요.' },
  { id: 'high-priestess', number: 'II', name: 'The High Priestess', ko: '여사제', keywords: '통찰과 내면', meaning: '잠시 조용히 관찰하며 아직 말로 표현하지 못한 마음을 살펴보세요.' },
  { id: 'empress', number: 'III', name: 'The Empress', ko: '여황제', keywords: '돌봄과 풍요', meaning: '자신을 돌보는 여유가 일상과 관계에 따뜻함을 더해줄 수 있어요.' },
  { id: 'emperor', number: 'IV', name: 'The Emperor', ko: '황제', keywords: '질서와 책임', meaning: '지킬 수 있는 기준 하나를 세우면 복잡한 상황을 정리하기 쉬워져요.' },
  { id: 'hierophant', number: 'V', name: 'The Hierophant', ko: '교황', keywords: '배움과 전통', meaning: '혼자 답을 찾기 어렵다면 믿을 만한 경험과 기본 원칙을 참고해보세요.' },
  { id: 'lovers', number: 'VI', name: 'The Lovers', ko: '연인', keywords: '연결과 선택', meaning: '상대의 마음을 단정하기보다 자신의 진심과 중요하게 여기는 가치를 확인해보세요.' },
  { id: 'chariot', number: 'VII', name: 'The Chariot', ko: '전차', keywords: '방향과 추진력', meaning: '서로 다른 마음을 한 방향으로 모으면 다음 걸음이 조금 더 선명해져요.' },
  { id: 'strength', number: 'VIII', name: 'Strength', ko: '힘', keywords: '인내와 다정함', meaning: '억지로 밀어붙이는 힘보다 차분하게 기다리는 태도가 도움이 될 수 있어요.' },
  { id: 'hermit', number: 'IX', name: 'The Hermit', ko: '은둔자', keywords: '집중과 성찰', meaning: '바깥의 속도와 잠시 거리를 두고 자신에게 필요한 답을 찾아보세요.' },
  { id: 'wheel-of-fortune', number: 'X', name: 'Wheel of Fortune', ko: '운명의 수레바퀴', keywords: '변화와 흐름', meaning: '통제할 수 없는 변화는 인정하고 지금 조정할 수 있는 작은 일을 찾아보세요.' },
  { id: 'justice', number: 'XI', name: 'Justice', ko: '정의', keywords: '균형과 판단', meaning: '느낌과 확인된 사실을 나누어 살피면 더 균형 잡힌 선택을 할 수 있어요.' },
  { id: 'hanged-man', number: 'XII', name: 'The Hanged Man', ko: '매달린 사람', keywords: '멈춤과 관점', meaning: '잠깐 멈추어 다른 각도에서 바라보면 놓치고 있던 길이 보일 수 있어요.' },
  { id: 'death', number: 'XIII', name: 'Death', ko: '죽음', keywords: '마무리와 전환', meaning: '이 카드는 실제 죽음의 예고가 아니라 끝맺음과 새 출발의 상징이에요. 필요 없어진 습관 하나를 놓아보세요.' },
  { id: 'temperance', number: 'XIV', name: 'Temperance', ko: '절제', keywords: '조화와 회복', meaning: '한쪽으로 치우친 시간과 에너지를 조금씩 나누며 편안한 균형을 찾아보세요.' },
  { id: 'devil', number: 'XV', name: 'The Devil', ko: '악마', keywords: '집착과 자각', meaning: '이 카드는 불행의 예고가 아니라 나를 붙잡는 습관을 알아차리라는 상징이에요.' },
  { id: 'tower', number: 'XVI', name: 'The Tower', ko: '탑', keywords: '전환과 재정비', meaning: '이 카드는 사고의 예고가 아니에요. 당연하다고 여겼던 방식을 점검하고 더 나은 토대를 만들어보세요.' },
  { id: 'star', number: 'XVII', name: 'The Star', ko: '별', keywords: '희망과 회복', meaning: '작은 회복의 순간을 알아차려보세요. 서두르지 않아도 가능성은 천천히 자라날 수 있어요.' },
  { id: 'moon', number: 'XVIII', name: 'The Moon', ko: '달', keywords: '직관과 불확실함', meaning: '마음에 떠오른 느낌을 존중하되 중요한 판단은 사실을 확인한 뒤 내려보세요.' },
  { id: 'sun', number: 'XIX', name: 'The Sun', ko: '태양', keywords: '활기와 명확함', meaning: '오늘 이미 잘하고 있는 일을 발견하고 그 밝은 에너지를 작은 행동으로 옮겨보세요.' },
  { id: 'judgement', number: 'XX', name: 'Judgement', ko: '심판', keywords: '성찰과 새 출발', meaning: '지나온 선택을 비난 없이 돌아보며 지금 다시 시작할 수 있는 일을 찾아보세요.' },
  { id: 'world', number: 'XXI', name: 'The World', ko: '세계', keywords: '완성과 연결', meaning: '작게라도 마무리한 일을 인정하고 다음 이야기를 위한 여백을 만들어보세요.' },
] as const

export type Card = typeof CARDS[number]
export type CardId = Card['id']
export const cardImage = (id: CardId | 'card-back') => `/assets/tarot/${id}.webp`
export const getCard = (id: CardId) => CARDS.find(card => card.id === id)!
export const CATEGORY_CARDS: Record<Category, CardId> = {
  '오늘의 운세': 'sun', '연애운': 'lovers', '금전운': 'wheel-of-fortune',
  '공부운': 'hermit', '인간관계운': 'star', '개발운': 'magician',
}

const DEMO_ADVICE: Record<Category, string> = {
  '오늘의 운세': '오늘 꼭 하고 싶은 작은 일 한 가지를 적고, 충분히 쉬는 시간도 남겨두세요.',
  '연애운': '상대의 반응을 예측하기보다 부담 없는 안부와 솔직한 마음을 전해보세요.',
  '금전운': '최근 지출을 살피고 필요한 것과 잠시 갖고 싶은 것을 구분해보세요.',
  '공부운': '25분 동안 한 주제에 집중한 뒤, 이해한 내용을 자신의 말로 정리해보세요.',
  '인간관계운': '대화 중에는 답을 서두르지 말고 상대의 이야기를 한 번 더 들어보세요.',
  '개발운': '작은 변경 하나를 끝내고 실행 결과를 확인한 뒤 다음 단계로 넘어가세요.',
}

export function demoReading(card: Card, category: Category): TarotResult {
  return {
    card: card.name, cardKo: card.ko, keywords: card.keywords,
    title: `${card.ko}, 오늘을 바라보는 작은 힌트`, summary: card.meaning,
    detail: `${card.keywords}의 상징을 ${category}에 비추어보세요. 정해진 미래를 맞히기보다 지금의 마음과 선택을 돌아보는 시간으로 활용하면 좋아요. 오늘 한 가지를 바꿀 수 있다면 무엇을 고르고 싶은가요?`,
    advice: DEMO_ADVICE[category], caution: '카드의 상징만으로 중요한 결정을 내리지 말고, 자신의 상황과 확인된 사실을 함께 살펴보세요.', luck: '잠시 멈춰 마시는 따뜻한 차',
  }
}

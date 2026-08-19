# Admin Home — Figma structure (cached from Vw0w5hdsZiizzK9NH4IPSq / 14431:86817)

Screen: 1920x1604, bg #EDEDF4

Layout: sidebar (280, white) + content (1640). Content padding -> inner 1400x1508.

## Header: Frame 2131331230 (1400x40) — breadcrumb/title area


## Section 1: Основные (1400x706)

- Heading TEXT "Основные" 14px/400 #0E0E27

- Grid container 1400x676. Layout:

  - Row1 (3 stat cards, 344x178 each):

    1. "Заказы сегодня" (+ info icon) — 344x178, white, r18

    2. "Пользователей (квартал)" + "Подробнее"(blue #2F7CF7 14/600) — 344x178

    3. "Клиенты (месяц)" + "Подробнее" — 344x178

  - Row2:

    - Chart card "График заказов за 30 дней" 1048x480: header + 8 legend items (110x70) + 30 bars (32x294) + date footer

    - Right column 344x676:

      a. Card 344x536 (white, r18) + "Подробнее"

      b. Card 344x124 (white, r18)


## Section 2: Дополнительные (1400x630)

- Heading TEXT "Дополнительные" 14px/400 #0E0E27

- 3 cards row (456x600 each, white, r18):

  1. + "Подробнее"
  2. + "Подробнее"
  3. + "Подробнее" + "На линии 16"


## Card anatomy (stat card)

- padding 12, header row: title(12/400 #0E0E27) + info icon (18x18)

- content: mini bars / value blocks

- "Подробнее" link: #2F7CF7, 14px/600

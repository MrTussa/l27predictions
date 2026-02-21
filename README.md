# L27 | Чемпионат прогнозов Формулы 1

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3-black?logo=payloadcms)](https://payloadcms.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb&logoColor=white)](https://mongodb.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js)](https://threejs.org)

> Сайт с прогнозами по Формуле и таблицей лидеров

![preview](public/og-image.jpg)

**L27** — платформа для прогнозов на гонки Формулы 1. Перед каждым этапом пользователи выбирают тройку призёров, зарабатывают очки за точность и соревнуются в общей таблице чемпионата. Сайт: **[limonov27.ru](https://limonov27.ru)**

---

## Возможности

- **Прогнозы** — выбор подиума (1–3 место) с DND
- **Таблица лидеров** — рейтинг участников с пагинацией и накопленными очками
- **Статистика** — история гонок, серии, процент точных прогнозов, персональные графики
- **Профили** — страница пользователя c обширной статистикой
- **События** — Прогнозы, квизы и многое другое с наградами в виде валюты сайта
- **Трансляция** — Одновременный просмотр трансляции с Твича и ВК (Twitch комментатор/ВК трансляция гонки)
- **CMS** — полное управление данными через Payload CMS (гонки, пилоты, команды, результаты)
- **3D-визуализация** — Трассы на Three.js

---

## Стек

| Frontend | Next.js 15 App Router, React 19, TypeScript |
| Styling | TailwindCSS 4, Geist Font, Radix UI |
| Backend / CMS | Payload CMS 3, Next.js API Routes |
| База данных | MongoDB |
| Хранилище | S3 |
| 3D | Three.js, @react-three/fiber |

---

## Локальный запуск

```bash
git clone https://github.com/your-username/limonov.git
cd limonov
npm install
cp .env.example .env   # заполнить переменные
npm dev
```

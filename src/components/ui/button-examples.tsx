/**
 * Примеры использования Button компонента в футуристичном F1 стиле
 *
 * Этот файл показывает все доступные варианты кнопок.
 * Удалите этот файл после того, как ознакомитесь с примерами.
 */

import { Button } from './button'
import {
  IconTrophy,
  IconArrowRight,
  IconPlus,
  IconX,
  IconTrash,
  IconCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

export function ButtonExamples() {
  return (
    <div className="container py-8 space-y-12">
      <h1 className="text-3xl font-bold mb-8">Варианты кнопок F1</h1>

      {/* Default - желтая главная кнопка */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Default (желтая - главная)</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Сделать прогноз</Button>
          <Button size="sm">Маленькая</Button>
          <Button size="lg">Большая</Button>
          <Button>
            <IconTrophy />
            С иконкой
          </Button>
          <Button>
            Далее
            <IconArrowRight />
          </Button>
          <Button size="icon">
            <IconPlus />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Используется для главных действий: создание прогноза, подтверждение, отправка
        </p>
      </section>

      {/* Outline - желтая обводка */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Outline (желтая обводка)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline">Просмотр</Button>
          <Button variant="outline" size="sm">
            Маленькая
          </Button>
          <Button variant="outline" size="lg">
            Большая
          </Button>
          <Button variant="outline">
            <IconTrophy />
            С иконкой
          </Button>
          <Button variant="outline" size="icon">
            <IconArrowRight />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Для второстепенных действий: просмотр, отмена, назад
        </p>
      </section>

      {/* Secondary - серая обводка */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Secondary (серая - неактивная)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">Завершена</Button>
          <Button variant="secondary" size="sm">
            Маленькая
          </Button>
          <Button variant="secondary" size="lg">
            Большая
          </Button>
          <Button variant="secondary">
            <IconTrophy />
            С иконкой
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Для завершенных/неактивных действий, архивных данных
        </p>
      </section>

      {/* Ghost */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Ghost (прозрачная)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost">Навигация</Button>
          <Button variant="ghost" size="sm">
            Маленькая
          </Button>
          <Button variant="ghost">
            <IconTrophy />
            С иконкой
          </Button>
          <Button variant="ghost" size="icon">
            <IconX />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Для навигации, вспомогательных действий, иконочных кнопок
        </p>
      </section>

      {/* Destructive */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Destructive (деструктивная - ошибки)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="destructive">Удалить</Button>
          <Button variant="destructive" size="sm">
            Маленькая
          </Button>
          <Button variant="destructive" size="lg">
            Большая
          </Button>
          <Button variant="destructive">
            <IconTrash />
            Удалить прогноз
          </Button>
          <Button variant="destructive" size="icon">
            <IconAlertTriangle />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Для опасных действий и ошибок: удаление, отмена, сброс
        </p>
      </section>

      {/* Success */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Success (успех)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="success">Сохранено</Button>
          <Button variant="success" size="sm">
            Маленькая
          </Button>
          <Button variant="success" size="lg">
            Большая
          </Button>
          <Button variant="success">
            <IconCheck />
            Подтверждено
          </Button>
          <Button variant="success" size="icon">
            <IconCheck />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Для успешных действий: сохранение, подтверждение, завершение
        </p>
      </section>

      {/* Loading */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Loading (загрузка)</h2>
        <div className="flex flex-wrap gap-4">
          <Button isLoading>Загрузка...</Button>
          <Button isLoading size="sm">
            Загрузка
          </Button>
          <Button isLoading size="lg">
            Загрузка
          </Button>
          <Button isLoading>Отправка</Button>
          <Button isLoading size="icon" />
        </div>
        <p className="text-sm text-muted-foreground">
          Автоматически показывается спиннер при isLoading=true
        </p>
      </section>

      {/* Link */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Link (ссылка)</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="link">Подробнее</Button>
          <Button variant="link" size="sm">
            Маленькая
          </Button>
          <Button variant="link">
            Узнать больше
            <IconArrowRight />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Для текстовых ссылок в контенте</p>
      </section>

      {/* Состояния */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Состояния</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Отключена</Button>
          <Button variant="outline" disabled>
            Отключена
          </Button>
          <Button variant="secondary" disabled>
            Отключена
          </Button>
        </div>
      </section>

      {/* Комбинации */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Комбинации (реальные примеры)</h2>
        <div className="space-y-6">
          {/* Карточка гонки */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-bold mb-4">Гран-при Монако</h3>
            <div className="flex gap-3">
              <Button className="flex-1">
                Сделать прогноз
              </Button>
            </div>
          </div>

          {/* Диалог подтверждения */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-bold mb-2">Удалить прогноз?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Это действие нельзя будет отменить
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline">Отмена</Button>
              <Button variant="destructive">
                Удалить
              </Button>
            </div>
          </div>

          {/* Форма */}
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-bold mb-4">Создать прогноз</h3>
            <div className="space-y-3 mb-4">
              <div className="h-10 bg-muted/20 rounded border" />
              <div className="h-10 bg-muted/20 rounded border" />
              <div className="h-10 bg-muted/20 rounded border" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                Отмена
              </Button>
              <Button className="flex-1">
                <IconPlus />
                Создать
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Рекомендации */}
      <section className="mt-12 p-6 bg-muted/30 border-l-4 border-accent">
        <h2 className="text-xl font-semibold mb-4 text-accent">Рекомендации по использованию</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>default:</strong> Главные действия (создать, подтвердить, отправить)
          </li>
          <li>
            <strong>outline:</strong> Второстепенные действия (просмотр, отмена, назад)
          </li>
          <li>
            <strong>secondary:</strong> Неактивные/завершенные действия
          </li>
          <li>
            <strong>ghost:</strong> Навигация, вспомогательные действия
          </li>
          <li>
            <strong>destructive:</strong> Опасные действия (удаление, сброс)
          </li>
          <li>
            <strong>link:</strong> Текстовые ссылки в контенте
          </li>
          <li>
            <strong>success:</strong> Успешные действия (сохранение, подтверждение)
          </li>
          <li>
            <strong>isLoading:</strong> Автоматически показывает спиннер во время загрузки
          </li>
        </ul>
      </section>
    </div>
  )
}

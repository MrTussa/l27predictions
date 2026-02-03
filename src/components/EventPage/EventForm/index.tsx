'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Driver, Event, Team } from '@/payload-types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type Answer = {
  questionIndex: number
  selectedOptions?: { optionIndex: number }[]
  selectedAnswer?: 'yes' | 'no'
  selectedDriver?: string
  selectedTeam?: string
}

type Props = {
  event: Event
  drivers?: Driver[]
  teams?: Team[]
}

export const EventForm: React.FC<Props> = ({ event, drivers = [], teams = [] }) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>(
    event.questions?.map((_, index) => ({
      questionIndex: index,
      selectedOptions: [],
      selectedAnswer: undefined,
      selectedDriver: undefined,
      selectedTeam: undefined,
    })) || [],
  )

  const handleSingleChoiceChange = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionIndex === questionIndex
          ? { ...answer, selectedOptions: [{ optionIndex }] }
          : answer,
      ),
    )
  }

  const handleMultipleChoiceChange = (
    questionIndex: number,
    optionIndex: number,
    checked: boolean,
  ) => {
    setAnswers((prev) =>
      prev.map((answer) => {
        if (answer.questionIndex === questionIndex) {
          const currentOptions = answer.selectedOptions || []
          if (checked) {
            return {
              ...answer,
              selectedOptions: [...currentOptions, { optionIndex }],
            }
          } else {
            return {
              ...answer,
              selectedOptions: currentOptions.filter((opt) => opt.optionIndex !== optionIndex),
            }
          }
        }
        return answer
      }),
    )
  }

  const handleYesNoChange = (questionIndex: number, value: 'yes' | 'no') => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionIndex === questionIndex ? { ...answer, selectedAnswer: value } : answer,
      ),
    )
  }

  const handleDriverChange = (questionIndex: number, driverId: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionIndex === questionIndex ? { ...answer, selectedDriver: driverId } : answer,
      ),
    )
  }

  const handleTeamChange = (questionIndex: number, teamId: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionIndex === questionIndex ? { ...answer, selectedTeam: teamId } : answer,
      ),
    )
  }

  const validateAnswers = (): boolean => {
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i]
      const question = event.questions?.[i]

      if (!question) continue

      if (question.questionType === 'yes-no') {
        if (!answer.selectedAnswer) {
          toast.error(`Пожалуйста, ответьте на вопрос: "${question.questionText}"`)
          return false
        }
      } else if (question.questionType === 'single-choice') {
        if (!answer.selectedOptions || answer.selectedOptions.length === 0) {
          toast.error(`Пожалуйста, выберите вариант для вопроса: "${question.questionText}"`)
          return false
        }
      } else if (question.questionType === 'multiple-choice') {
        if (!answer.selectedOptions || answer.selectedOptions.length === 0) {
          toast.error(
            `Пожалуйста, выберите хотя бы один вариант для вопроса: "${question.questionText}"`,
          )
          return false
        }
      } else if (question.questionType === 'driver-select') {
        if (!answer.selectedDriver) {
          toast.error(`Пожалуйста, выберите пилота для вопроса: "${question.questionText}"`)
          return false
        }
      } else if (question.questionType === 'team-select') {
        if (!answer.selectedTeam) {
          toast.error(`Пожалуйста, выберите команду для вопроса: "${question.questionText}"`)
          return false
        }
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateAnswers()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/event-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: event.id,
          answers: answers,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при отправке ответа')
      }

      toast.success('Ответ успешно отправлен!')
      router.push('/events')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка при отправке')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Questions */}
      {event.questions?.map((question, questionIndex) => {
        const answer = answers[questionIndex]
        return (
          <Card key={questionIndex} variant="default" corners="sharp" className="p-0.5">
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-black">
                  {questionIndex + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{question.questionText}</h3>
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-2">
                {question.questionType === 'yes-no' && (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={answer?.selectedAnswer === 'yes' ? 'default' : 'outline'}
                      onClick={() => handleYesNoChange(questionIndex, 'yes')}
                      className="flex-1"
                    >
                      Да
                    </Button>
                    <Button
                      type="button"
                      variant={answer?.selectedAnswer === 'no' ? 'default' : 'outline'}
                      onClick={() => handleYesNoChange(questionIndex, 'no')}
                      className="flex-1"
                    >
                      Нет
                    </Button>
                  </div>
                )}

                {question.questionType === 'single-choice' &&
                  question.options?.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        answer?.selectedOptions?.[0]?.optionIndex === optionIndex
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:bg-muted/20'
                      }`}
                      onClick={() => handleSingleChoiceChange(questionIndex, optionIndex)}
                    >
                      <Label className="cursor-pointer">{option.optionText}</Label>
                    </div>
                  ))}

                {question.questionType === 'multiple-choice' &&
                  question.options?.map((option, optionIndex) => {
                    const isChecked =
                      answer?.selectedOptions?.some((opt) => opt.optionIndex === optionIndex) ||
                      false
                    return (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/20"
                      >
                        <Checkbox
                          id={`q${questionIndex}-opt${optionIndex}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleMultipleChoiceChange(questionIndex, optionIndex, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`q${questionIndex}-opt${optionIndex}`}
                          className="cursor-pointer flex-1"
                        >
                          {option.optionText}
                        </Label>
                      </div>
                    )
                  })}

                {question.questionType === 'driver-select' && (
                  <Select
                    value={answer?.selectedDriver}
                    onValueChange={(value) => handleDriverChange(questionIndex, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите пилота" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {question.questionType === 'team-select' && (
                  <Select
                    value={answer?.selectedTeam}
                    onValueChange={(value) => handleTeamChange(questionIndex, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите команду" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </Card>
        )
      })}

      {/* Submit Button */}
      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? 'Отправка...' : 'Отправить ответы'}
      </Button>
    </div>
  )
}

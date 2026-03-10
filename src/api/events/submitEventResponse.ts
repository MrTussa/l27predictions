import type { PayloadRequest } from 'payload'
import { addDataAndFileToRequest } from 'payload'

export const submitEventResponse = async (req: PayloadRequest) => {
  try {
    await addDataAndFileToRequest(req)

    if (!req.user) {
      return Response.json({ message: 'Необходима авторизация' }, { status: 401 })
    }

    const { event: eventId, answers } = req.data || {}

    if (!eventId) {
      return Response.json({ message: 'ID события не указан' }, { status: 400 })
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return Response.json({ message: 'Необходимо ответить на вопросы' }, { status: 400 })
    }

    const event = await req.payload.findByID({
      collection: 'events',
      id: eventId,
    })

    if (!event) {
      return Response.json({ message: 'Событие не найдено' }, { status: 404 })
    }

    if (event.status !== 'open') {
      return Response.json({ message: 'Это событие не принимает ответы' }, { status: 400 })
    }

    const existingResponse = await req.payload.find({
      collection: 'event-responses',
      where: {
        and: [{ user: { equals: req.user.id } }, { event: { equals: eventId } }],
      },
      limit: 1,
    })

    if (existingResponse.docs.length > 0) {
      return Response.json({ message: 'Вы уже отправили ответ на это событие' }, { status: 400 })
    }

    const questionsCount = event.questions?.length || 0
    if (answers.length !== questionsCount) {
      return Response.json(
        { message: `Необходимо ответить на все ${questionsCount} вопросов` },
        { status: 400 },
      )
    }

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i]
      const question = event.questions?.[i]

      if (!question) {
        return Response.json({ message: `Вопрос с индексом ${i} не найден` }, { status: 400 })
      }

      if (answer.questionIndex !== i) {
        return Response.json({ message: `Несоответствие индекса вопроса` }, { status: 400 })
      }

      if (question.questionType === 'yes-no') {
        if (!answer.selectedAnswer || !['yes', 'no'].includes(answer.selectedAnswer)) {
          return Response.json(
            { message: `Для вопроса "${question.questionText}" требуется ответ "yes" или "no"` },
            { status: 400 },
          )
        }
      } else if (question.questionType === 'single-choice') {
        if (
          !answer.selectedOptions ||
          answer.selectedOptions.length !== 1 ||
          typeof answer.selectedOptions[0]?.optionIndex !== 'number'
        ) {
          return Response.json(
            { message: `Для вопроса "${question.questionText}" требуется выбрать один вариант` },
            { status: 400 },
          )
        }
      } else if (question.questionType === 'multiple-choice') {
        if (
          !answer.selectedOptions ||
          answer.selectedOptions.length === 0 ||
          !answer.selectedOptions.every(
            (opt: { optionIndex: number }) => typeof opt.optionIndex === 'number',
          )
        ) {
          return Response.json(
            {
              message: `Для вопроса "${question.questionText}" требуется выбрать хотя бы один вариант`,
            },
            { status: 400 },
          )
        }
      } else if (question.questionType === 'driver-select') {
        if (!answer.selectedDriver || typeof answer.selectedDriver !== 'string') {
          return Response.json(
            { message: `Для вопроса "${question.questionText}" требуется выбрать пилота` },
            { status: 400 },
          )
        }
      } else if (question.questionType === 'team-select') {
        if (!answer.selectedTeam || typeof answer.selectedTeam !== 'string') {
          return Response.json(
            { message: `Для вопроса "${question.questionText}" требуется выбрать команду` },
            { status: 400 },
          )
        }
      }
    }

    const newResponse = await req.payload.create({
      collection: 'event-responses',
      data: {
        user: req.user.id,
        event: eventId,
        answers: answers,
      },
    })

    return Response.json(
      {
        message: 'Ответ успешно отправлен',
        response: newResponse,
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Error submitting event response:', error)
    const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
    return Response.json({ message }, { status: 500 })
  }
}

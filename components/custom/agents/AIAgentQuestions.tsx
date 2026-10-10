'use client'
import { useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClarificationQuestion } from "./CreateAgent"

type Props = {
    questionList: ClarificationQuestion[]
    onComplete: any
}

export default function AIAgentQuestions({
    questionList,
    onComplete
}: Props) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [customAnswer, setCustomAnswer] = useState<Record<string, string>>({})

    const currentQuestion = questionList[currentIndex]
    const currentAnswer = answers[currentQuestion?.id] || ''

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: value
        }))
    }

    const handleNext = () => {
        if (!currentAnswer) return

        if (currentIndex < questionList.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            onComplete?.(answers)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    if (!currentQuestion) return null

    const progress = ((currentIndex + 1) / questionList.length) * 100

    return (
        <div className='w-full border rounded-2xl p-6 bg-background shadow-sm mt-6'>
            {/* Header / Subtitle */}
            <div className='mb-6'>
                {/* Progress bar info */}
                <div className='flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2'>
                    <span>Question {currentIndex + 1} of {questionList.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>

                {/* Progress Bar */}
                <div className='h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6'>
                    <div
                        className='h-full bg-slate-900 transition-all duration-300 ease-in-out'
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
                    HELP ME UNDERSTAND YOUR REQUEST
                </p>
                <h2 className='text-xl font-bold text-foreground tracking-tight'>
                    {currentQuestion.question}
                </h2>
            </div>

            {/* Questions Input / Options */}
            <div className='mt-6 space-y-3'>
                {/* Text / Number Type */}
                {(currentQuestion.type === 'text' || currentQuestion.type === 'number') && (
                    <div>
                        <Input
                            type={currentQuestion.type === 'number' ? 'number' : 'text'}
                            placeholder={currentQuestion.customPlaceholder || 'Type your answer...'}
                            value={currentAnswer}
                            onChange={(e) => handleAnswer(e.target.value)}
                            className='h-12 rounded-xl text-base px-4 border-slate-200 focus-visible:ring-slate-400'
                        />
                    </div>
                )}

                {/* Single Select / Multi Select Options */}
                {(currentQuestion.type === 'single_select' || currentQuestion.type === 'multi_select') && (
                    <div className='space-y-3'>
                        {currentQuestion.options?.map((option, index) => {
                            const isSelected = currentAnswer === option
                            return (
                                <button
                                    key={index}
                                    type='button'
                                    onClick={() => handleAnswer(option)}
                                    className={`w-full text-left px-5 py-3.5 rounded-2xl border transition-all duration-150 ${isSelected
                                            ? 'border-slate-400 bg-slate-50 text-foreground font-medium shadow-xs'
                                            : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                                        }`}
                                >
                                    {option}
                                </button>
                            )
                        })}

                        {/* Allow Custom Option */}
                        {currentQuestion.allowCustom && (
                            <div className='pt-1'>
                                <Input
                                    placeholder={currentQuestion.customPlaceholder || 'Other / Custom'}
                                    value={customAnswer[currentQuestion.id] || ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        setCustomAnswer(prev => ({ ...prev, [currentQuestion.id]: val }))
                                        handleAnswer(val)
                                    }}
                                    className={`h-12 rounded-2xl px-5 text-base border-slate-200 focus-visible:ring-slate-400 ${currentAnswer && !currentQuestion.options?.includes(currentAnswer)
                                            ? 'border-slate-400 bg-slate-50'
                                            : ''
                                        }`}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className='flex justify-between items-center mt-8 pt-4 border-t border-slate-100'>
                <Button
                    type='button'
                    variant='ghost'
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className='gap-2 text-slate-600 hover:text-slate-900 disabled:opacity-30'
                >
                    <ArrowLeft className='h-4 w-4' />
                    Previous
                </Button>

                <Button
                    type='button'
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className={`gap-2 px-6 rounded-xl font-medium transition-all ${currentIndex === questionList.length - 1
                            ? 'bg-slate-700 hover:bg-slate-800 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                >
                    {currentIndex === questionList.length - 1 ? (
                        <>
                            Continue
                            <Check className='h-4 w-4' />
                        </>
                    ) : (
                        <>
                            Next
                            <ArrowRight className='h-4 w-4' />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

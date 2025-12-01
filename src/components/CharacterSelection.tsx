import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CharacterClass {
  id: string;
  name: string;
  emoji: string;
  description: string;
  traits: string[];
  color: string;
  borderColor: string;
}

interface CharacterSelectionProps {
  onSelect: (characterClass: CharacterClass) => void;
}

const CharacterSelection = ({ onSelect }: CharacterSelectionProps) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [step, setStep] = useState<'quiz' | 'selection'>('quiz');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  const characterClasses: CharacterClass[] = [
    {
      id: 'runner',
      name: 'Выносливый бегун',
      emoji: '🏃',
      description: 'Мастер длинных дистанций и кардио-тренировок',
      traits: ['Выносливость', 'Скорость', 'Кардио'],
      color: 'bg-secondary/20',
      borderColor: 'border-secondary',
    },
    {
      id: 'titan',
      name: 'Силовой титан',
      emoji: '💪',
      description: 'Специалист по силовым упражнениям и набору массы',
      traits: ['Сила', 'Мощь', 'Упорство'],
      color: 'bg-accent/20',
      borderColor: 'border-accent',
    },
    {
      id: 'strategist',
      name: 'Ловкий стратег',
      emoji: '🎯',
      description: 'Эксперт в координации, гибкости и точности',
      traits: ['Ловкость', 'Гибкость', 'Точность'],
      color: 'bg-primary/20',
      borderColor: 'border-primary',
    },
    {
      id: 'allrounder',
      name: 'Универсальный боец',
      emoji: '⚡',
      description: 'Баланс всех характеристик для разностороннего развития',
      traits: ['Баланс', 'Адаптация', 'Универсальность'],
      color: 'bg-muted',
      borderColor: 'border-foreground',
    },
  ];

  const quizQuestions = [
    {
      question: 'Что тебе больше нравится?',
      options: [
        { text: 'Бегать на длинные дистанции', class: 'runner' },
        { text: 'Поднимать тяжести', class: 'titan' },
        { text: 'Заниматься гимнастикой', class: 'strategist' },
        { text: 'Пробовать всё понемногу', class: 'allrounder' },
      ],
    },
    {
      question: 'Твой идеальный вид спорта?',
      options: [
        { text: 'Легкая атлетика', class: 'runner' },
        { text: 'Тяжелая атлетика', class: 'titan' },
        { text: 'Единоборства', class: 'strategist' },
        { text: 'Кроссфит', class: 'allrounder' },
      ],
    },
    {
      question: 'Как ты тренируешься?',
      options: [
        { text: 'Долго и равномерно', class: 'runner' },
        { text: 'Интенсивно с перерывами', class: 'titan' },
        { text: 'С концентрацией на технику', class: 'strategist' },
        { text: 'Меняю нагрузки', class: 'allrounder' },
      ],
    },
  ];

  const handleQuizAnswer = (optionIndex: number) => {
    const newAnswers = [...quizAnswers, optionIndex];
    setQuizAnswers(newAnswers);

    if (newAnswers.length === quizQuestions.length) {
      const classVotes: Record<string, number> = {};
      newAnswers.forEach((answerIndex, questionIndex) => {
        const selectedOption = quizQuestions[questionIndex].options[answerIndex];
        classVotes[selectedOption.class] = (classVotes[selectedOption.class] || 0) + 1;
      });

      const recommendedClass = Object.keys(classVotes).reduce((a, b) =>
        classVotes[a] > classVotes[b] ? a : b
      );
      setSelectedClass(recommendedClass);
      setStep('selection');
    }
  };

  const handleConfirm = () => {
    const selected = characterClasses.find((c) => c.id === selectedClass);
    if (selected) {
      onSelect(selected);
    }
  };

  const currentQuestion = quizQuestions[quizAnswers.length];

  if (step === 'quiz') {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-4 border-primary animate-scale-in">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🎮</div>
            <CardTitle className="text-3xl font-heading">Добро пожаловать в NextUpFit!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Пройди короткий тест, чтобы выбрать своего персонажа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-2 mb-6">
              {quizQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index < quizAnswers.length
                      ? 'bg-primary w-12'
                      : index === quizAnswers.length
                      ? 'bg-primary/50 w-12'
                      : 'bg-muted w-8'
                  }`}
                />
              ))}
            </div>

            {currentQuestion && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-heading font-bold text-center">
                  {currentQuestion.question}
                </h3>
                <div className="grid gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      className="h-auto py-4 text-left justify-start hover:scale-105 transition-all border-2"
                      onClick={() => handleQuizAnswer(index)}
                    >
                      <span className="text-2xl mr-3">
                        {index === 0 ? '🏃' : index === 1 ? '💪' : index === 2 ? '🎯' : '⚡'}
                      </span>
                      {option.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-6 animate-fade-in">
        <Card className="border-4 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-heading">Выбери своего персонажа</CardTitle>
            <CardDescription className="text-lg">
              На основе твоих ответов мы рекомендуем класс, но ты можешь выбрать любой
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {characterClasses.map((char) => (
            <Card
              key={char.id}
              className={`border-4 cursor-pointer transition-all hover:scale-105 ${
                selectedClass === char.id
                  ? `${char.borderColor} shadow-2xl scale-105`
                  : 'border-muted hover:border-accent'
              } ${char.color}`}
              onClick={() => setSelectedClass(char.id)}
            >
              <CardHeader className="text-center space-y-4">
                {char.id === selectedClass && (
                  <Badge className="bg-primary animate-pulse-glow">Рекомендуем!</Badge>
                )}
                <div className="text-7xl mx-auto">{char.emoji}</div>
                <CardTitle className="text-xl font-heading">{char.name}</CardTitle>
                <CardDescription className="text-sm">{char.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 justify-center">
                  {char.traits.map((trait) => (
                    <Badge key={trait} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
                {selectedClass === char.id && (
                  <div className="flex items-center justify-center gap-2 text-primary animate-fade-in">
                    <Icon name="Check" size={20} />
                    <span className="text-sm font-semibold">Выбрано</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            disabled={!selectedClass}
            onClick={handleConfirm}
          >
            <Icon name="Rocket" size={24} className="mr-2" />
            Начать приключение!
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;

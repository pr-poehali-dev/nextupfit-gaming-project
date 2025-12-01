import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface Quest {
  id: number;
  title: string;
  description: string;
  progress: number;
  total: number;
  xp: number;
  category: string;
  icon: string;
  deadline?: string;
  tips?: string[];
}

interface QuestDetailsModalProps {
  quest: Quest | null;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdate: (questId: number, newProgress: number) => void;
}

const QuestDetailsModal = ({ quest, isOpen, onClose, onProgressUpdate }: QuestDetailsModalProps) => {
  const [progressInput, setProgressInput] = useState<string>('');

  if (!quest) return null;

  const handleUpdateProgress = () => {
    const value = parseFloat(progressInput);
    if (!isNaN(value) && value >= 0 && value <= quest.total) {
      onProgressUpdate(quest.id, value);
      setProgressInput('');
      onClose();
    }
  };

  const progressPercentage = (quest.progress / quest.total) * 100;
  const isCompleted = quest.progress >= quest.total;

  const getCategoryInfo = () => {
    const categories: Record<string, { name: string; color: string; emoji: string }> = {
      cardio: { name: 'Кардио', color: 'text-secondary', emoji: '🔥' },
      strength: { name: 'Силовые', color: 'text-accent', emoji: '⚡' },
      team: { name: 'Командные', color: 'text-primary', emoji: '👥' },
    };
    return categories[quest.category] || { name: 'Общее', color: 'text-muted-foreground', emoji: '🎯' };
  };

  const categoryInfo = getCategoryInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-4 border-primary">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-card-foreground/10 flex items-center justify-center flex-shrink-0">
              <Icon name={quest.icon} size={32} className="text-card-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-heading">{quest.title}</DialogTitle>
              <DialogDescription className="text-base mt-2">{quest.description}</DialogDescription>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-primary">+{quest.xp} XP</Badge>
                <Badge variant="secondary" className={categoryInfo.color}>
                  {categoryInfo.emoji} {categoryInfo.name}
                </Badge>
                {quest.deadline && (
                  <Badge variant="outline">
                    <Icon name="Clock" size={14} className="mr-1" />
                    до {quest.deadline}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Прогресс выполнения</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-4" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-primary">
                {quest.progress} / {quest.total}
              </span>
              <span className="text-muted-foreground">
                Осталось: {(quest.total - quest.progress).toFixed(1)}
              </span>
            </div>
          </div>

          {isCompleted ? (
            <div className="bg-primary/20 border-2 border-primary rounded-lg p-6 text-center space-y-3 animate-scale-in">
              <div className="text-6xl">🎉</div>
              <h3 className="text-xl font-heading font-bold text-primary">Квест выполнен!</h3>
              <p className="text-muted-foreground">Поздравляем! Награда начислена на твой счёт</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="progress-input" className="text-base font-semibold">
                  Обновить прогресс
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="progress-input"
                    type="number"
                    placeholder={`Введи значение (макс. ${quest.total})`}
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    min={0}
                    max={quest.total}
                    step={0.1}
                    className="flex-1"
                  />
                  <Button onClick={handleUpdateProgress} disabled={!progressInput}>
                    <Icon name="Check" size={18} className="mr-2" />
                    Сохранить
                  </Button>
                </div>
              </div>

              {quest.tips && quest.tips.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Icon name="Lightbulb" size={18} className="text-primary" />
                    Советы для выполнения
                  </h4>
                  <ul className="space-y-1 ml-6">
                    {quest.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-muted-foreground list-disc">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <Icon name="Target" size={24} className="mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Сложность</p>
              <p className="font-semibold">
                {quest.total > 50 ? 'Высокая' : quest.total > 20 ? 'Средняя' : 'Лёгкая'}
              </p>
            </div>
            <div className="text-center">
              <Icon name="Trophy" size={24} className="mx-auto text-secondary mb-2" />
              <p className="text-xs text-muted-foreground">Награда XP</p>
              <p className="font-semibold">+{quest.xp}</p>
            </div>
            <div className="text-center">
              <Icon name="Users" size={24} className="mx-auto text-accent mb-2" />
              <p className="text-xs text-muted-foreground">Участников</p>
              <p className="font-semibold">
                {quest.category === 'team' ? 'Команда' : 'Соло'}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
          {!isCompleted && (
            <Button variant="default">
              <Icon name="Share2" size={18} className="mr-2" />
              Позвать друзей
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestDetailsModal;

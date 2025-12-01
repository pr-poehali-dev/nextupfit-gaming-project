import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import CharacterSelection from '@/components/CharacterSelection';
import QuestDetailsModal from '@/components/QuestDetailsModal';

const API_URL = 'https://functions.poehali.dev/735878dc-3553-4a4b-bc4a-6f95d725ddbf';

const Index = () => {
  const [hasCharacter, setHasCharacter] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userLevel, setUserLevel] = useState(12);
  const [userXP, setUserXP] = useState(2340);
  const [userClass, setUserClass] = useState('Выносливый бегун');
  const [userEmoji, setUserEmoji] = useState('🏃');
  const [nextLevelXP] = useState(3000);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeQuests, setActiveQuests] = useState<any[]>([]);

  useEffect(() => {
    const savedUserId = localStorage.getItem('nextupfit_user_id');
    if (savedUserId) {
      setUserId(parseInt(savedUserId));
      setHasCharacter(true);
      loadUserData(parseInt(savedUserId));
    }
  }, []);

  const loadUserData = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}?path=user/${id}`);
      const userData = await response.json();
      setUserLevel(userData.level);
      setUserXP(userData.xp);
      setUserClass(userData.character_class);
      setUserEmoji(userData.character_emoji);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleCharacterSelect = async (character: any) => {
    try {
      const response = await fetch(`${API_URL}?path=users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `player_${Date.now()}`,
          character_class: character.name,
          character_emoji: character.emoji,
        }),
      });
      const newUser = await response.json();
      setUserId(newUser.id);
      localStorage.setItem('nextupfit_user_id', newUser.id.toString());
      setUserClass(character.name);
      setUserEmoji(character.emoji);
      setHasCharacter(true);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleQuestClick = (quest: any) => {
    setSelectedQuest(quest);
    setIsModalOpen(true);
  };

  const handleProgressUpdate = (questId: number, newProgress: number) => {
    setActiveQuests(prevQuests =>
      prevQuests.map(q =>
        q.id === questId ? { ...q, progress: newProgress } : q
      )
    );
  };

  if (!hasCharacter) {
    return <CharacterSelection onSelect={handleCharacterSelect} />;
  }

  useEffect(() => {
    if (userId) {
      setActiveQuests([
        {
          id: 1,
          title: 'Марафон Героя',
          description: 'Пробеги 5 км за эту неделю',
          progress: 3.2,
          total: 5,
          xp: 250,
          category: 'cardio',
          icon: 'Flame',
          tips: ['Разминайся перед каждой пробежкой', 'Пей воду во время бега'],
        },
        {
          id: 2,
          title: 'Сила Титана',
          description: 'Выполни 50 отжиманий',
          progress: 32,
          total: 50,
          xp: 150,
          category: 'strength',
          icon: 'Zap',
          tips: ['Держи спину ровно', 'Дыши правильно'],
        },
        {
          id: 3,
          title: 'Командный Дух',
          description: 'Участвуй в 3 командных тренировках',
          progress: 1,
          total: 3,
          xp: 300,
          category: 'team',
          icon: 'Users',
          tips: ['Найди команду в своем классе', 'Поддерживай товарищей'],
        },
      ]);
    }
  }, [userId]);

  const achievements = [
    { icon: 'Trophy', name: 'Первый рубеж', color: 'text-secondary' },
    { icon: 'Award', name: 'Спринтер', color: 'text-accent' },
    { icon: 'Target', name: 'Точность', color: 'text-primary' },
    { icon: 'Medal', name: 'ГТО Герой', color: 'text-secondary' },
  ];

  const weeklyStats = [
    { day: 'Пн', value: 45, max: 60 },
    { day: 'Вт', value: 30, max: 60 },
    { day: 'Ср', value: 55, max: 60 },
    { day: 'Чт', value: 40, max: 60 },
    { day: 'Пт', value: 50, max: 60 },
    { day: 'Сб', value: 35, max: 60 },
    { day: 'Вс', value: 20, max: 60 },
  ];

  const leaderboard = [
    { rank: 1, name: 'Алексей К.', class: '8А', xp: 4500, avatar: '🦸' },
    { rank: 2, name: 'Мария С.', class: '8Б', xp: 4200, avatar: '🦹' },
    { rank: 3, name: 'Ты', class: '8А', xp: 2340, avatar: '🏃', isUser: true },
    { rank: 4, name: 'Дмитрий П.', class: '8В', xp: 2100, avatar: '⚡' },
    { rank: 5, name: 'Анна Л.', class: '8А', xp: 1950, avatar: '🎯' },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      cardio: 'border-secondary bg-secondary/10',
      strength: 'border-accent bg-accent/10',
      team: 'border-primary bg-primary/10',
    };
    return colors[category as keyof typeof colors] || 'border-muted';
  };

  return (
    <div className="min-h-screen bg-background dark">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground flex items-center gap-3">
              <span className="text-5xl">🚀</span> NextUpFit
            </h1>
            <p className="text-muted-foreground mt-1">Твоя игровая вселенная фитнеса</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Icon name="Settings" size={20} />
          </Button>
        </header>

        <Card className="border-4 border-primary bg-card animate-scale-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl animate-pulse-glow">
                  {userEmoji}
                </div>
                <Badge className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground font-bold text-lg px-3 py-1">
                  {userLevel}
                </Badge>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-heading font-bold text-foreground">{userClass}</h2>
                <p className="text-muted-foreground">Опыт до следующего уровня</p>
                <div className="mt-3 space-y-2">
                  <Progress value={(userXP / nextLevelXP) * 100} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-semibold">{userXP} XP</span>
                    <span className="text-muted-foreground">{nextLevelXP} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="quests" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="quests" className="font-semibold">
              <Icon name="Crosshair" size={18} className="mr-2" />
              Квесты
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-semibold">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-semibold">
              <Icon name="Crown" size={18} className="mr-2" />
              Рейтинг
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quests" className="space-y-4 mt-6">
            <h3 className="text-2xl font-heading font-bold text-foreground">Активные квесты</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeQuests.map((quest, index) => (
                <Card
                  key={quest.id}
                  className={`border-4 ${getCategoryColor(quest.category)} transition-all hover:scale-105 hover:shadow-xl cursor-pointer`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleQuestClick(quest)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-card-foreground/10 flex items-center justify-center">
                        <Icon name={quest.icon} size={24} className="text-card-foreground" />
                      </div>
                      <Badge variant="secondary" className="font-bold">
                        +{quest.xp} XP
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-heading mt-3">{quest.title}</CardTitle>
                    <CardDescription className="text-base">{quest.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={(quest.progress / quest.total) * 100} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">
                          {quest.progress} / {quest.total}
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round((quest.progress / quest.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-4 border-dashed border-muted">
              <CardContent className="p-8 text-center">
                <Icon name="Plus" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">Готов к новым вызовам?</p>
                <Button size="lg" className="font-semibold">
                  Взять новый квест
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-4 border-secondary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Activity" size={24} className="text-secondary" />
                    Активность за неделю
                  </CardTitle>
                  <CardDescription>Минуты физической активности</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 h-48">
                    {weeklyStats.map((stat) => (
                      <div key={stat.day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-muted rounded-t-lg overflow-hidden relative" style={{ height: '160px' }}>
                          <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-secondary to-secondary/50 transition-all duration-500 hover:from-secondary hover:to-secondary/70"
                            style={{ height: `${(stat.value / stat.max) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{stat.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">275</p>
                      <p className="text-xs text-muted-foreground">Минут</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">5.2</p>
                      <p className="text-xs text-muted-foreground">км</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">12</p>
                      <p className="text-xs text-muted-foreground">Тренировок</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-accent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Target" size={24} className="text-accent" />
                    Достижения
                  </CardTitle>
                  <CardDescription>Твои заслуженные награды</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-lg border-2 border-muted hover:border-accent transition-all hover:scale-105 cursor-pointer"
                      >
                        <div className={`text-5xl ${achievement.color}`}>
                          <Icon name={achievement.icon} size={48} />
                        </div>
                        <p className="text-sm font-semibold text-center">{achievement.name}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6">
                    Посмотреть все (24)
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-4 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                  Статистика по категориям
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Flame" size={16} className="text-secondary" />
                      Кардио
                    </span>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Zap" size={16} className="text-accent" />
                      Силовые
                    </span>
                    <span className="text-sm text-muted-foreground">60%</span>
                  </div>
                  <Progress value={60} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Users" size={16} className="text-primary" />
                      Командные
                    </span>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <Progress value={45} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6 mt-6">
            <Card className="border-4 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Crown" size={24} className="text-primary" />
                  Топ класса 8А
                </CardTitle>
                <CardDescription>Рейтинг по опыту за месяц</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      player.isUser
                        ? 'bg-primary/20 border-primary shadow-lg scale-105'
                        : 'bg-muted/30 border-muted hover:border-accent'
                    }`}
                  >
                    <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                    </div>
                    <div className="text-4xl">{player.avatar}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{player.xp}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-4 border-secondary">
                <CardHeader>
                  <CardTitle className="text-lg">🏫 Рейтинг школы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <p className="text-4xl font-bold text-foreground">3 место</p>
                    <p className="text-sm text-muted-foreground">из 15 школ района</p>
                    <Badge variant="secondary" className="mt-2">
                      +2 позиции за неделю
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-4 border-accent">
                <CardHeader>
                  <CardTitle className="text-lg">👥 Командный рейтинг</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <p className="text-4xl font-bold text-foreground">1 место</p>
                    <p className="text-sm text-muted-foreground">Класс 8А</p>
                    <Badge className="mt-2 bg-accent">Чемпионы месяца!</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <QuestDetailsModal
          quest={selectedQuest}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProgressUpdate={handleProgressUpdate}
        />
      </div>
    </div>
  );
};

export default Index;
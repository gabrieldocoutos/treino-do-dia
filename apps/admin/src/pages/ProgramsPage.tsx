import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, H2, Spinner, Text, XStack, YStack } from 'tamagui';
import { api } from '../lib/api';

interface ProgramSummary {
  id: string;
  title: string;
  description: string | null;
  workoutCount: number;
  athleteId: string;
  athleteName: string;
}

export function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<ProgramSummary[]>('/programs').then((res) => {
      if (res.success) setPrograms(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  return (
    <YStack gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <H2>Programas</H2>
        <Button size="$3" themeInverse onPress={() => navigate('/programs/new')}>
          Novo programa
        </Button>
      </XStack>

      {programs.length === 0 ? (
        <Card padded>
          <Text color="$gray10">Nenhum programa criado ainda.</Text>
        </Card>
      ) : (
        <YStack gap="$3">
          {programs.map((program) => (
            <Card
              key={program.id}
              padded
              cursor="pointer"
              hoverStyle={{ backgroundColor: '$color2' }}
              pressStyle={{ backgroundColor: '$color3' }}
              onPress={() => navigate(`/programs/${program.id}`)}
            >
              <YStack gap="$2">
                <Text fontWeight="bold" fontSize={16}>
                  {program.title}
                </Text>
                {program.description && <Text color="$gray10">{program.description}</Text>}
                <XStack gap="$4">
                  <Text fontSize={12} color="$gray9">
                    {program.workoutCount} {program.workoutCount === 1 ? 'treino' : 'treinos'}
                  </Text>
                  <Text
                    fontSize={12}
                    color="$blue10"
                    cursor="pointer"
                    hoverStyle={{ textDecorationLine: 'underline' }}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigate(`/athletes/${program.athleteId}`);
                    }}
                  >
                    {program.athleteName}
                  </Text>
                </XStack>
              </YStack>
            </Card>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

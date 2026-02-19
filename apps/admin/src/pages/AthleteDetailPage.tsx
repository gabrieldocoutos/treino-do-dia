import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, H2, H3, Separator, Spinner, Text, XStack, YStack } from 'tamagui';
import { api } from '../lib/api';

interface ProgramSummary {
  id: string;
  title: string;
  description: string | null;
}

interface AthleteDetail {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  notes: string | null;
  programs: ProgramSummary[];
}

export function AthleteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAthlete = useCallback(() => {
    api.get<AthleteDetail>(`/athletes/${id}`).then((res) => {
      if (res.success) setAthlete(res.data);
      setIsLoading(false);
    });
  }, [id]);

  useEffect(() => {
    fetchAthlete();
  }, [fetchAthlete]);

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  if (!athlete) {
    return (
      <YStack gap="$4">
        <Text color="$red10">Atleta nao encontrado.</Text>
        <Button onPress={() => navigate('/athletes')}>Voltar</Button>
      </YStack>
    );
  }

  return (
    <YStack gap="$4">
      <XStack alignItems="center" gap="$3">
        <Button size="$3" onPress={() => navigate('/athletes')}>
          Voltar
        </Button>
        <H2>{athlete.name}</H2>
        <Text
          fontSize={12}
          color={athlete.isActive ? '$green10' : '$orange10'}
          backgroundColor={athlete.isActive ? '$green3' : '$orange3'}
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
        >
          {athlete.isActive ? 'Ativo' : 'Pendente'}
        </Text>
      </XStack>

      <Card padded>
        <YStack gap="$2">
          <Text color="$gray11">{athlete.email}</Text>
          {athlete.notes && <Text color="$gray10">{athlete.notes}</Text>}
        </YStack>
      </Card>

      <Separator />

      <XStack justifyContent="space-between" alignItems="center">
        <H3>Programas</H3>
        <Button size="$3" themeInverse onPress={() => navigate(`/programs/new?athleteId=${id}`)}>
          Criar programa
        </Button>
      </XStack>

      {athlete.programs.length === 0 ? (
        <Card padded>
          <Text color="$gray10">Nenhum programa criado para este atleta.</Text>
        </Card>
      ) : (
        <YStack gap="$3">
          {athlete.programs.map((p) => (
            <Card
              key={p.id}
              padded
              cursor="pointer"
              hoverStyle={{ backgroundColor: '$color2' }}
              pressStyle={{ backgroundColor: '$color3' }}
              onPress={() => navigate(`/programs/${p.id}`)}
            >
              <YStack gap="$1">
                <Text fontWeight="bold" fontSize={16}>
                  {p.title}
                </Text>
                {p.description && <Text color="$gray10">{p.description}</Text>}
              </YStack>
            </Card>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

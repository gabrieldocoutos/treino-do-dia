import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, H2, Separator, Spinner, Text, XStack, YStack } from 'tamagui';
import { api } from '../lib/api';

interface Athlete {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  notes: string | null;
}

export function AthletesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Athlete[]>('/athletes').then((res) => {
      if (res.success) {
        setAthletes(res.data);
      }
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
      <H2>Atletas</H2>

      {athletes.length === 0 ? (
        <Card padded>
          <Text color="$gray10">Nenhum atleta cadastrado ainda.</Text>
        </Card>
      ) : (
        <YStack gap="$3">
          {athletes.map((athlete) => (
            <Card
              key={athlete.id}
              padded
              cursor="pointer"
              hoverStyle={{ backgroundColor: '$color2' }}
              pressStyle={{ backgroundColor: '$color3' }}
              onPress={() => navigate(`/athletes/${athlete.id}`)}
            >
              <YStack gap="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="bold" fontSize={16}>
                    {athlete.name}
                  </Text>
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
                <Separator />
                <Text color="$gray11">{athlete.email}</Text>
                {athlete.notes && <Text color="$gray10">{athlete.notes}</Text>}
              </YStack>
            </Card>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

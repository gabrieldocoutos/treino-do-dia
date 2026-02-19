import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  H2,
  H3,
  Input,
  Label,
  Separator,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import { api } from '../lib/api';

interface ExerciseOption {
  id: string;
  name: string;
  videoUrl: string | null;
}

interface AthleteOption {
  id: string;
  name: string;
}

interface ProgramExerciseForm {
  exerciseId: string;
  sets: string;
  reps: string;
  load: string;
  notes: string;
  order: number;
}

interface WorkoutForm {
  id?: string;
  date: string;
  title: string;
  exercises: ProgramExerciseForm[];
}

interface ProgramData {
  id: string;
  title: string;
  description: string | null;
  athleteId: string;
  workouts: {
    id: string;
    date: string;
    title: string | null;
    exercises: {
      id: string;
      exerciseId: string;
      sets: string | null;
      reps: string | null;
      load: string | null;
      notes: string | null;
      order: number;
      exercise: ExerciseOption;
    }[];
  }[];
}

export function ProgramFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const athleteIdParam = searchParams.get('athleteId');
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAthleteId, setSelectedAthleteId] = useState(athleteIdParam ?? '');
  const [athletes, setAthletes] = useState<AthleteOption[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutForm[]>([]);
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [creatingExercise, setCreatingExercise] = useState(false);

  useEffect(() => {
    const load = async () => {
      const exRes = await api.get<ExerciseOption[]>('/exercises');
      if (exRes.success) setExercises(exRes.data);

      // Load athletes for selector (only when creating)
      if (!isEdit && !athleteIdParam) {
        const athRes = await api.get<AthleteOption[]>('/athletes');
        if (athRes.success) {
          setAthletes(athRes.data);
          if (athRes.data.length > 0 && !selectedAthleteId) {
            setSelectedAthleteId(athRes.data[0].id);
          }
        }
      }

      if (isEdit) {
        const res = await api.get<ProgramData>(`/programs/${id}`);
        if (res.success && res.data) {
          setTitle(res.data.title);
          setDescription(res.data.description ?? '');
          setSelectedAthleteId(res.data.athleteId);
          setWorkouts(
            res.data.workouts.map((w) => ({
              id: w.id,
              date: w.date.split('T')[0],
              title: w.title ?? '',
              exercises: w.exercises.map((e) => ({
                exerciseId: e.exerciseId,
                sets: e.sets ?? '',
                reps: e.reps ?? '',
                load: e.load ?? '',
                notes: e.notes ?? '',
                order: e.order,
              })),
            })),
          );
        }
      }
      setIsLoading(false);
    };
    load();
  }, [id, isEdit, athleteIdParam, selectedAthleteId]);

  const handleSave = async () => {
    if (!title.trim() || !selectedAthleteId) return;
    setSaving(true);

    let programId = id;

    if (isEdit) {
      await api.put(`/programs/${id}`, { title, description: description || undefined });
    } else {
      const res = await api.post<{ id: string }>('/programs', {
        title,
        description: description || undefined,
        athleteId: selectedAthleteId,
      });
      if (res.success) programId = res.data.id;
      else {
        setSaving(false);
        return;
      }
    }

    // Sync workouts
    for (const workout of workouts) {
      if (workout.id) {
        // Update existing workout
        await api.put(`/programs/${programId}/workouts/${workout.id}`, {
          date: workout.date,
          title: workout.title || undefined,
        });
        // Bulk upsert exercises
        await api.put(`/programs/${programId}/workouts/${workout.id}/exercises`, {
          exercises: workout.exercises.map((e, i) => ({
            exerciseId: e.exerciseId,
            sets: e.sets || undefined,
            reps: e.reps || undefined,
            load: e.load || undefined,
            notes: e.notes || undefined,
            order: i,
          })),
        });
      } else {
        // Create new workout
        const wRes = await api.post<{ id: string }>(`/programs/${programId}/workouts`, {
          date: workout.date,
          title: workout.title || undefined,
        });
        if (wRes.success && workout.exercises.length > 0) {
          await api.put(`/programs/${programId}/workouts/${wRes.data.id}/exercises`, {
            exercises: workout.exercises.map((e, i) => ({
              exerciseId: e.exerciseId,
              sets: e.sets || undefined,
              reps: e.reps || undefined,
              load: e.load || undefined,
              notes: e.notes || undefined,
              order: i,
            })),
          });
        }
      }
    }

    setSaving(false);

    if (athleteIdParam) {
      navigate(`/athletes/${athleteIdParam}`);
    } else {
      navigate(`/programs/${programId}`);
    }
  };

  const addWorkout = () => {
    const today = new Date().toISOString().split('T')[0];
    setWorkouts((prev) => [...prev, { date: today, title: '', exercises: [] }]);
  };

  const removeWorkout = (index: number) => {
    setWorkouts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWorkout = (index: number, field: keyof WorkoutForm, value: string) => {
    setWorkouts((prev) => prev.map((w, i) => (i === index ? { ...w, [field]: value } : w)));
  };

  const addExerciseToWorkout = (workoutIndex: number) => {
    if (exercises.length === 0) return;
    setWorkouts((prev) =>
      prev.map((w, i) =>
        i === workoutIndex
          ? {
              ...w,
              exercises: [
                ...w.exercises,
                {
                  exerciseId: exercises[0].id,
                  sets: '',
                  reps: '',
                  load: '',
                  notes: '',
                  order: w.exercises.length,
                },
              ],
            }
          : w,
      ),
    );
  };

  const removeExerciseFromWorkout = (workoutIndex: number, exIndex: number) => {
    setWorkouts((prev) =>
      prev.map((w, i) =>
        i === workoutIndex ? { ...w, exercises: w.exercises.filter((_, j) => j !== exIndex) } : w,
      ),
    );
  };

  const updateExercise = (
    workoutIndex: number,
    exIndex: number,
    field: keyof ProgramExerciseForm,
    value: string,
  ) => {
    setWorkouts((prev) =>
      prev.map((w, i) =>
        i === workoutIndex
          ? {
              ...w,
              exercises: w.exercises.map((e, j) => (j === exIndex ? { ...e, [field]: value } : e)),
            }
          : w,
      ),
    );
  };

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) return;
    setCreatingExercise(true);
    const res = await api.post<ExerciseOption>('/exercises', { name: newExerciseName.trim() });
    if (res.success) {
      setExercises((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewExerciseName('');
    }
    setCreatingExercise(false);
  };

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner size="large" />
      </YStack>
    );
  }

  return (
    <YStack gap="$4">
      <XStack alignItems="center" gap="$3">
        <Button size="$3" onPress={() => navigate(-1)}>
          Voltar
        </Button>
        <H2>{isEdit ? 'Editar programa' : 'Novo programa'}</H2>
      </XStack>

      {/* Program info */}
      <Card padded>
        <YStack gap="$3">
          {/* Athlete selector (only for new programs without athleteId param) */}
          {!isEdit && !athleteIdParam && (
            <YStack gap="$2">
              <Label>Atleta</Label>
              {athletes.length === 0 ? (
                <Text color="$gray10">Nenhum atleta cadastrado.</Text>
              ) : (
                <select
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #ccc',
                    fontSize: 14,
                  }}
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}
            </YStack>
          )}
          <YStack gap="$2">
            <Label>Titulo</Label>
            <Input value={title} onChangeText={setTitle} placeholder="Ex: Treino A - Hipertrofia" />
          </YStack>
          <YStack gap="$2">
            <Label>Descricao (opcional)</Label>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Descricao do programa"
            />
          </YStack>
        </YStack>
      </Card>

      <Separator />

      {/* Create exercise inline */}
      <Card padded>
        <YStack gap="$2">
          <Text fontWeight="bold">Adicionar exercicio ao catalogo</Text>
          <XStack gap="$2" alignItems="flex-end">
            <YStack flex={1} gap="$1">
              <Input
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                placeholder="Nome do exercicio"
              />
            </YStack>
            <Button
              size="$3"
              onPress={handleCreateExercise}
              disabled={creatingExercise || !newExerciseName.trim()}
            >
              {creatingExercise ? 'Criando...' : 'Criar'}
            </Button>
          </XStack>
        </YStack>
      </Card>

      <Separator />

      {/* Workouts */}
      <XStack justifyContent="space-between" alignItems="center">
        <H3>Treinos</H3>
        <Button size="$3" onPress={addWorkout}>
          Adicionar treino
        </Button>
      </XStack>

      {workouts.length === 0 ? (
        <Card padded>
          <Text color="$gray10">Nenhum treino adicionado. Clique em "Adicionar treino".</Text>
        </Card>
      ) : (
        <YStack gap="$4">
          {workouts.map((workout, wIndex) => (
            <Card key={workout.id ?? `new-${wIndex}`} padded>
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="bold" fontSize={16}>
                    {workout.date
                      ? new Date(`${workout.date}T00:00:00`).toLocaleDateString('pt-BR')
                      : `Treino ${wIndex + 1}`}
                  </Text>
                  <Button size="$2" theme="red" onPress={() => removeWorkout(wIndex)}>
                    Remover treino
                  </Button>
                </XStack>

                <XStack gap="$3">
                  <YStack flex={1} gap="$1">
                    <Label>Data</Label>
                    <input
                      type="date"
                      value={workout.date}
                      onChange={(e) => updateWorkout(wIndex, 'date', e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #ccc',
                        fontSize: 14,
                      }}
                    />
                  </YStack>
                  <YStack flex={2} gap="$1">
                    <Label>Titulo (opcional)</Label>
                    <Input
                      value={workout.title}
                      onChangeText={(v) => updateWorkout(wIndex, 'title', v)}
                      placeholder="Ex: Peito e Triceps"
                    />
                  </YStack>
                </XStack>

                <Separator />

                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="600">Exercicios</Text>
                  <Button
                    size="$2"
                    onPress={() => addExerciseToWorkout(wIndex)}
                    disabled={exercises.length === 0}
                  >
                    Adicionar exercicio
                  </Button>
                </XStack>

                {workout.exercises.length === 0 ? (
                  <Text color="$gray10" fontSize={13}>
                    Nenhum exercicio adicionado.
                  </Text>
                ) : (
                  <YStack gap="$3">
                    {workout.exercises.map((ex, exIndex) => (
                      <Card key={`${ex.exerciseId}-${exIndex}`} padded backgroundColor="$color2">
                        <YStack gap="$2">
                          <XStack justifyContent="space-between" alignItems="center">
                            <Text fontWeight="600" fontSize={14}>
                              Exercicio {exIndex + 1}
                            </Text>
                            <Button
                              size="$2"
                              theme="red"
                              onPress={() => removeExerciseFromWorkout(wIndex, exIndex)}
                            >
                              Remover
                            </Button>
                          </XStack>

                          <YStack gap="$1">
                            <Label>Exercicio</Label>
                            <select
                              value={ex.exerciseId}
                              onChange={(e) =>
                                updateExercise(wIndex, exIndex, 'exerciseId', e.target.value)
                              }
                              style={{
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: '1px solid #ccc',
                                fontSize: 14,
                              }}
                            >
                              {exercises.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          </YStack>

                          <XStack gap="$2">
                            <YStack flex={1} gap="$1">
                              <Label>Series</Label>
                              <Input
                                value={ex.sets}
                                onChangeText={(v) => updateExercise(wIndex, exIndex, 'sets', v)}
                                placeholder="3"
                              />
                            </YStack>
                            <YStack flex={1} gap="$1">
                              <Label>Reps</Label>
                              <Input
                                value={ex.reps}
                                onChangeText={(v) => updateExercise(wIndex, exIndex, 'reps', v)}
                                placeholder="10-12"
                              />
                            </YStack>
                            <YStack flex={1} gap="$1">
                              <Label>Carga</Label>
                              <Input
                                value={ex.load}
                                onChangeText={(v) => updateExercise(wIndex, exIndex, 'load', v)}
                                placeholder="20kg"
                              />
                            </YStack>
                          </XStack>

                          <YStack gap="$1">
                            <Label>Observacoes</Label>
                            <Input
                              value={ex.notes}
                              onChangeText={(v) => updateExercise(wIndex, exIndex, 'notes', v)}
                              placeholder="Observacoes do exercicio"
                            />
                          </YStack>
                        </YStack>
                      </Card>
                    ))}
                  </YStack>
                )}
              </YStack>
            </Card>
          ))}
        </YStack>
      )}

      <Separator />

      <XStack gap="$3">
        <Button
          size="$4"
          themeInverse
          onPress={handleSave}
          disabled={saving || !title.trim() || !selectedAthleteId}
        >
          {saving ? 'Salvando...' : isEdit ? 'Salvar alteracoes' : 'Criar programa'}
        </Button>
        <Button size="$4" onPress={() => navigate(-1)}>
          Cancelar
        </Button>
      </XStack>
    </YStack>
  );
}

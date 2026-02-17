import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'

export default function AthleteLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.color?.val,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} style={{ marginBottom: -3 }} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Treinos',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} style={{ marginBottom: -3 }} name="heartbeat" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

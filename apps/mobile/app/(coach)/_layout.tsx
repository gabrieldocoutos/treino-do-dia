import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'

export default function CoachLayout() {
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
            <FontAwesome size={28} style={{ marginBottom: -3 }} name="dashboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="athletes"
        options={{
          title: 'Atletas',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} style={{ marginBottom: -3 }} name="users" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

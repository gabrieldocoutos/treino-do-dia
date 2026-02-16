import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { loginSchema } from '@treino/shared'
import { Button, Card, H2, Input, Label, Spinner, Text, YStack } from 'tamagui'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async () => {
    setError(null)
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }
    setIsSubmitting(true)
    try {
      await login({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card padded elevate size="$4" width={380}>
      <YStack gap="$3">
        <H2 textAlign="center">Login</H2>

        {error && (
          <Text color="$red10" textAlign="center">
            {error}
          </Text>
        )}

        <YStack gap="$2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
          />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Sua senha"
          />
        </YStack>

        <Button
          themeInverse
          size="$4"
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : 'Entrar'}
        </Button>
      </YStack>
    </Card>
  )
}

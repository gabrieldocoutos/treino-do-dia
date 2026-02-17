import type config from './tamagui.config'

type Conf = typeof config

declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends Conf {}
}

import React from 'react';
import { Paragraph, Text, XStack, YStack } from 'tamagui';

import { ExternalLink } from './ExternalLink';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <YStack>
      <YStack alignItems="center" marginHorizontal={50}>
        <Paragraph textAlign="center" fontSize={17} lineHeight={24}>
          Open up the code for this screen:
        </Paragraph>

        <XStack
          backgroundColor="$backgroundHover"
          borderRadius={3}
          paddingHorizontal={4}
          marginVertical={7}>
          <Text fontFamily="$mono">{path}</Text>
        </XStack>

        <Paragraph textAlign="center" fontSize={17} lineHeight={24}>
          Change any of the text, save the file, and your app will automatically update.
        </Paragraph>
      </YStack>

      <YStack marginTop={15} marginHorizontal={20} alignItems="center">
        <ExternalLink
          style={{ paddingVertical: 15 }}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
          <Text textAlign="center" color="$blue10">
            Tap here if your app doesn't automatically update after making changes
          </Text>
        </ExternalLink>
      </YStack>
    </YStack>
  );
}

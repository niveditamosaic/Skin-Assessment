import { Stack } from 'expo-router';

export default function AssessmentLayout() {
  // headerShown: false — each screen manages its own back button and progress bar
  // so the back-navigation state (preserved answers) is handled inside the screen.
  return <Stack screenOptions={{ headerShown: false }} />;
}

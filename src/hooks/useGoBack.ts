import { router } from 'expo-router';

// Use on every screen that has a back button.
// If the navigator has history (normal mid-flow case), go back naturally.
// If there is no history (e.g. deep-link or hot-reload landed on a mid-flow
// screen), fall back to an explicit route so the user is never stranded.
export function useGoBack(fallbackRoute: string) {
  return () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute as any);
    }
  };
}

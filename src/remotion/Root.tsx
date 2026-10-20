import { Composition, type AnyZodObject } from 'remotion'
import { LogoIntro } from './LogoIntro'
import { LOGO_INTRO_DURATION, LOGO_INTRO_FPS, type LogoIntroProps } from './timeline'

/**
 * Remotion root.
 *
 * Registered compositions are what `npx remotion studio` and
 * `npx remotion render` operate on:
 *
 *   npx remotion studio src/remotion/index.ts
 *   npx remotion render src/remotion/index.ts VirtueLogoIntro out/logo-intro.mp4
 *   npx remotion still  src/remotion/index.ts VirtueLogoMark  out/logo.png --frame=58
 */
export function RemotionRoot() {
  return (
    <>
      {/* 16:9 Landscape — Full Brand Identity with Motto */}
      <Composition<AnyZodObject, LogoIntroProps>
        id="VirtueBrandLandscape"
        component={LogoIntro}
        durationInFrames={LOGO_INTRO_DURATION}
        fps={LOGO_INTRO_FPS}
        width={1920}
        height={1080}
        defaultProps={{
          background: 'dark' as const,
          showWordmark: true,
          showMotto: true,
          mottoText: 'Websites Built For Real Growth. Shipped On A Fixed Timeline.',
        }}
      />

      {/* 9:16 Portrait — Full Brand Identity for Stories / Mobile / Reels with Motto */}
      <Composition<AnyZodObject, LogoIntroProps>
        id="VirtueBrandPortrait"
        component={LogoIntro}
        durationInFrames={LOGO_INTRO_DURATION}
        fps={LOGO_INTRO_FPS}
        width={1080}
        height={1920}
        defaultProps={{
          background: 'dark' as const,
          showWordmark: true,
          showMotto: true,
          mottoText: 'Websites Built For Real Growth. Shipped On A Fixed Timeline.',
        }}
      />

      {/* 16:9 — the first-load preloader. */}
      <Composition<AnyZodObject, LogoIntroProps>
        id="VirtueLogoIntro"
        component={LogoIntro}
        durationInFrames={LOGO_INTRO_DURATION}
        fps={LOGO_INTRO_FPS}
        width={1920}
        height={1080}
        defaultProps={{ background: 'dark' as const, showWordmark: true, showMotto: true }}
      />

      {/* 1:1 — social avatar / app splash. */}
      <Composition<AnyZodObject, LogoIntroProps>
        id="VirtueLogoMark"
        component={LogoIntro}
        durationInFrames={LOGO_INTRO_DURATION}
        fps={LOGO_INTRO_FPS}
        width={1080}
        height={1080}
        defaultProps={{ background: 'dark' as const, showWordmark: false }}
      />

      {/* 9:16 — story / reel cutdown. */}
      <Composition<AnyZodObject, LogoIntroProps>
        id="VirtueLogoStory"
        component={LogoIntro}
        durationInFrames={LOGO_INTRO_DURATION}
        fps={LOGO_INTRO_FPS}
        width={1080}
        height={1920}
        defaultProps={{ background: 'dark' as const, showWordmark: true, showMotto: true }}
      />

      {/* Transparent alpha export for overlaying on footage. */}
      <Composition<AnyZodObject, LogoIntroProps>
        id="VirtueLogoAlpha"
        component={LogoIntro}
        durationInFrames={LOGO_INTRO_DURATION}
        fps={LOGO_INTRO_FPS}
        width={1920}
        height={1080}
        defaultProps={{ background: 'transparent' as const, showWordmark: true, showMotto: true }}
      />
    </>
  )
}

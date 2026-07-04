import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay'
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono'

// Same three families as the live site (app/layout.tsx) — sans for body,
// serif for hero/section titles, mono for uppercase labels. Restricted to
// the weights/subsets actually used (400/500/700, latin) instead of every
// weight Google Fonts offers — fewer network requests, faster renders.
export const { fontFamily: sansFont } = loadInter('normal', { weights: ['400', '500', '700'], subsets: ['latin'] })
export const { fontFamily: serifFont } = loadPlayfair('normal', { weights: ['400', '700'], subsets: ['latin'] })
export const { fontFamily: monoFont } = loadJetBrainsMono('normal', { weights: ['400', '700'], subsets: ['latin'] })

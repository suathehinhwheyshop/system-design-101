import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
export const FONT = 'Be Vietnam Pro';
const W: Array<[string, string]> = [['500', 'Medium'], ['600', 'SemiBold'], ['800', 'ExtraBold']];
export const SERIF = 'Playfair Display';
export const CONDENSED = 'Barlow Condensed';
export const HAND = 'Patrick Hand';
export const INTER = 'Inter HF';
export const fontsReady = Promise.all([
  loadFont({family: SERIF, url: staticFile('fonts/PlayfairDisplay-ExtraBold.ttf'), weight: '800'}),
  loadFont({family: INTER, url: staticFile('fonts/Inter-Var.ttf'), weight: '100 900', style: 'normal'}),
  loadFont({family: INTER, url: staticFile('fonts/Inter-Italic-Var.ttf'), weight: '100 900', style: 'italic'}),
  loadFont({family: HAND, url: staticFile('fonts/PatrickHand-Regular.ttf'), weight: '400'}),
  loadFont({family: CONDENSED, url: staticFile('fonts/BarlowCondensed-ExtraBold.ttf'), weight: '800'}),
  loadFont({family: FONT, url: staticFile('fonts/BeVietnamPro-Bold.ttf'), weight: '700'}),
  loadFont({family: FONT, url: staticFile('fonts/BeVietnamPro-ExtraBoldItalic.ttf'), weight: '800', style: 'italic'}),
  ...W.map(([weight, name]) => loadFont({family: FONT, url: staticFile(`fonts/BeVietnamPro-${name}.ttf`), weight})),
]);

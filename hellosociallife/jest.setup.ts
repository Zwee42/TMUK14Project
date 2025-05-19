import { TextEncoder as UtilTextEncoder, TextDecoder as UtilTextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = UtilTextEncoder as unknown as typeof TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = UtilTextDecoder as unknown as typeof TextDecoder;
}

import '@testing-library/jest-dom';
// jest.setup.ts or jest.setup.js
import { TextEncoder, TextDecoder } from 'util';
//import '@testing-library/jest-dom';
import '@testing-library/jest-dom';


if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// jest.setup.js
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import 'jest-location-mock'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

process.env.VITE_BACKEND_URL = 'http://localhost:3000'
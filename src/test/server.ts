// Modules
import { setupServer } from 'msw/node';
// Utils
import { handlers } from './handlers';

export const server = setupServer(...handlers);

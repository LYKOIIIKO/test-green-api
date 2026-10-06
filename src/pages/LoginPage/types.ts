// Types
import { TCredentials } from '@/shared/types';

export type TLoginPageProps = {
  onLogin: (credentials: TCredentials) => void;
};

import { TCredentials } from "@/types";

export type TLoginPageProps = {
  onLogin: (credentials: TCredentials) => void;
};

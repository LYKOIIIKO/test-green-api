import { TCredentials } from "@/shared/types";

export type TChatPageProps = {
  credentials: TCredentials;
  onLogout: () => void;
};

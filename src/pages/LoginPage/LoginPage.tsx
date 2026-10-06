// Modules
import { FormEvent, useState } from "react";
// Components
import { Button, Text, TextInput } from "@gravity-ui/uikit";
// Api
import { createGreenApi } from "@/api/greenApi";
// Consts
import { GREEN_API_URL } from "@/consts";
// Types
import { TLoginPageProps } from "./types";
// Styles
import styles from "./LoginPage.module.css";

export const LoginPage = ({ onLogin }: TLoginPageProps) => {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const api = createGreenApi({
        apiUrl: GREEN_API_URL,
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      });
      await api.getStateInstance();
      onLogin({
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      });
    } catch {
      setError("Неверный idInstance или apiTokenInstance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.Root}>
      <form
        className={styles.Form}
        onSubmit={handleSubmit}
        data-qa="login-form"
      >
        <Text variant="header-1" className={styles.Title}>
          Вход в MAX
        </Text>
        <TextInput
          label="idInstance"
          placeholder="idInstance"
          value={idInstance}
          onUpdate={setIdInstance}
          size="m"
          qa="login-id-input"
        />
        <TextInput
          label="apiTokenInstance"
          placeholder="apiTokenInstance"
          type="password"
          value={apiTokenInstance}
          onUpdate={setApiTokenInstance}
          size="m"
          qa="login-token-input"
        />
        {error ? (
          <Text color="danger" className={styles.Error}>
            {error}
          </Text>
        ) : null}
        <Button
          type="submit"
          view="action"
          size="m"
          width="max"
          loading={isLoading}
        >
          Войти
        </Button>
      </form>
    </div>
  );
};

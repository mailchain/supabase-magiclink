import { useEffect, useState } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [emailInput, setEmailInput] = useState("");
  const [authSession, setAuthSession] = useState("loading");
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) return setAuthSession("error");
      setAuthSession(data.session ?? 'unauthenticated');
    });
  }, []);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {authSession === "loading" && "Loading"}
        {authSession === "error" && "Supabase Auth error"}
        {typeof authSession === 'object' && <h2>Authenticated {authSession.user.email}</h2>}
        {authSession == 'unauthenticated' && (
          <div>
            <h2>Authentication</h2>
            <form
              onSubmit={(e) => {
                fetch("/api/auth", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email: emailInput }),
                }).then(
                  () => alert(`Authentication mail send to ${emailInput}, please check your inbox.`),
                  () => alert(`Failed sending authentication mail to ${emailInput}. Please try again.`)
                );
                e.preventDefault();
              }}
            >
              <label>Email: </label>
              <input
                type={"email"}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <input type="submit" value="Submit" />
            </form>
          </div>
        )}
      </main>
    </>
  );
}

import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css'
import "react-datepicker/dist/react-datepicker.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

function Auth({ children }) {
  const { status } = useSession({ required: true })

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return children
}
export default MyApp 
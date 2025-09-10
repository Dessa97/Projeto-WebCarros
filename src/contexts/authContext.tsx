import { onAuthStateChanged } from "firebase/auth";
import { ReactNode, createContext, useState, useEffect } from "react";
import { auth } from "../services/firebaseConnection";
//--------------------------------------------------------------------

//formato do dado que vai estar dentro do contexto
type AuthContextData = {
  signed: boolean;
  loadingAuth: boolean;
  handleInfoUser: ({ name, email, uid }: UserProps) => void;
  user: UserProps | null;
};
//--------------------------------------------------------------------

//O componente (AuthProvider) vai receber uma prop chamada children, que pode ser qualquer coisa renderizável no React
type AuthProviderProps = {
  children: ReactNode;
};
//--------------------------------------------------------------------

//Define como será o objeto user
interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
}
//--------------------------------------------------------------------

//Cria o contexto que será usado nos outros componentes.
//O {} as AuthContextData é só para "forçar" o TypeScript a aceitar que o contexto segue o tipo AuthContextData.
export const AuthContext = createContext({} as AuthContextData);
//--------------------------------------------------------------------

//O AuthProvider é um componente que envolve a aplicação.
function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null); //estado user, que guarda os dados do usuário.
  const [loadingAuth, setLoadingAuth] = useState(true);
  //--------------------------------------------------------------------

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          name: user?.displayName,
          email: user?.email,
        });
        setLoadingAuth(false);
      } else {
        setUser(null);
        setLoadingAuth(false);
      }
    });
    return () => {
      unsub();
    };
  }, []);
  //--------------------------------------------------------------------

  //Atualiza as informações do usuário
  function handleInfoUser({ name, email, uid }: UserProps) {
    setUser({
      name,
      email,
      uid,
    });
  }
  //--------------------------------------------------------------------

  return (
    <AuthContext.Provider
      value={{ signed: !!user, loadingAuth, handleInfoUser, user }}
    >
      {" "}
      {/*!! converte o valor em boolean*/}
      {children}{" "}
      {/*tudo que estiver dentro do <AuthProvider> será renderizado normalmente, mas terá acesso ao contexto.*/}
    </AuthContext.Provider>
  );
}
//Exporta o provider para ser usado no App.tsx ou em outro ponto da aplicação.
export default AuthProvider;

import logoImg from "../../assets/logo.svg";
import { Container } from "../../components/container";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../../components/input";
//hook do React Hook Form para gerenciar estado do formulário
import { useForm } from "react-hook-form";
//Zod, usado para criar schemas de validação.
import { z } from "zod";
//função que conecta o schema do Zod ao React Hook Form, permitindo validação automática.
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "../../services/firebaseConnection";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/authContext";
import toast from "react-hot-toast";
//--------------------------------------------------------------------

//Cria um schema de validação do formulário
const schema = z.object({
  //deve ser um e-mail válido e não vazio
  email: z
    .email("Insira um email válido")
    .nonempty("O campo email é obrigatório"),
  //deve ser uma string não vazia.
  password: z
    .string()
    .min(6, "A senha deve ter no minimo 6 caracteres")
    .nonempty("O campo senha é obrigatório"),
  name: z.string().nonempty("O campo é obrigatório"),
});
//--------------------------------------------------------------------

/*Cria automaticamente o tipo TypeScript do formulário com base no schema:
type FormData = {
  email: string;
  password: string;
}*/
type FormData = z.infer<typeof schema>;
//--------------------------------------------------------------------

export function Register() {
  const navigate = useNavigate();
  const {
    register, //registra inputs do formulário
    handleSubmit, //função para processar dados validados no submit
    formState: { errors }, //contém mensagens de erro de cada campo
  } = useForm<FormData>({
    //inicializa o formulário com tipagem segura
    resolver: zodResolver(schema), //conecta o Zod para validação automática
    mode: "onChange", //valida a cada alteração do input
  });
  const { handleInfoUser } = useContext(AuthContext);
  //--------------------------------------------------------------------

  //Função onSubmit: chamada quando você envia um formulário.
  //parâmetro data contém os valores do formulário (email e password).
  async function onSubmit(data: FormData) {
    createUserWithEmailAndPassword(auth, data.email, data.password) //função do Firebase Authentication. Ela cria um novo usuário no Firebase usando email e senha.
      .then(async (user) => {
        //Assim que o usuário é criado, o código atualiza o perfil dele com o nome (displayName).
        await updateProfile(user.user, {
          displayName: data.name,
        });
        console.log("CADASTRADO COM SUCESSO");
        toast.success("Bem vindo ao WebCarros!");
        navigate("/dashboard", { replace: true });
        handleInfoUser({
          name: data.name,
          email: data.email,
          uid: user.user.uid,
        });
      })
      .catch((error) => {
        console.log("ERRO AO CADASTRAR O USUÁRIO");
        console.log(error);
      });
  }
  //--------------------------------------------------------------------

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }
    handleLogout();
  });
  //--------------------------------------------------------------------

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to="/" className="mb-6 max-w-sm w-full">
          <img src={logoImg} alt="Logo do site" className="w-full" />
        </Link>
        <form
          className="bg-white max-w-xl w-full rounded-lg p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Input
              type="text"
              placeholder="Digite o seu nome completo..."
              name="name"
              error={errors.name?.message} //Mostra a mensagem de erro do campo
              register={register} //É registrado no React Hook Form via register
            />
          </div>
          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite o seu email..."
              name="email"
              error={errors.email?.message} //Mostra a mensagem de erro do campo
              register={register} //É registrado no React Hook Form via register
            />
          </div>
          <div className="mb-3">
            <Input
              type="password"
              placeholder="Digite a sua senha..."
              name="password"
              error={errors.password?.message} //Mostra a mensagem de erro do campo
              register={register} //É registrado no React Hook Form via register
            />
          </div>
          <button
            type="submit"
            className="bg-zinc-900 w-full rounded-md text-white h-10 font-medium"
          >
            Cadastrar
          </button>
        </form>
        <Link to="/login">Já possui uma conta? Faça o login!</Link>
      </div>
    </Container>
  );
}

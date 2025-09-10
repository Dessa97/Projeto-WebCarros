//Componente Input

//UseFormRegister → tipo do React Hook Form para a função register usada nos inputs.
//RegisterOptions → tipo que define regras de validação para o input.
import { RegisterOptions, UseFormRegister } from "react-hook-form";
//--------------------------------------------------------------------

interface InputProps {
  type: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<any>; //função do React Hook Form usada para registrar o input no formulário.
  error?: string;
  rules?: RegisterOptions; //regras de validação adicionais do React Hook Form.
}
//--------------------------------------------------------------------

export function Input({
  name,
  placeholder,
  type,
  register,
  rules,
  error,
}: InputProps) {
  //--------------------------------------------------------------------
  
  return (
    <div>
      <input
        className="w-full border-2 rounded-md h-11 px-2"
        placeholder={placeholder}
        type={type}
        //registra o input no React Hook Form, aplicando regras de validação (rules)
        {...register(name, rules)} 
        //atribui o nome como ID do input (útil para labels)
        id={name} 
      />
      {/*se houver erro, exibe a mensagem em um parágrafo abaixo do input*/}
      {error && <p className="my-1 text-red-500">{error}</p>} 
    </div>
  );
}

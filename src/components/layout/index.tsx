//O Outlet é um componente do React Router que funciona como um "ponto de injeção".
//Ele representa onde os componentes filhos de uma rota (definidos no react-router-dom) serão renderizados.
import { Outlet } from "react-router-dom";
import { Header } from "../header";
//--------------------------------------------------------------------

export function Layout(){
  //--------------------------------------------------------------------
  
  return (
    <>
    <Header/>
    {/*Outlet é usado para renderizar as rotas filhas de Layout (ou de qualquer rota pai).*/}
    <Outlet/>
    </>
  )
}

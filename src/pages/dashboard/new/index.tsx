import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelHeader";
import { FiUpload, FiTrash } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext, useState } from "react";
import { AuthContext } from "../../../contexts/authContext";
//gerar um id para imagens
import { v4 as uuidV4 } from "uuid";
import { storage, db } from "../../../services/firebaseConnection";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";
//--------------------------------------------------------------------
//O schema define as validações do formulário
const schema = z.object({
  name: z.string().nonempty("O nome é obrigatório"),
  model: z.string().nonempty("O modelo é obrigatório"),
  year: z.string().nonempty("O ano do carro é obrigatório"),
  km: z.string().nonempty("O KM é obrigatório"),
  price: z.string().nonempty("O valor é obrigatório"),
  city: z.string().nonempty("A cidade é obrigatória"),
  //Aplica uma regra personalizada (refine = "refinar/validar além do básico").
  //A função test(value) usa uma regex para validar o formato.
  //Regex explicada: /^(\d{11,12})$/
  // ^ → início da string.
  // \d{10,11} → apenas dígitos (\d), com 10 ou 11 números.
  // $ → fim da string.
  whatsapp: z
    .string()
    .min(1, "O telefone é obrigatório")
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: "Número de telefone invalido",
    }),
  description: z.string().nonempty("A descrição é obrigatória"),
});
//--------------------------------------------------------------------
// O type FormData garante tipagem segura.
type FormData = z.infer<typeof schema>;
//--------------------------------------------------------------------
interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}
//--------------------------------------------------------------------
export function New() {
  const { user } = useContext(AuthContext);
  //O useForm conecta os inputs, valida com Zod e expõe erros/reset.
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });
  //Lista de carros
  const [carImages, setCarImages] = useState<ImageItemProps[]>([]);
  //--------------------------------------------------------------------
  function onSubmit(data: FormData) {
    if (carImages.length === 0) {
      toast.error("Envie uma imagem do carro");
      return;
    }
    const carListImages = carImages.map((car) => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      };
    });
    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      description: data.description,
      km: data.km,
      price: data.price,
      year: data.year,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset();
        setCarImages([]);
        console.log("CADASTRADO COM SUCESSO");
        toast.success("Carro cadastrado com successo!")
      })
      .catch((error) => {
        console.log(error);
        console.log("ERRO AO CADASTRAR NO BANCO");
      });
  }
  //--------------------------------------------------------------------
  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type === "image/jpeg" || image.type === "image/png") {
        await handleUpload(image);
      } else {
        alert("Envie uma image jpeg ou png");
        return;
      }
    }
  }
  //--------------------------------------------------------------------
  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }
    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        };
        setCarImages((images) => [...images, imageItem]);
        toast.success("Imagem cadastrada com sucesso!")
      });
    });
  }
  //--------------------------------------------------------------------
  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`;
    const imageRef = ref(storage, imagePath);
    try {
      await deleteObject(imageRef);
      setCarImages(carImages.filter((car) => car.url !== item.url));
    } catch (error) {
      console.log("ERRO AO DELETAR A IMAGEM");
    }
  }
  //--------------------------------------------------------------------
  return (
    //Formulário
    <Container>
      <DashboardHeader />
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input
              className="opacity-0 cursor-pointer"
              type="file"
              accept="image/*"
              onChange={handleFile}
            />
          </div>
        </button>
        {carImages.map((item) => (
          <div
            key={item.name}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button
              className="absolute"
              onClick={() => handleDeleteImage(item)}
            >
              <FiTrash size={28} color="#fff" />
            </button>
            <img
              src={item.previewUrl}
              className="rounded-lg w-full h-32 object-cover"
              alt="foto do carro"
            />
          </div>
        ))}
      </div>
      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Onix 1.0"
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 1.0 Flex Plus Manual"
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2016/2016"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">KM</p>
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 23.900"
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone/ Whatsapp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 01112345678"
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Florianópolis"
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Valor</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: 69.000"
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o carro..."
            />
            {errors.description && (
              <p className="mb-1 text-red-500">{errors.description.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 text-white font-medium h-10"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  );
}

import { println } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

interface IPropsData {
  role: string;
  slug: string;
}

const getCardsData = async (data: IPropsData) => {
  try {
    const response = await api.get(`/dashboard/${data.role}/${data.slug}/cards`);
    if (response.status !== 200) {
      throw new Error("Gagal mengambil data cards");
    }

    return response.data.data;
  } catch (error) {
    println("Bisnis", "Gagal mengambil data cards", EDebugType.ERROR);
  }
};

export default getCardsData;

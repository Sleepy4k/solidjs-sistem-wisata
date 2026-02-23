import { println, error as toastError } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

import { ICard } from "../types/dashboard";

interface IPropsData {
  role: string;
  slug: string;
}

const getCardsData = async (data: IPropsData): Promise<ICard[] | undefined> => {
  try {
    const response = await api.get(`/dashboard/${data.role}/${data.slug}/cards`);
    if (response.status !== 200) {
      throw new Error("Gagal mengambil data cards");
    }

    return response.data.data as ICard[];
  } catch (error) {
    println("Bisnis", "Gagal mengambil data cards", EDebugType.ERROR);
    toastError("Gagal mengambil data kartu.", "Error");
  }
};

export default getCardsData;

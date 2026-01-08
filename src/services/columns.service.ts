import { println } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

interface IPropsData {
  role: string;
  slug: string;
}

const getColumnsData = async (data: IPropsData) => {
  try {
    const response = await api.get(`/dashboard/${data.role}/${data.slug}/columns`);
    if (response.status !== 200) {
      throw new Error("Gagal mengambil data columns");
    }

    return response.data.data;
  } catch (error) {
    println("Bisnis", "Gagal mengambil data columns", EDebugType.ERROR);
  }
};

export default getColumnsData;

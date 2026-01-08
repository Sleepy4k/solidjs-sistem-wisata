import { println } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

interface IPropsData {
  role: string;
  slug: string;
}

const getFieldsData = async (data: IPropsData) => {
  try {
    const response = await api.get(`/dashboard/${data.role}/${data.slug}/fields`);
    if (response.status !== 200) {
      throw new Error("Gagal mengambil data fields");
    }

    return response.data.data;
  } catch (error) {
    println("Bisnis", "Gagal mengambil data fields", EDebugType.ERROR);
  }
};

export default getFieldsData;

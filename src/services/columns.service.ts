import { println, error as toastError } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

import { IColumn } from "../types/dashboard";

interface IPropsData {
  role: string;
  slug: string;
}

const getColumnsData = async (data: IPropsData): Promise<IColumn[] | undefined> => {
  try {
    const response = await api.get(`/dashboard/${data.role}/${data.slug}/columns`);
    if (response.status !== 200) {
      throw new Error("Gagal mengambil data columns");
    }

    return response.data.data as IColumn[];
  } catch (error) {
    println("Bisnis", "Gagal mengambil data columns", EDebugType.ERROR);
    toastError("Gagal mengambil konfig kolom.", "Error");
  }
};

export default getColumnsData;

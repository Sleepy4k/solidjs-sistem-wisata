import { println, error as toastError } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

import { ISummaryData } from "../types/dashboard";

// NOTE: use path alias to types may require tsconfig mapping; using relative import to be safe

const getSummaryData = async (isCanLoad: boolean): Promise<ISummaryData | undefined> => {
  if (!isCanLoad) return;

  try {
    const response = await api.get("/dashboard/statistics");
    if (response.status !== 200) {
      throw new Error("Gagal mengambil data summary");
    }

    return response.data.data;
  } catch (error) {
    println("Summary", "Gagal mengambil data summary", EDebugType.ERROR);
    toastError("Gagal mengambil data ringkasan.", "Error");
  }
};

export default getSummaryData;

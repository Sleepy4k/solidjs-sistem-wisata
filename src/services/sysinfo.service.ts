import { println } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

const getSystemInformation = async () => {
  try {
    const response = await api.get("/dashboard/system-information");
    if (response.status !== 200) {
      throw new Error("Gagal mengambil informasi sistem");
    }

    return response.data.data;
  } catch (error) {
    println("System Information", "Gagal mengambil informasi sistem", EDebugType.ERROR);
  }
};

export default getSystemInformation;

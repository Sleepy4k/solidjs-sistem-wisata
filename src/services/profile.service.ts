import { println } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

const getDetailProfile = async () => {
  try {
    const response = await api.get("/dashboard/profile/detail");
    if (response.status !== 200) {
      throw new Error("Gagal mengambil detail profil");
    }

    return response.data.data;
  } catch (error) {
    println("Profile", "Gagal mengambil detail profil", EDebugType.ERROR);
  }
};

export default getDetailProfile;

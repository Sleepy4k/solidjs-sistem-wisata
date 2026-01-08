import { println } from "@utils";
import api from "./api.service"
import { EDebugType } from "@enums";

const getSidebarItems = async (isCanLoad: boolean) => {
  if (!isCanLoad) return;

  try {
    const response = await api.get("/dashboard/sidebar");
    if (response.status !== 200) {
      throw new Error("Gagal mengambil data sidebar items");
    }
    
    return response.data.data;
  } catch (error) {
    println("Sidebar", "Gagal mengambil data sidebar items", EDebugType.ERROR);
  }
};

export default getSidebarItems;

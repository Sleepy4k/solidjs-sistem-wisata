import { println } from "@utils";
import api from "./api.service"
import { EDebugType } from "@enums";

const getSidebarItems = async (isCanLoad: boolean) => {
  if (!isCanLoad) return;

  try {
    const response = await api.get("/dashboard/sidebar");
    if (response.status !== 200) {
      throw new Error("Failed to fetch sidebar items");
    }
    
    return response.data.data;
  } catch (error) {
    println("Sidebar", "Failed to fetch sidebar items", EDebugType.ERROR);
  }
};

export default getSidebarItems;

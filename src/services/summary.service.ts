import { println } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

interface SummaryData {
  roles: { [key: string]: string }[];
  menus: { [key: string]: MenuItem[] };
  summary: Summary;
}

interface MenuItem {
  name: string;
  prefix: 'pokdarwis' | 'bumdes';
}

interface Summary {
  [key: string]: {
    total_income: string;
    total_outcome: string;
  };
}

const getSummaryData = async (isCanLoad: boolean): Promise<SummaryData | undefined> => {
  if (!isCanLoad) return;

  try {
    const response = await api.get("/dashboard/statistics");
    if (response.status !== 200) {
      throw new Error("Failed to fetch summary data");
    }

    return response.data.data;
  } catch (error) {
    println("Summary", "Failed to fetch summary data", EDebugType.ERROR);
  }
};

export default getSummaryData;

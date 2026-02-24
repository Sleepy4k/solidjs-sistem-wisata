import { println, error as toastError } from "@utils";
import api from "./api.service";
import { EDebugType } from "@enums";

export interface IFormula {
  id?: string;
  result: string;
  result_label: string;
  field_a: string;
  operator: "*" | "+" | "-" | "/";
  operator_label?: string;
  field_b: string;
  formula_string?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

interface IFormulaParams {
  role: string;
  slug: string;
}

export const getFormulas = async (
  params: IFormulaParams,
): Promise<IFormula[]> => {
  try {
    const res = await api.get(
      `/dashboard/${params.role}/${params.slug}/formula`,
    );
    if (res.status !== 200) throw new Error("Gagal mengambil formula");
    return (res.data?.data?.formulas ?? res.data?.data ?? res.data ?? []) as IFormula[];
  } catch (err) {
    println("Formula", "Gagal mengambil formula", EDebugType.ERROR);
    return [];
  }
};

export const saveFormulas = async (
  params: IFormulaParams,
  formulas: IFormula[],
): Promise<boolean> => {
  try {
    const res = await api.post(
      `/dashboard/${params.role}/${params.slug}/formula`,
      { formulas },
    );
    return res.status === 200 || res.status === 201;
  } catch (err: any) {
    println("Formula", "Gagal menyimpan formula", EDebugType.ERROR);
    const msg =
      err?.response?.data?.message ?? "Gagal menyimpan formula.";
    toastError(msg, "Error");
    return false;
  }
};

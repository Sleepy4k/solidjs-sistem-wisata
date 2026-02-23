// Field types
export interface IFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface IFieldOption {
  value: string | number;
  label: string;
}

export interface IField {
  label: string;
  name: string;
  type: string;
  filterable?: boolean;
  required?: boolean;
  validation?: IFieldValidation;
  options?: IFieldOption[];
}

// Card types
export interface ICard {
  name: string;
  title: string;
  value: number | string;
  is_currency?: boolean;
}

// Column types
export interface IColumn {
  data: string;
  title: string;
  render?: (data: any) => string;
}

// Summary types
export interface IMenuItem {
  name: string;
  prefix: "pokdarwis" | "bumdes";
}

export interface ISummaryData {
  roles: { [key: string]: string }[];
  menus: { [key: string]: IMenuItem[] };
  summary: {
    [key: string]: {
      total_income: string;
      total_outcome: string;
    };
  };
}

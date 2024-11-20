export type Transaction = { description: string; amount: number };
export type TransactionData = {
  topFiveExpenses: { description: string; amount: number }[];
  total: number;
  restaurantsTotal: number;
  groceriesTotal: number;
  pharmacyTotal: number;
  shoppingTotal: number;
  data: Transaction[];
};

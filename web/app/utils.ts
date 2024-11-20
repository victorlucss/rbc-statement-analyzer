import { Transaction, TransactionData } from "./types";

export const CURRENCY = "C$";
export const CREDIT_LIMIT = 5000; // your credit limit total avaialable no your CC
export const LIMIT_THRESHOLD = 0.3; // percentage recommended by the bank

export const categoryToString: Record<string, string> = {
  total: "Total",
  restaurantsTotal: "Restaurants",
  groceriesTotal: "Groceries",
  pharmacyTotal: "Pharmacy",
  shoppingTotal: "Shopping",
};

export const getData = (data: Transaction[]): TransactionData => {
  const groups = {
    restaurant: [
      "PIZZA PIZZA",
      "TIM HORTONS",
      "LAURA SECORD",
      "MUFFIN PLUS",
      "LA CREMIERE",
      "POULET ROUGE",
      "PATISSERIE COCO",
      "CAFE MYRIADE",
      "ICHIRAKU KAWAKI",
      "CHUNGCHUN KOGO",
      "SQ *ALDO CAFE",
      "LE PETIT DEP",
      "CAFE DES AMIS",
      "AMEA CAFE",
      "LA DIPERIE",
      "CHOCOLATS FAVORIS",
      "CHIMAEK GANA",
      "LES TROIS MONKEYS",
    ],
    groceries: ["ADONIS", "INSTACAR", "DOLLARAMA", "METRO ETS"],
    pharmacy: ["JEAN COUTU", "PHARMAPRIX"],
    shopping: [
      "DOLLARAMA",
      "AMZN MKTP",
      "AMAZON.CA",
      "BEST BUY",
      "TEMU",
      "LAURA SECORD",
      "WINNERS",
      "FIRMOO.UK",
      "CAMTEC PHOTO",
    ],
  };

  const filterByGroup = (group: string[]) =>
    data.filter(({ description }) =>
      group.some((term) =>
        String(description).toUpperCase().includes(term.toUpperCase()),
      ),
    );

  const calculateTotal = (transactions: Transaction[]) =>
    transactions
      .reduce((sum, { amount }) => sum + Math.abs(amount), 0)
      .toFixed(2);

  const getTopFiveExpenses = (transactions: Transaction[]) =>
    [...transactions]
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5)
      .map(({ description, amount }) => ({
        description,
        amount: Number(amount.toFixed(2)),
      }));

  const restaurants = filterByGroup(groups.restaurant);
  const groceries = filterByGroup(groups.groceries);
  const pharmacy = filterByGroup(groups.pharmacy);
  const shopping = filterByGroup(groups.shopping);

  return {
    topFiveExpenses: getTopFiveExpenses(data),
    total: Number(calculateTotal(data)),
    restaurantsTotal: Number(calculateTotal(restaurants)),
    groceriesTotal: Number(calculateTotal(groceries)),
    pharmacyTotal: Number(calculateTotal(pharmacy)),
    shoppingTotal: Number(calculateTotal(shopping)),
    data,
  };
};

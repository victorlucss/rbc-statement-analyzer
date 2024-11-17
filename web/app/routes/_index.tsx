import type { MetaFunction } from "@remix-run/node";
import data from "../../../rbc-statement-parser/out.json";
import { useLoaderData } from "@remix-run/react";
import { columns, DataTable } from "@/components/table";
import { Comparison } from "@/components/comparison";

export function loader() {
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
    ],

    groceries: ["ADONIS", "INSTACAR", "DOLLARAMA", "METRO ETS"],

    pharmacy: ["JEAN COUTU", "PHARMAPRIX"],
  };

  const restaurants = data.filter(({ description }) =>
    groups.restaurant.some((term) =>
      String(description).toUpperCase().includes(term),
    ),
  );
  const groceries = data.filter(({ description }) =>
    groups.groceries.some((term) =>
      String(description).toUpperCase().includes(term),
    ),
  );
  const pharmacy = data.filter(({ description }) =>
    groups.pharmacy.some((term) =>
      String(description).toUpperCase().includes(term),
    ),
  );

  const total = (dataToTotal) =>
    dataToTotal.reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0);

  return {
    total: total(data),
    restaurantsTotal: total(restaurants),
    groceriesTotal: total(groceries),
    pharmacyTotal: total(pharmacy),
    data,
  };
}

export const meta: MetaFunction = () => {
  return [
    { title: "Clicky" },
    {
      name: "description",
      content:
        "Clicky is a web app that allows you to create and share your own clicky links.",
    },
  ];
};
export default function Index() {
  const { data, total, restaurantsTotal, pharmacyTotal, groceriesTotal } =
    useLoaderData<typeof loader>();
  // console.log(restaurants);

  return (
    <div>
      <div className="h-[300px]">
        <Comparison
          data={[
            { type: "total", total: total },
            { type: "restaurantsTotal", total: restaurantsTotal },
            { type: "pharmacyTotal", total: pharmacyTotal },
            { type: "groceriesTotal", total: groceriesTotal },
          ]}
        />
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}

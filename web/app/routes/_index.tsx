import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { columns, DataTable } from "@/components/table";
import { Comparison } from "@/components/comparison";
import { Button } from "@/components/ui/button";
import { CircleOff, CreditCard, TrendingDown } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { processAction } from "@/action.server";
import { CURRENCY, CREDIT_LIMIT, LIMIT_THRESHOLD } from "@/utils";

export async function action(actionArgs: ActionFunctionArgs) {
  return processAction(actionArgs);
}

export const meta: MetaFunction = () => {
  return [{ title: "RBC Statement" }];
};
export default function Index() {
  const data = useActionData<typeof action>();

  return (
    <div className="p-5">
      {data && (
        <>
          <div className="mb-5 flex w-full flex-row gap-5">
            <div className="h-[350px] min-w-[350px]">
              <Comparison
                data={[
                  { type: "restaurantsTotal", total: data?.restaurantsTotal },
                  { type: "pharmacyTotal", total: data?.pharmacyTotal },
                  { type: "groceriesTotal", total: data?.groceriesTotal },
                  { type: "shoppingTotal", total: data?.shoppingTotal },
                ]}
              />
            </div>

            <div
              className="flex h-[350px] min-w-[350px] flex-col gap-2 rounded-lg
                border bg-slate-900 p-5"
            >
              <h1 className="text-lg font-bold">Top 5 expenses</h1>
              {data?.topFiveExpenses?.map(({ description, amount }) => (
                <div
                  key="description"
                  className="border-slate-800 [&:not(:last-child)]:mb-2"
                >
                  <p className="text-xs">{description}</p>
                  <div className="text-md font-semibold text-red-500">
                    <TrendingDown className="mr-1 inline" />
                    {CURRENCY}
                    {amount}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex h-[350px] min-w-[350px] flex-col items-center
                justify-between gap-2"
            >
              <div
                className="flex h-[100px] w-full flex-col justify-center
                  rounded-lg border bg-slate-900 p-5"
              >
                <h1 className="text-sm text-slate-300">Credit limit</h1>
                <div className="text-2xl font-semibold">
                  <CreditCard className="mr-1 inline" /> {CURRENCY}
                  {CREDIT_LIMIT}
                </div>
              </div>

              <div
                className="flex h-[100px] w-full flex-col justify-center
                  rounded-lg border bg-slate-900 p-5"
              >
                <h1 className="text-sm text-slate-300">Statement total</h1>
                <div className="text-2xl font-semibold text-red-500">
                  <TrendingDown className="mr-1 inline" /> {CURRENCY}
                  {data?.total}
                </div>
              </div>

              <div
                className="flex h-[100px] w-full flex-col justify-center
                  rounded-lg border bg-slate-900 p-5"
              >
                <h1 className="text-sm text-slate-300">
                  Amount over threshold
                </h1>
                <div className="text-2xl font-semibold text-red-500">
                  <CircleOff className="mr-1 inline" /> {CURRENCY}
                  {(data?.total ?? 0) - CREDIT_LIMIT * LIMIT_THRESHOLD}
                </div>
              </div>
            </div>
          </div>

          <DataTable columns={columns} data={data?.data} />
        </>
      )}

      {!data && (
        <div className="flex h-screen w-screen items-center justify-center">
          <Form
            method="post"
            encType="multipart/form-data"
            replace
            className="flex flex-col gap-4"
          >
            <Alert>
              <AlertTitle>RBC Statement Analyser</AlertTitle>
              <AlertDescription>
                Upload your statement in PDF and read it in a table with some
                analysis. We don&apos;t store your file!
                <br />
                This is optimized for Mastercard statements!
              </AlertDescription>
            </Alert>
            <input
              type="file"
              id="fie"
              name="file"
              accept="application/pdf"
              className="rounded-lg border px-4 py-3 text-sm text-foreground"
            />
            <Button type="submit">Submit</Button>
          </Form>
        </div>
      )}
    </div>
  );
}

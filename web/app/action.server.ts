import { ActionFunctionArgs } from "@remix-run/node";
import { getData } from "./utils";

export const processAction = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const data = new FormData();
  const file = body.get("file");

  if (file) {
    data.append("files", file);
  }

  try {
    const response = await fetch("http://localhost:8000/create", {
      method: "POST",
      body: data,
    });

    const transactions = await response.json();
    return getData(transactions);
  } catch (error) {
    console.log(error);
    return getData([]);
  }
};

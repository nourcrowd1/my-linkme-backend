import paypal, { getAccessToken } from "../paypal";

afterAll(() => {
  clearTimeout(paypal.timer);
});

describe("paypal", () => {
  it("can get access token", async () => {
    const result = await getAccessToken();
    expect(result).toHaveProperty("access_token", expect.any(String));
  });
  it("can make requests", async () => {
    const result = await paypal.execute({
      method: "POST",
      path: "/v2/checkout/orders",
      body: {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: "PUHF",
            amount: { currency_code: "USD", value: "100.00" },
          },
        ],
        application_context: { return_url: "", cancel_url: "" },
      },
    });

    expect(result).toHaveProperty("status", "CREATED");
  });
});

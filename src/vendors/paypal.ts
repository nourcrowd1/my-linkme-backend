import { IncomingMessage } from "http";
import fetch from "node-fetch";
import { NotAuthorizedError } from "../errors";

import { base64, body } from "../lib";
import { paypal as config } from "../config";

export const getAccessToken = () =>
  fetch(config.host + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "x-www-form-urlencoded",
      Accept: "application/json",
      "Accept-Language": "en_US",
      Authorization: `Basic ${base64(`${config.clientID}:${config.secret}`)}`,
    },
    body: "grant_type=client_credentials",
  }).then((res) => res.json());

export class PayPal {
  private token?: string;

  constructor() {}

  execute = async ({
    method,
    path,
    body,
    returnJson = true,
  }: {
    method: string;
    path: string;
    body?: Record<string, any>;
    returnJson?
  }) => {
    if (!this.token) await this.getNewToken();
    return fetch(config.host + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(body),
    }).then(async (res) => {
        if (returnJson) return res.json();
        return true;
    })

  };

  timer?: NodeJS.Timer;

  getNewToken = () =>
    getAccessToken().then(({ access_token, expires_in }) => {
      clearTimeout(this.timer);
      this.token = access_token;
      this.timer = setTimeout(() => {
        this.token = undefined;
      }, expires_in * 1000);
    });

  processEvent = (event: {
    id: string;
    event_type: string;
    [key: string]: any;
  }) => {};

  verifyNotification = async (req: IncomingMessage) => {
    const input: {
      auth_algo: string;
      cert_url: string;
      transmission_id: string;
      transmission_sig: string;
      transmission_time: string;
      webhook_id: string;
      webhook_event: any;
    } = {
      auth_algo: req.headers["PAYPAL-AUTH-ALGO"] as string || req.headers["paypal-auth-algo"]  as string,
      cert_url: req.headers["PAYPAL-CERT-URL"] as string || req.headers["paypal-cert-url"] as string,
      transmission_id: req.headers["PAYPAL-TRANSMISSION-ID"] as string|| req.headers["paypal-transmission-id"]as string,
      transmission_sig: req.headers["PAYPAL-TRANSMISSION-SIG"] as string || req.headers["paypal-transmission-sig"] as string,
      transmission_time: req.headers["PAYPAL-TRANSMISSION-TIME"] as string || req.headers["paypal-transmission-time"] as string,
      webhook_id: config.webhookId,
      webhook_event: await body.json(req),
    };

    const result = await this.execute({
      method: "POST",
      path: "/v1/notifications/verify-webhook-signature",
      body: input,
    });

    // if (result?.verification_status !== "SUCCESS")
    //   throw new NotAuthorizedError();

    return input.webhook_event;
  };

  updatePlan = async (subscriptionId: string, planId: string) => {
      let result = await this.execute({
          method:'POST',
          path:`/v1/billing/subscriptions/${subscriptionId}/revise`,
          body:{plan_id: planId}
          });

      return result;
  }
}

export default new PayPal();

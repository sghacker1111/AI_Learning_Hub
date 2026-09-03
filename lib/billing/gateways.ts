import { PaymentGatewayType, TaxBreakdown } from "./types";

export interface GatewayCheckoutPayload {
  gateway: PaymentGatewayType;
  sandbox: true;
  actionUrl: string;
  fields: Record<string, string>;
  instructions: string;
}

export function generateEsewaPayload(
  transactionUuid: string,
  tax: TaxBreakdown,
  productCode: string = "EPAYTEST"
): GatewayCheckoutPayload {
  // eSewa v2 parameters
  const totalAmount = tax.totalAmountNpr.toString();
  return {
    gateway: "ESEWA",
    sandbox: true,
    actionUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    fields: {
      amount: tax.baseAmountNpr.toString(),
      tax_amount: tax.vatAmountNpr.toString(),
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: "https://ailearning.edu.np/api/billing/verify?gateway=esewa&status=success",
      failure_url: "https://ailearning.edu.np/api/billing/verify?gateway=esewa&status=failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: "DEMO_SIGNATURE_NOT_VALID",
    },
    instructions: "Sandbox payload preview only; the signature is intentionally invalid.",
  };
}

export function generateKhaltiPayload(
  transactionUuid: string,
  tax: TaxBreakdown,
  planName: string
): GatewayCheckoutPayload {
  const amountInPaisa = Math.round(tax.totalAmountNpr * 100).toString();

  return {
    gateway: "KHALTI",
    sandbox: true,
    actionUrl: "https://a.khalti.com/api/v2/epayment/initiate/",
    fields: {
      return_url: "https://ailearning.edu.np/api/billing/verify?gateway=khalti",
      website_url: "https://ailearning.edu.np",
      amount: amountInPaisa,
      purchase_order_id: transactionUuid,
      purchase_order_name: `AI Learning Nepal - ${planName}`,
      customer_info: JSON.stringify({ name: "Aarav Sharma", phone: "9841234567" }),
    },
    instructions: "Initializing Khalti v2 E-Payment portal with instant wallet and mobile banking...",
  };
}

export function generateFonepayPayload(
  transactionUuid: string,
  tax: TaxBreakdown
): GatewayCheckoutPayload {
  return {
    gateway: "FONEPAY",
    sandbox: true,
    actionUrl: "https://dev-clientapi.fonepay.com/api/merchantRequest",
    fields: {
      PRN: transactionUuid,
      PID: "MERCHANT_AI_NEPAL",
      AMT: tax.totalAmountNpr.toString(),
      CRN: "NPR",
      DT: new Date().toLocaleDateString("en-CA"),
      R1: "Subscription",
      R2: "AI Learning Nepal",
      MD: "P",
    },
    instructions: "Scan Fonepay Dynamic QR using any Nepal Mobile Banking or Wallets...",
  };
}

export function generateConnectIPSPayload(
  transactionUuid: string,
  tax: TaxBreakdown
): GatewayCheckoutPayload {
  return {
    gateway: "CONNECTIPS",
    sandbox: true,
    actionUrl: "https://uat.connectips.com:7443/connectipswebgw/loginpage",
    fields: {
      MERCHANTID: "AI_NEPAL_01",
      APPID: "AI_LEARN_APP",
      APPNAME: "AI Learning Nepal",
      TXNID: transactionUuid,
      TXNDATE: new Date().toLocaleDateString("en-GB"),
      TXNCRNCY: "NPR",
      TXNAMT: (tax.totalAmountNpr * 100).toString(),
      REFERENCEID: transactionUuid,
      REMARKS: "Student Pro Plan",
      PARTICULARS: "NCHL Settlement",
    },
    instructions: "Connecting to NCHL ConnectIPS Bank-to-Bank direct settlement...",
  };
}

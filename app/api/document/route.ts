import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { getVercelOidcToken } from "@vercel/functions/oidc";
import { ExternalAccountClient } from "google-auth-library";
import { Readable } from "stream";

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID =
  process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

console.log(GCP_PROJECT_ID, GCP_PROJECT_NUMBER, GCP_SERVICE_ACCOUNT_EMAIL);
// Initialize the External Account Client
const authClient = ExternalAccountClient.fromJSON({
  type: "external_account",
  audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
  subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
  token_url: "https://sts.googleapis.com/v1/token",
  service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: {
    // Use the Vercel OIDC token as the subject token
    getSubjectToken: getVercelOidcToken,
  },
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const files: File[] = [];
  for (const entry of formData.entries()) {
    if (entry[1] instanceof File) {
      files.push(entry[1]);
    }
  }
  const oidcToken = await getVercelOidcToken();
  console.log(oidcToken);
  const name = process.env.GOOGLE_CLOUD_PROJECT_NAME;
  const client = new DocumentProcessorServiceClient({
    project: GCP_PROJECT_ID,
    location: "us",
    googleAuthOptions: {
      authClient,
      projectId: GCP_PROJECT_ID,
    },
  });

  const allFieldSet = new Set<string>();

  const processedRows: Record<string, string>[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer()).toString("base64");

    const requestPayload = {
      name,
      rawDocument: {
        content: buffer,
        mimeType: file.type || "application/pdf",
      },
    };

    const [{ document }] = await client.processDocument(requestPayload);
    console.log(document?.entities);
    const rowData: Record<string, string> = {};

    for (const entity of document!.entities!) {
      const type = entity.type?.trim();
      const value = entity.normalizedValue?.text || entity.mentionText || "0";

      if (type) {
        rowData[type] = value;
        allFieldSet.add(type);
      }
    }

    processedRows.push(rowData);
  }

  // Define dynamic field order
  const allFields = Array.from(allFieldSet);
  const middleFields = allFields
    .filter((field) => field !== "Enrollment" && field !== "Total")
    .sort();
  const dynamicFields = ["Enrollment", ...middleFields, "Total"];

  // Create CSV content
  const csvRows = [
    dynamicFields.join(","), // header
    ...processedRows.map((rowData) =>
      dynamicFields
        .map((field) => {
          let value = rowData[field] || "0";
          if (["し", "T", "۱"].includes(value)) value = "1";
          if (["@", "O", "♡"].includes(value)) value = "0";
          return value;
        })
        .join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");
  const stream = Readable.from([csvContent]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Response(stream as any, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=results.csv",
    },
  });
}

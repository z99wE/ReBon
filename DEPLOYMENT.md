# Deploying ReBon to Google Cloud Run

This guide provides instructions on how to safely deploy the ReBon application to Google Cloud Run. The project includes a multi-stage `Dockerfile` which is optimized for production and can be directly used by Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Ensure you have an active GCP project.
2. **Google Cloud SDK**: Install the `gcloud` CLI tool locally and authenticate:
   ```bash
   gcloud auth login
   gcloud config set project [YOUR_PROJECT_ID]
   ```
3. **Billing Enabled**: Make sure billing is enabled for your Google Cloud project.
4. **Cloud Run API Enabled**: Ensure the Cloud Run Admin API is enabled.

## Environment Variables & Secrets

Before deploying, make sure you have the following secrets configured (ideally using Google Cloud Secret Manager to securely pass them to Cloud Run, or setting them as environment variables during deployment):

- `DATABASE_URL`: Your PostgreSQL connection string.
- `SESSION_SECRET`: A secure random string for session signing.
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, etc. (depending on the AI providers you use).

## Deploying

Deploying the service from source is straightforward. Run the following command from the root of your project directory:

```bash
gcloud run deploy rebon \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SESSION_SECRET=your_secure_secret_here,DATABASE_URL=your_db_connection_url_here" \
  --max-instances 3
```

### Explanation of flags:
- `--source .`: Instructs Cloud Build to use the `Dockerfile` in the current directory to build the image before deploying it.
- `--region us-central1`: Specifies the GCP region for your service (choose the one closest to your users or database).
- `--allow-unauthenticated`: Makes your app publicly accessible over the internet.
- `--set-env-vars`: Sets runtime environment variables for the container.
- `--max-instances 3`: Caps the maximum number of container instances to prevent unexpected runaway costs.

## Post-Deployment

Once the deployment finishes, `gcloud` will output a Service URL (e.g., `https://rebon-xxxxx-uc.a.run.app`). 

### Running Database Migrations
Make sure to apply your database migrations. If your database is publicly accessible (e.g., Neon or Supabase), you can simply run migrations from your local machine using:
```bash
npm run db:push
```

If your database is in a private VPC, ensure your Cloud Run service is connected to the same Serverless VPC Access connector.

## Troubleshooting

- **"Red Error" in CI/CD or Local Tests**: If you see `Error: Not implemented: HTMLCanvasElement.prototype.getContext`, this is a `jsdom` testing warning regarding HTML5 Canvas APIs used by charting libraries. **It can be safely ignored** and does not impact your Cloud Run production deployment.
- **500 Server Errors**: Check the Cloud Run Logs (`gcloud beta run services logs tail rebon`) to see if an environment variable (like `DATABASE_URL`) is missing.

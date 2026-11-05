import * as appInsights from 'applicationinsights';

let started = false;
/** Application Insights aktivieren, sobald ein Connection String konfiguriert ist */
export function initTelemetry(): void {
  if (started || !process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) return;
  appInsights.setup().setAutoCollectRequests(true).setAutoCollectExceptions(true).setAutoCollectDependencies(true).setSendLiveMetrics(false).start();
  started = true;
}

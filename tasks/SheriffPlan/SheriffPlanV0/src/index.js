#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { getHandlerFromToken, WebApi } = require('azure-devops-node-api');
const tl = require('azure-pipelines-task-lib/task');
const { getSystemAccessToken } = require('azure-pipelines-tasks-artifacts-common/webapi');

async function getIdToken(connectedService) {
  const jobId = tl.getVariable('System.JobId');
  const planId = tl.getVariable('System.PlanId');
  const projectId = tl.getVariable('System.TeamProjectId');
  const hub = tl.getVariable('System.HostType');
  const uri = tl.getVariable('System.CollectionUri');
  const token = getSystemAccessToken();

  const authHandler = getHandlerFromToken(token);
  const connection = new WebApi(uri, authHandler);
  const api = await connection.getTaskApi();
  const response = await api.createOidcToken({}, projectId, hub, planId, jobId, connectedService);
  if (response == null) {
    return null;
  }

  return response.oidcToken;
}

async function run() {
  try {
    const configDir = tl.getInput('configDir', false);
    const connectedService = tl.getInput('serviceConnectionName', true);
    const mode = tl.getInput('mode', true);

    let subscriptionId = tl.getInput('subscriptionId', false);

    const agentTempDirectory = tl.getVariable('Agent.TempDirectory');

    const env = {};

    const authScheme = tl.getEndpointAuthorizationScheme(connectedService, true);
    if (!subscriptionId) {
      subscriptionId = tl.getEndpointDataParameter(connectedService, 'SubscriptionID', true);
    }

    env.AZURE_SUBSCRIPTION_ID = subscriptionId;

    if (authScheme.toLowerCase() === 'workloadidentityfederation') {
      tl.debug('workload identity federation scheme');
      const servicePrincipalId = tl.getEndpointAuthorizationParameter(connectedService, 'serviceprincipalid', false);
      env.AZURE_CLIENT_ID = servicePrincipalId;

      const tenantId = tl.getEndpointAuthorizationParameter(connectedService, 'tenantid', false);
      env.AZURE_TENANT_ID = tenantId;

      const federatedToken = await getIdToken(connectedService);
      tl.setSecret(federatedToken);

      const federatedTokenFilePath = path.join(agentTempDirectory, 'azure-identity-token');
      fs.writeFileSync(federatedTokenFilePath, federatedToken);
      env.AZURE_FEDERATED_TOKEN_FILE = federatedTokenFilePath;
    } else if (authScheme.toLowerCase() === 'serviceprincipal') {
      tl.debug('service principal scheme');
      const authType = tl.getEndpointAuthorizationParameter(connectedService, 'authenticationType', false);

      const servicePrincipalId = tl.getEndpointAuthorizationParameter(connectedService, 'serviceprincipalid', false);
      env.AZURE_CLIENT_ID = servicePrincipalId;

      const tenantId = tl.getEndpointAuthorizationParameter(connectedService, 'tenantid', false);
      env.AZURE_TENANT_ID = tenantId;

      if (authType === 'spnCertificate') {
        tl.debug('certificate based endpoint');
        throw new Error('certificate based service principal scheme not implemented');
      } else {
        tl.debug('key based endpoint');
        const servicePrincipalKey = tl.getEndpointAuthorizationParameter(connectedService, 'serviceprincipalkey', false);
        env.AZURE_CLIENT_SECRET = servicePrincipalKey;
      }
    } else if (authScheme.toLowerCase() === 'managedserviceidentity') {
      tl.debug('managed service identity scheme');
      throw new Error('managed service identity scheme not implemented');
    } else {
      throw new Error(`Authentication scheme ${authScheme} is not supported`);
    }

    await tl.execAsync(
      'sheriff',
      [
        'plan',
        mode,
        configDir ? '--config-dir' : '',
        configDir,
        '--subscription-id',
        subscriptionId,
      ],
      {
        env: {
          ...process.env,
          ...env,
        },
        silent: false,
      },
    );

    tl.setResult(tl.TaskResult.Succeeded, 'Success');
  } catch (err) {
    if (err instanceof Error) {
      tl.setResult(tl.TaskResult.Failed, err.message);
    } else {
      tl.setResult(tl.TaskResult.Failed, 'Unknown error');
    }
  }
}

run();

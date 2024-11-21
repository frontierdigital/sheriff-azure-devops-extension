#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const tl = require('azure-pipelines-task-lib/task');
const { promisify } = require('util');

const finished = promisify(stream.finished);

async function run() {
  try {
    const version = tl.getInput('version', true);

    const agentOS = tl.getVariable('Agent.OS');
    const agentOSArchitecture = tl.getVariable('Agent.OSArchitecture');
    const agentTempDirectory = tl.getVariable('Agent.TempDirectory');
    const agentToolsDirectory = tl.getVariable('Agent.ToolsDirectory');

    let os;
    if (agentOS === 'Windows_NT') {
      os = 'Windows';
    } else {
      os = agentOS;
    }

    let platform;
    if (agentOSArchitecture === 'X64' || agentOSArchitecture === 'X86') {
      platform = 'x86_64';
    } else {
      platform = agentOSArchitecture;
    }

    let fileExtension;
    if (os === 'Windows') {
      fileExtension = 'zip';
    } else {
      fileExtension = 'tar.gz';
    }

    let downloadUrl;
    if (version === 'latest') {
      downloadUrl = `https://releases.frontierhq.com/sheriff/latest/sheriff_${os}_${platform}.${fileExtension}`;
    } else {
      downloadUrl = `https://releases.frontierhq.com/sheriff/${version}/sheriff_${os}_${platform}.${fileExtension}`;
    }
    const downloadPath = path.join(agentTempDirectory, `sheriff_${os}_${platform}.${fileExtension}`);
    const toolDirPath = `${agentToolsDirectory}/sheriff/${version}/${platform}`;

    tl.debug(`Download URL: ${downloadUrl}`);
    tl.debug(`Download path: ${downloadPath}`);
    tl.debug(`Tool directory path: ${toolDirPath}`);

    const writer = fs.createWriteStream(downloadPath);

    const client = axios.create();
    client.interceptors.request.use((request) => {
      tl.debug(`Axios request: ${request.method} ${request.url} `);
      return request;
    });
    client.interceptors.response.use((response) => {
      tl.debug(`Axios response: ${response.status} ${response.statusText}`);
      return response;
    });

    await client({
      url: downloadUrl,
      method: 'get',
      responseType: 'stream',
    }).then((response) => {
      response.data.pipe(writer);
      return finished(writer);
    });

    tl.mkdirP(toolDirPath);
    await tl.execAsync('tar', ['-xf', downloadPath, '-C', toolDirPath]);

    // eslint-disable-next-line no-console
    console.log(`##vso[task.prependpath]${toolDirPath}`);

    await tl.execAsync(path.join(toolDirPath, 'sheriff'), ['version']);

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

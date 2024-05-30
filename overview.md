# Sheriff Azure DevOps Extension

## About

This is an Azure DevOps extension that provides tasks for installing and running
[Sheriff](https://github.com/frontierhq/sheriff), a command line tool to
manage Microsoft Entra Privileged Identity Management (Microsoft Entra PIM)
using desired state configuration.

## Usage

### InstallSheriffCLI task

This task installs the Sheriff CLI on the agent. The ``version`` input accepts either
``latest`` or a specific version number in the format ``vA.B.C``, e.g. ``v0.1.0``.

```yaml
- task: InstallSheriffCLI@0
  displayName: Install Sheriff CLI
  inputs:
    version: latest
```

### SheriffPlan task

This task runs Sheriff in plan mode, equivalent to running `sheriff plan [mode]`.

```yaml
- task: SheriffPlan@0
  displayName: Plan Sheriff changes
  inputs:
    configDir: $(System.DefaultWorkingDirectory)/.config
    mode: azurerm
    serviceConnectionName: <service connection name>

```

### SheriffApply task

This task runs Sheriff in apply mode, equivalent to running ``sheriff apply [mode]``.

```yaml
- task: SheriffApply@0
  displayName: Apply Sheriff changes
  inputs:
    configDir: $(System.DefaultWorkingDirectory)/.config
    mode: azurerm
    serviceConnectionName: <service connection name>

```

## Contributing

We welcome contributions to this repository. Please see [CONTRIBUTING.md](https://github.com/frontierhq/sheriff-azure-devops-extension/tree/main/CONTRIBUTING.md) for more information.
